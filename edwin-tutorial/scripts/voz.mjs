// Voz del tutorial: escribe guion.md (un "## Bloque N" por paso, con el texto de "voz" de tutorial.json)
// y, con --local, genera assets/audio/NN.wav gratis con Kokoro (npx hyperframes tts, voz en español).
// Para la voz del creador en ElevenLabs (💲, con aprobación) se usa el voz.ts de edwin-motion sobre la
// misma carpeta: deja assets/audio/NN.mp3, que armar.mjs prefiere sobre los .wav.
//
// Uso (desde la carpeta del tutorial):
//   node <skill>/scripts/voz.mjs [--local] [--voz ef_dora]
//   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE=... npx tsx <edwin-motion>/scripts/voz.ts . [--contar]
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const VOZ = args.includes('--voz') ? args[args.indexOf('--voz') + 1] : 'ef_dora';
const T = JSON.parse(fs.readFileSync('tutorial.json', 'utf8'));
const vacios = T.pasos.map((p, i) => (p.voz?.trim() ? null : i + 1)).filter(Boolean);
if (vacios.length) throw new Error(`Pasos sin "voz": ${vacios.join(', ')}`);

fs.writeFileSync('guion.md', `# ${T.titulo}\n\n` + T.pasos.map((p, i) => `## Bloque ${i + 1} — ${p.titulo}\n\n> ${p.voz.trim()}\n`).join('\n'));
console.log('guion.md:', T.pasos.reduce((s, p) => s + p.voz.trim().length, 0), 'caracteres');

if (args.includes('--local')) {
  fs.mkdirSync('assets/audio', { recursive: true });
  T.pasos.forEach((p, i) => {
    const n = String(i + 1).padStart(2, '0');
    const txt = `assets/audio/${n}.txt`;
    if (fs.existsSync(`assets/audio/${n}.wav`) && fs.existsSync(txt) && fs.readFileSync(txt, 'utf8') === p.voz.trim()) return; // ya está con este texto
    fs.writeFileSync(`assets/audio/${n}.txt`, p.voz.trim()); // la CLI recibe el texto en archivo (tildes intactas)
    execSync(`npx --yes hyperframes@0.8.172 tts assets/audio/${n}.txt -v ${VOZ} -o assets/audio/${n}.wav`, { stdio: ['ignore', 'ignore', 'inherit'] });
    console.log(n, 'listo');
  });
}
