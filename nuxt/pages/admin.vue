<script setup>
// Admin panel: changelog + downloads CRUD. All state comes from /api/* at runtime,
// so this is client-only — no prerender fetch. Auth is a signed cookie set by /api/login.
useHead({
  title: 'Admin - Annnekkk Checker',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const PLATFORMS = [
  ['windows-x64.exe', 'Windows x64'],
  ['windows-arm64.exe', 'Windows ARM64'],
  ['macos-arm64.dmg', 'macOS ARM64'],
  ['macos-x64.dmg', 'macOS x64'],
  ['linux-x64', 'Linux x64'],
]
const fmtSize = (b) => (b ? (b / 1048576).toFixed(1) + ' MB' : '')
const suffixOf = (name) => PLATFORMS.map((p) => p[0]).find((s) => name.endsWith(s)) || null

const authed = ref(false)
const pw = ref('')
const loginMsg = ref(null) // { ok, text }

// changelog form
const cl = reactive({ version: '', date: '', new: '', improved: '', fixed: '', breaking: '' })
const saveMsg = ref(null)
const clVersions = ref([])

// downloads form
const dl = reactive({ version: '', name: '', prefix: '' })
const dlMsg = ref(null)
const dlVersions = ref([])
const dlFilesInput = ref(null) // <input type=file multiple>

async function login() {
  try {
    await $fetch('/api/login', { method: 'POST', body: { password: pw.value } })
    enter()
  } catch {
    loginMsg.value = { ok: false, text: 'Wrong password' }
  }
}

async function logout() {
  await $fetch('/api/logout', { method: 'POST' })
  authed.value = false
}

function enter() {
  authed.value = true
  loadChangelog()
  loadDownloads()
}

// ── changelog ──
async function loadChangelog() {
  clVersions.value = (await $fetch('/api/changelog')).versions || []
}

function editChangelog(v) {
  cl.version = v.version
  cl.date = v.date || ''
  for (const k of ['new', 'improved', 'fixed', 'breaking']) cl[k] = (v[k] || []).join('\n')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveChangelog() {
  try {
    const d = await $fetch('/api/changelog', { method: 'POST', body: { ...cl } })
    saveMsg.value = { ok: true, text: 'Saved version ' + d.entry.version }
    loadChangelog()
  } catch (e) {
    saveMsg.value = { ok: false, text: e.data?.error || 'Error' }
  }
}

async function delChangelog(version) {
  if (!confirm('Delete version ' + version + '?')) return
  await $fetch('/api/changelog/' + encodeURIComponent(version), { method: 'DELETE' })
  loadChangelog()
}

// ── downloads ──
async function loadDownloads() {
  dlVersions.value = (await $fetch('/api/downloads')).versions || []
}

async function putFile(version, suffix, file) {
  const fd = new FormData()
  fd.append('suffix', suffix)
  fd.append('file', file)
  // $fetch returns parsed body on 2xx and throws on error; normalize to {ok,data}.
  try {
    const data = await $fetch('/api/downloads/' + encodeURIComponent(version) + '/file', { method: 'POST', body: fd })
    return { ok: true, data }
  } catch (e) {
    return { ok: false, data: e.data || {} }
  }
}

async function saveDownload() {
  if (!dl.version.trim()) {
    dlMsg.value = { ok: false, text: 'Version is required' }
    return
  }
  try {
    await $fetch('/api/downloads', { method: 'POST', body: { version: dl.version.trim(), name: dl.name, prefix: dl.prefix } })
  } catch (e) {
    dlMsg.value = { ok: false, text: e.data?.error || 'Error saving version' }
    return
  }

  const files = [...(dlFilesInput.value?.files || [])]
  if (!files.length) {
    dlMsg.value = { ok: true, text: 'Version saved. Upload builds below or pick files above.' }
    return loadDownloads()
  }

  const uploaded = []
  const skipped = []
  dlMsg.value = { ok: true, text: `Uploading ${files.length} file(s)…` }
  for (const file of files) {
    const suffix = suffixOf(file.name)
    if (!suffix) {
      skipped.push(file.name)
      continue
    }
    const res = await putFile(dl.version.trim(), suffix, file)
    ;(res.ok ? uploaded : skipped).push(res.ok ? suffix : file.name)
  }
  if (dlFilesInput.value) dlFilesInput.value.value = ''
  const text = `Uploaded ${uploaded.length} file(s)` + (skipped.length ? ` — skipped (unrecognized name): ${skipped.join(', ')}` : '')
  dlMsg.value = { ok: skipped.length === 0, text }
  loadDownloads()
}

// Open the hidden per-row file input. IDs are unique per version+suffix.
function pickFile(version, suffix) {
  document.getElementById(`f-${version}-${suffix}`)?.click()
}

// Per-row single-file upload. The hidden <input> is clicked, then this fires on change.
async function uploadFile(version, suffix, event) {
  const file = event.target.files[0]
  if (!file) return
  dlMsg.value = { ok: true, text: 'Uploading ' + suffix + '…' }
  const res = await putFile(version, suffix, file)
  dlMsg.value = res.ok
    ? { ok: true, text: 'Uploaded ' + suffix + ' (' + fmtSize(res.data.size) + ')' }
    : { ok: false, text: res.data.error || 'Upload failed' }
  event.target.value = ''
  loadDownloads()
}

async function delFile(version, suffix) {
  await $fetch('/api/downloads/' + encodeURIComponent(version) + '/file/' + encodeURIComponent(suffix), { method: 'DELETE' })
  loadDownloads()
}

async function delDownload(version) {
  if (!confirm('Delete version ' + version + ' and all its files?')) return
  await $fetch('/api/downloads/' + encodeURIComponent(version), { method: 'DELETE' })
  loadDownloads()
}

onMounted(async () => {
  if ((await $fetch('/api/me')).admin) enter()
})
</script>

<template>
  <div class="admin-wrap">
    <h1>Admin</h1>

    <div v-if="!authed" id="login">
      <label for="pw">Password</label>
      <input id="pw" v-model="pw" type="password" @keydown.enter="login" />
      <button class="btn btn-primary" @click="login">Log in</button>
      <div v-if="loginMsg" class="msg" :class="loginMsg.ok ? 'ok' : 'err'">{{ loginMsg.text }}</div>
    </div>

    <div v-else>
      <p style="text-align:right">
        <a href="#" @click.prevent="logout">Logout</a>
      </p>

      <p>Add or edit a changelog version. One item per line.</p>
      <label for="version">Version *</label>
      <input id="version" v-model="cl.version" placeholder="2.0.22" />
      <label for="date">Date</label>
      <input id="date" v-model="cl.date" placeholder="July 9th, 2026" />
      <label for="new">✨ New Features</label>
      <textarea id="new" v-model="cl.new" />
      <label for="improved">🔧 Improvements</label>
      <textarea id="improved" v-model="cl.improved" />
      <label for="fixed">🐛 Bug Fixes</label>
      <textarea id="fixed" v-model="cl.fixed" />
      <label for="breaking">💥 Breaking Changes</label>
      <textarea id="breaking" v-model="cl.breaking" />
      <button class="btn btn-primary" @click="saveChangelog">Save version</button>
      <div v-if="saveMsg" class="msg" :class="saveMsg.ok ? 'ok' : 'err'">{{ saveMsg.text }}</div>

      <div class="existing">
        <h2>Existing versions</h2>
        <p v-if="!clVersions.length">None yet.</p>
        <div v-for="v in clVersions" v-else :key="v.version" class="row">
          <span>Version {{ v.version }} {{ v.isLatest ? '(latest)' : '' }} — {{ v.date || '' }}</span>
          <span>
            <button class="load" @click="editChangelog(v)">Edit</button>
            <button @click="delChangelog(v.version)">Delete</button>
          </span>
        </div>
      </div>

      <hr style="margin:2.5rem 0;border:none;border-top:1px solid var(--ctp-surface1,#45475a)" />

      <h2>Downloads</h2>
      <p>Create a version, then upload a build for each platform. One app per version.</p>
      <label for="dlVersion">Version *</label>
      <input id="dlVersion" v-model="dl.version" placeholder="2.0.22" />
      <label for="dlName">App name</label>
      <input id="dlName" v-model="dl.name" placeholder="Annnekkk Checker" />
      <label for="dlPrefix">File prefix</label>
      <input id="dlPrefix" v-model="dl.prefix" placeholder="Gate-Rent" />
      <div class="hint">Files are saved as prefix-version-platform, e.g. Gate-Rent-2.0.22-windows-x64.exe</div>
      <label for="dlFiles">Builds (optional — pick several at once)</label>
      <input id="dlFiles" ref="dlFilesInput" type="file" multiple />
      <div class="hint">
        Platform is auto-detected from each filename (must end with windows-x64.exe, windows-arm64.exe, macos-arm64.dmg,
        macos-x64.dmg, or linux-x64).
      </div>
      <button class="btn btn-primary" @click="saveDownload">Create / update version &amp; upload</button>
      <div v-if="dlMsg" class="msg" :class="dlMsg.ok ? 'ok' : 'err'">{{ dlMsg.text }}</div>

      <div class="existing">
        <p v-if="!dlVersions.length">None yet.</p>
        <div v-for="v in dlVersions" v-else :key="v.version" class="row" style="flex-direction:column;align-items:stretch">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>v{{ v.version }} {{ v.isLatest ? '(latest)' : '' }} — {{ v.apps[0].name }} [{{ v.apps[0].prefix }}]</strong>
            <button @click="delDownload(v.version)">Delete version</button>
          </div>
          <div v-for="[suffix, label] in PLATFORMS" :key="suffix" class="row" style="margin-left:1.5rem">
            <span>
              {{ label }}
              <template v-if="(v.apps[0].files || {})[suffix]">✓ {{ fmtSize(v.apps[0].files[suffix]) }}</template>
              <span v-else style="opacity:.5">— no file</span>
            </span>
            <span>
              <input
                :id="`f-${v.version}-${suffix}`"
                type="file"
                style="display:none"
                @change="uploadFile(v.version, suffix, $event)"
              />
              <button class="load" @click="pickFile(v.version, suffix)">Upload</button>
              <button v-if="(v.apps[0].files || {})[suffix]" @click="delFile(v.version, suffix)">Remove</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-wrap { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem; color: var(--ctp-text, #cdd6f4); }
.admin-wrap h1, .admin-wrap h2 { color: var(--ctp-text, #cdd6f4); }
.admin-wrap p { color: var(--ctp-subtext0, #a6adc8); }
.admin-wrap label { display: block; margin: 1rem 0 .35rem; font-weight: 600; color: var(--ctp-subtext1, #bac2de); }
.admin-wrap input, .admin-wrap textarea {
  width: 100%; padding: .7rem .9rem; border-radius: 10px;
  border: 1px solid var(--ctp-surface1, #45475a);
  background: var(--ctp-mantle, #181825); color: var(--ctp-text, #cdd6f4);
  font-family: inherit; font-size: 1rem; box-sizing: border-box;
}
.admin-wrap textarea { min-height: 90px; resize: vertical; }
.admin-wrap .hint { color: var(--ctp-subtext0, #a6adc8); font-size: .85rem; margin-top: .25rem; }
.admin-wrap .btn { margin-top: 1.4rem; cursor: pointer; border: none; }
.msg { margin-top: 1rem; padding: .8rem 1rem; border-radius: 10px; }
.msg.ok { background: rgba(166,227,161,.15); color: var(--ctp-green, #a6e3a1); }
.msg.err { background: rgba(243,139,168,.15); color: var(--ctp-red, #f38ba8); }
.existing { margin-top: 2.5rem; }
.existing .row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: .6rem .9rem; border-radius: 10px;
  background: var(--ctp-mantle, #181825); margin-bottom: .5rem;
}
.existing .row button {
  background: transparent; border: 1px solid var(--ctp-red, #f38ba8);
  color: var(--ctp-red, #f38ba8); border-radius: 8px; padding: .3rem .7rem; cursor: pointer;
}
.row .load { border-color: var(--ctp-blue, #89b4fa); color: var(--ctp-blue, #89b4fa); }
#login { max-width: 420px; }
</style>
