// Narración con ElevenLabs: un mp3 + NN.words.json (segundo de inicio/fin de cada palabra) por bloque
// del guion. Los bloques son las secciones "## Bloque N — ..." de guion.md; se narran solo las líneas
// que empiezan con ">" (las etiquetas entre corchetes, como [excited], las interpreta eleven_v3/v4).
// Cachea: si el mp3 de un bloque ya existe no lo regenera (bórralo para rehacer solo ese bloque).
// CUESTA CRÉDITOS: corre primero con --contar para ver cuántos caracteres vas a gastar.
//
// Uso:  ELEVENLABS_API_KEY=... ELEVENLABS_VOICE=<voice_id> npx tsx scripts/voz.ts guiones/<slug> [--contar]
import fs from "fs";
import path from "path";

const DIR = process.argv[2];
if (!DIR) throw new Error("Uso: npx tsx scripts/voz.ts guiones/<slug> [--contar]");
const OUT = path.join(DIR, "assets", "audio");
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_v4"; // prueba v3 y v4 con tu voz: el acento puede cambiar
// Pronunciación: lo que la voz lee mal se reescribe solo para el audio (en pantalla queda el original).
const PRONUNCIA: [RegExp, string][] = [];

function bloques() {
  const md = fs.readFileSync(path.join(DIR, "guion.md"), "utf8");
  return md.split(/^## Bloque /m).slice(1).map((parte) => ({
    n: parseInt(parte, 10),
    texto: parte.split("\n").filter((l) => l.startsWith(">")).map((l) => l.replace(/^> ?/, ""))
      .join("\n").replace(/([^\n])\n(?!\n)/g, "$1 ").trim(),
  }));
}

function palabras(a: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }) {
  const words: { text: string; start: number; end: number }[] = [];
  let buf = "", ini = 0;
  const cerrar = (fin: number) => { if (buf) words.push({ text: buf, start: ini, end: fin }); buf = ""; };
  a.characters.forEach((c, i) => {
    if (/\s/.test(c)) return cerrar(a.character_end_times_seconds[i - 1] ?? a.character_start_times_seconds[i]);
    if (!buf) ini = a.character_start_times_seconds[i];
    buf += c;
  });
  cerrar(a.character_end_times_seconds.at(-1) ?? ini);
  return words;
}

(async () => {
  const lista = bloques().map((b) => ({ ...b, texto: PRONUNCIA.reduce((t, [re, por]) => t.replace(re, por), b.texto) }));
  if (process.argv.includes("--contar")) {
    console.log(lista.map((b) => b.texto).join("\n\n---\n\n"));
    return console.log(`Total: ${lista.reduce((s, b) => s + b.texto.length, 0)} caracteres en ${lista.length} bloques`);
  }
  const key = process.env.ELEVENLABS_API_KEY, voz = process.env.ELEVENLABS_VOICE;
  if (!key || !voz) throw new Error("Faltan ELEVENLABS_API_KEY y/o ELEVENLABS_VOICE");
  fs.mkdirSync(OUT, { recursive: true });
  let caracteres = 0;
  for (const b of lista) {
    const id = String(b.n).padStart(2, "0"), mp3 = path.join(OUT, `${id}.mp3`);
    if (fs.existsSync(mp3)) { console.log(`${id} en caché`); continue; }
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}/with-timestamps`, {
      method: "POST", headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text: b.texto, model_id: MODEL }),
    });
    if (!r.ok) throw new Error(`ElevenLabs falló en el bloque ${id}: ${r.status} ${await r.text()}`);
    const data = await r.json();
    fs.writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
    const words = palabras(data.alignment);
    fs.writeFileSync(path.join(OUT, `${id}.words.json`), JSON.stringify(words, null, 1));
    caracteres += b.texto.length;
    console.log(`${id} ok · ${b.texto.length} car. · ${words.at(-1)?.end.toFixed(1)} s`);
  }
  console.log(`Caracteres facturados en esta corrida: ${caracteres}`);
})().catch((e) => { console.error(e); process.exit(1); });
