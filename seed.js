// One-shot: import changelog/V*/ text files into MongoDB. Safe to re-run (upsert).
import { MongoClient } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.existsSync(p)
  ? fs.readFileSync(p, 'utf8').split('\n').map(s => s.trim()).filter(Boolean) : [];
const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory()) : [];

const SUFFIXES = ['windows-x64.exe', 'windows-arm64.exe', 'macos-arm64.dmg', 'macos-x64.dmg', 'linux-x64'];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB);
const changelog = db.collection('changelog');
const downloads = db.collection('downloads');
await changelog.createIndex({ version: 1 }, { unique: true });
await downloads.createIndex({ version: 1 }, { unique: true });

// changelog
let c = 0;
const clDir = path.join(root, 'changelog');
for (const folder of dirs(clDir)) {
  const base = path.join(clDir, folder);
  const version = folder.replace(/^[vV]/, '');
  await changelog.replaceOne({ version }, {
    version,
    date: (read(path.join(base, 'date.txt'))[0] || ''),
    new: read(path.join(base, 'new.txt')),
    improved: read(path.join(base, 'improved.txt')),
    fixed: read(path.join(base, 'fixed.txt')),
    breaking: read(path.join(base, 'breaking.txt')),
  }, { upsert: true });
  c++;
}

// downloads: detect prefix + file sizes from files on disk
let d = 0;
const dlDir = path.join(root, 'downloads');
for (const folder of dirs(dlDir)) {
  if (folder.startsWith('_')) continue;
  const base = path.join(dlDir, folder);
  const version = folder.replace(/^[vV]/, '');
  const files = {};
  let prefix = 'Gate-Rent';
  for (const suffix of SUFFIXES) {
    const match = fs.readdirSync(base).find(f => f.endsWith(suffix));
    if (!match) continue;
    files[suffix] = fs.statSync(path.join(base, match)).size;
    prefix = match.slice(0, match.indexOf(`-${version}-`)) || prefix;
  }
  await downloads.replaceOne({ version }, {
    version, name: 'Annnekkk Checker', prefix, iconColor: '#89b4fa', files,
  }, { upsert: true });
  d++;
}

console.log(`Seeded ${c} changelog + ${d} download versions.`);
await client.close();
