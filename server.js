import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import { MongoClient } from 'mongodb';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const DOWNLOADS = path.join(__dirname, 'downloads');

// Fixed platform list (mirrors old downloads-data.js). Suffix = filename tail + files key.
const PLATFORMS = [
  { name: 'Windows x64',   suffix: 'windows-x64.exe',   description: 'For 64-bit Windows systems',   icon: 'windows' },
  { name: 'Windows ARM64', suffix: 'windows-arm64.exe', description: 'For ARM64 Windows systems',    icon: 'windows' },
  { name: 'macOS ARM64',   suffix: 'macos-arm64.dmg',   description: 'For Apple Silicon (M1/M2/M3)',  icon: 'macos' },
  { name: 'macOS x64',     suffix: 'macos-x64.dmg',     description: 'For Intel-based Macs',          icon: 'macos' },
  { name: 'Linux x64',     suffix: 'linux-x64',         description: 'For 64-bit Linux systems',      icon: 'linux' },
];
const SUFFIXES = new Set(PLATFORMS.map(p => p.suffix));

const { MONGODB_URI, MONGODB_DB, ADMIN_PASSWORD, PORT = 1836 } = process.env;
if (!MONGODB_URI || !ADMIN_PASSWORD) {
  console.error('Missing MONGODB_URI or ADMIN_PASSWORD in .env');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db(MONGODB_DB);
const changelog = db.collection('changelog');
await changelog.createIndex({ version: 1 }, { unique: true });
const downloads = db.collection('downloads');
await downloads.createIndex({ version: 1 }, { unique: true });

const app = Fastify({ bodyLimit: 256 * 1024 });

// Reject path traversal before any routing. Static serving decodes %2e%2e -> '..',
// which can smuggle traversal past prefix checks; catch the decoded form here.
app.addHook('onRequest', (req, reply, done) => {
  let decoded;
  try { decoded = decodeURIComponent(req.url.split('?')[0]); } catch { return reply.code(400).send('Bad request'); }
  if (decoded.includes('..')) return reply.code(400).send('Bad request');
  done();
});

// multipart has its own size limit; the global bodyLimit doesn't apply to streamed parts.
await app.register(multipart, { limits: { fileSize: 500 * 1024 * 1024, files: 1 } });

// ── static site from public/ ──
await app.register(fastifyStatic, {
  root: PUBLIC,
  extensions: ['html'],
  cacheControl: false, // let setHeaders own the header; the lib's default would override it
  // ponytail: 1-day cache on assets, none on html; fingerprinted filenames if staleness ever bites.
  setHeaders: (res, p) => {
    res.setHeader('Cache-Control', p.endsWith('.html') ? 'public, max-age=0' : 'public, max-age=86400');
  },
});

// ── admin auth: signed cookie, no session store needed ──
// ponytail: HMAC cookie over the password hash; rotate ADMIN_PASSWORD to invalidate.
const secret = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
const makeToken = () => {
  const body = `admin.${Date.now()}`;
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `${body}.${sig}`;
};
const validToken = (tok) => {
  if (!tok) return false;
  const i = tok.lastIndexOf('.');
  const body = tok.slice(0, i), sig = tok.slice(i + 1);
  if (!body || !sig) return false;
  const good = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return sig.length === good.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
};
const parseCookie = (req) =>
  Object.fromEntries((req.headers.cookie || '').split(';').map(c => {
    const [k, ...v] = c.trim().split('=');
    return [k, decodeURIComponent(v.join('='))];
  }));
const requireAdmin = (req, reply, done) =>
  validToken(parseCookie(req).admin) ? done() : reply.code(401).send({ error: 'unauthorized' });
const admin = { preHandler: requireAdmin };

// ── public API ──
const sortVersions = (a, b) =>
  b.version.localeCompare(a.version, undefined, { numeric: true });

app.get('/api/changelog', async () => {
  const versions = (await changelog.find({}, { projection: { _id: 0 } }).toArray()).sort(sortVersions);
  if (versions.length) { versions.forEach(v => v.isLatest = false); versions[0].isLatest = true; }
  return { versions };
});

// ── admin API ──
app.post('/api/login', (req, reply) => {
  const ok = typeof req.body?.password === 'string' &&
    req.body.password.length === ADMIN_PASSWORD.length &&
    crypto.timingSafeEqual(Buffer.from(req.body.password), Buffer.from(ADMIN_PASSWORD));
  if (!ok) return reply.code(401).send({ error: 'wrong password' });
  reply.header('Set-Cookie',
    `admin=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
  return reply.send({ ok: true });
});

app.post('/api/logout', (_req, reply) => {
  reply.header('Set-Cookie', 'admin=; HttpOnly; Path=/; Max-Age=0');
  return reply.send({ ok: true });
});

app.get('/api/me', (req) => ({ admin: validToken(parseCookie(req).admin) }));

const clean = (arr) => Array.isArray(arr)
  ? arr.map(s => String(s).trim()).filter(Boolean)
  : String(arr || '').split('\n').map(s => s.trim()).filter(Boolean);

app.post('/api/changelog', admin, async (req, reply) => {
  const version = String(req.body?.version || '').trim();
  if (!version) return reply.code(400).send({ error: 'version required' });
  const entry = {
    version,
    date: String(req.body?.date || '').trim(),
    new: clean(req.body?.new),
    improved: clean(req.body?.improved),
    fixed: clean(req.body?.fixed),
    breaking: clean(req.body?.breaking),
  };
  await changelog.replaceOne({ version }, entry, { upsert: true });
  return { ok: true, entry };
});

app.delete('/api/changelog/:version', admin, async (req) => {
  await changelog.deleteOne({ version: req.params.version });
  return { ok: true };
});

// ── downloads ──
// Metadata (version, prefix, per-platform file sizes) lives in Mongo; the actual
// binaries stay on disk under downloads/V<version>/. ponytail: files on disk, not
// in Mongo — a 40MB blob has no business in a document DB, and static serving is free.
const fileName = (prefix, version, suffix) => `${prefix}-${version}-${suffix}`;

app.get('/api/downloads', async () => {
  const docs = (await downloads.find({}, { projection: { _id: 0 } }).toArray()).sort(sortVersions);
  // Reshape to the {version, apps:[{name,prefix,iconColor,files}]} shape downloads.js renders.
  const versions = docs.map((d, i) => ({
    version: d.version,
    isLatest: i === 0,
    apps: [{ name: d.name, prefix: d.prefix, iconColor: d.iconColor, files: d.files || {} }],
  }));
  return { versions, platforms: PLATFORMS };
});

app.post('/api/downloads', admin, async (req, reply) => {
  const version = String(req.body?.version || '').trim();
  if (!version) return reply.code(400).send({ error: 'version required' });
  const prefix = String(req.body?.prefix || 'Gate-Rent').trim() || 'Gate-Rent';
  const name = String(req.body?.name || 'Annnekkk Checker').trim();
  const iconColor = String(req.body?.iconColor || '#89b4fa').trim();
  await downloads.updateOne(
    { version },
    { $set: { name, prefix, iconColor }, $setOnInsert: { version, files: {} } },
    { upsert: true }
  );
  return { ok: true };
});

app.post('/api/downloads/:version/file', admin, async (req, reply) => {
  const version = req.params.version;
  const part = await req.file();
  if (!part) return reply.code(400).send({ error: 'no file' });
  // admin.html appends 'suffix' before 'file', so it's parsed by the time the file part arrives.
  const suffix = String(part.fields.suffix?.value || '');
  if (!SUFFIXES.has(suffix)) { part.file.resume(); return reply.code(400).send({ error: 'bad platform suffix' }); }
  const doc = await downloads.findOne({ version });
  if (!doc) { part.file.resume(); return reply.code(404).send({ error: 'create the version first' }); }

  const dir = path.join(DOWNLOADS, `V${version}`);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, fileName(doc.prefix, version, suffix));
  await pipeline(part.file, fs.createWriteStream(dest));
  if (part.file.truncated) { fs.rmSync(dest, { force: true }); return reply.code(400).send({ error: 'file too large' }); }
  const size = fs.statSync(dest).size;
  await downloads.updateOne({ version }, { $set: { [`files.${suffix}`]: size } });
  return { ok: true, size };
});

app.delete('/api/downloads/:version/file/:suffix', admin, async (req) => {
  const { version, suffix } = req.params;
  const doc = await downloads.findOne({ version });
  if (doc) {
    fs.rmSync(path.join(DOWNLOADS, `V${version}`, fileName(doc.prefix, version, suffix)), { force: true });
    await downloads.updateOne({ version }, { $unset: { [`files.${suffix}`]: '' } });
  }
  return { ok: true };
});

app.delete('/api/downloads/:version', admin, async (req) => {
  const version = req.params.version;
  fs.rmSync(path.join(DOWNLOADS, `V${version}`), { recursive: true, force: true });
  await downloads.deleteOne({ version });
  return { ok: true };
});

// ── download binaries: attachment header forces a clean download; sendFile keeps
// Range support so download managers can resume. basename() strips traversal. ──
app.get('/downloads/:version/:file', (req, reply) => {
  const { version, file } = req.params;
  reply.header('Content-Disposition', `attachment; filename="${path.basename(file)}"`);
  return reply.sendFile(`${path.basename(version)}/${path.basename(file)}`, DOWNLOADS);
});

// clean URL -> the .html page, with or without trailing slash.
// Nuxt prerenders both downloads.html AND a downloads/ dir (holding _payload.json);
// the dir shadows the .html in static serving, so a bare /downloads 404s. Register
// only the known pretty-URL pages so the static wildcard still owns everything else
// (/index.html, /robots.txt, binaries, assets).
const PAGES = ['downloads', 'changelog', 'pricing'];
for (const p of PAGES) {
  const handler = (_req, reply) => reply.sendFile(`${p}.html`);
  app.get(`/${p}`, handler);
  app.get(`/${p}/`, handler);
}

await app.listen({ port: Number(PORT), host: '0.0.0.0' });
console.log(`http://localhost:${PORT}`);
