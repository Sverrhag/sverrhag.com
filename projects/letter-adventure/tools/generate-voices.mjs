// Records every spoken phrase in Letter Adventure with Google Cloud
// Text-to-Speech and saves the clips as audio/<lang>/v<1-5>/<id>.mp3.
//
// The API key is read from the GOOGLE_TTS_KEY environment variable, or from a
// file named by GOOGLE_TTS_KEY_FILE. It is never written to the repository.
//
//   node tools/generate-voices.mjs --list sv-SE      list available voices
//   node tools/generate-voices.mjs                   record everything missing
//   node tools/generate-voices.mjs --lang sv --voice 2
//   node tools/generate-voices.mjs --force           re-record everything
//
// A clip is skipped when it already exists with the same text and voice, so
// the script can be re-run after editing phrases.js.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { LANGS, clipList } = createRequire(import.meta.url)(join(root, 'phrases.js'));

// Five voices per language: unicorn, ladybug, owl, bear, fox.
const VOICES = JSON.parse(readFileSync(join(here, 'voices.json'), 'utf8'));

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf('--' + name); return i < 0 ? null : (args[i + 1] ?? true); };
const key = (process.env.GOOGLE_TTS_KEY || (process.env.GOOGLE_TTS_KEY_FILE && readFileSync(process.env.GOOGLE_TTS_KEY_FILE, 'utf8')) || '').trim();
if (!key) { console.error('Set GOOGLE_TTS_KEY or GOOGLE_TTS_KEY_FILE.'); process.exit(1); }
const API = 'https://texttospeech.googleapis.com/v1';
const headers = { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key };

if (opt('list')) {
  const r = await fetch(`${API}/voices?languageCode=${opt('list')}`, { headers });
  if (!r.ok) { console.error(r.status, await r.text()); process.exit(1); }
  for (const v of (await r.json()).voices) console.log(v.name.padEnd(34), v.ssmlGender);
}

// Stay under the per-minute request quota: at most one request every 500 ms.
let slot = 0;
async function throttle() {
  const now = Date.now();
  slot = Math.max(slot + 500, now);
  if (slot > now) await new Promise(s => setTimeout(s, slot - now));
}

async function synth(text, lang, voice) {
  for (let attempt = 0; ; attempt++) {
    await throttle();
    const r = await fetch(`${API}/text:synthesize`, {
      method: 'POST', headers,
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: LANGS[lang].code, name: voice.name },
        audioConfig: { audioEncoding: 'MP3', speakingRate: voice.rate ?? 1, sampleRateHertz: 24000 },
      }),
    });
    if (r.ok) return Buffer.from((await r.json()).audioContent, 'base64');
    if ((r.status === 429 || r.status >= 500) && attempt < 8) { await new Promise(s => setTimeout(s, 20000)); continue; }
    throw new Error(`${r.status} ${await r.text()}`);
  }
}

let made = 0, kept = 0, chars = 0;
for (const lang of opt('list') ? [] : Object.keys(LANGS)) {
  if (opt('lang') && opt('lang') !== lang) continue;
  for (let vi = 0; vi < 5; vi++) {
    if (opt('voice') && +opt('voice') !== vi + 1) continue;
    const voice = VOICES[lang][vi];
    const dir = join(root, 'audio', lang, `v${vi + 1}`);
    mkdirSync(dir, { recursive: true });
    const manifestPath = join(dir, 'manifest.json');
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
    const todo = clipList(lang, vi).filter(([id, text]) => {
      const same = manifest[id] === `${voice.name}|${voice.rate ?? 1}|${text}` && existsSync(join(dir, id + '.mp3'));
      if (same && !opt('force')) { kept++; return false; }
      return true;
    });
    console.log(`${lang} v${vi + 1} ${voice.name}: ${todo.length} clips to record`);
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (next < todo.length) {
        const [id, text] = todo[next++];
        writeFileSync(join(dir, id + '.mp3'), await synth(text, lang, voice));
        manifest[id] = `${voice.name}|${voice.rate ?? 1}|${text}`;
        made++; chars += text.length;
        if (made % 20 === 0) writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
      }
    }));
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  }
}
if (!opt('list')) console.log(`Recorded ${made} clips (${chars} characters), kept ${kept}.`);
