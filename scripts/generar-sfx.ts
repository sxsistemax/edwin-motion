// Genera la biblioteca de efectos del skill con ElevenLabs Sound Effects (cuesta créditos: ~5-10 por efecto).
// Uso: ELEVENLABS_API_KEY=... npx tsx scripts/generar-sfx.ts   (desde la carpeta del skill)
// Solo genera los que faltan: para agregar uno, súmalo a la lista y vuelve a correrlo.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/sfx");
const env = { elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "" };
if (!env.elevenLabsApiKey) throw new Error("Falta ELEVENLABS_API_KEY");
const SFX: [string, string, number][] = [
  ["desliza-1", "a quick soft swish of a paper card sliding fast across a table, short and clean, no music", 0.6],
  ["desliza-2", "short airy swipe whoosh for a user interface panel sliding in, crisp and subtle, no music", 0.5],
  ["caida", "a small light object dropping and landing on a wooden table with a soft short thud, no music", 0.6],
  ["llenado", "short clean rising tonal swell, a progress bar filling up, ascending synth, user interface, no music", 1.0],
  ["tick", "fast mechanical number counter rolling, rapid soft ticking clicks, short, no music", 1.0],
  ["marcador", "a felt marker pen quickly drawing a line on paper, short squeaky stroke, no music", 0.8],
  ["papel", "a short paper receipt being printed and torn off quickly, crisp paper sound, no music", 0.8],
  ["check", "satisfying soft user interface checkbox tick, short clean click with a tiny positive tone, no music", 0.5],
  ["pop-suave", "very soft subtle bubble pop, gentle and quiet user interface sound, no music", 0.5],
  // cifras que se acumulan: conteo que crece y monedas que se apilan
  ["acumula", "digital score counter ticking up fast, clicks accelerating and rising in pitch, building up, ends with a tiny bright ding, no music", 1.0],
  ["monedas", "many metal coins quickly piling up one on top of another, clinking cascade that builds up and gets fuller, money accumulating, no music", 1.2],
  // temáticos (ejemplos de efectos por tema)
  ["rec-apagado", "camera recording beep followed by a short electronic power down, device switching off, no music", 1.0],
  ["rebobinado", "short cassette tape rewinding fast, comedic quick rewind squeal, no music", 0.8],
  ["claqueta", "loud movie clapperboard snapping shut on a film set, one sharp loud wooden clap, close up, no music", 1.0],
];
(async () => {
  for (const [nombre, texto, dur] of SFX) {
    const dst = `${OUT}/${nombre}.mp3`;
    if (fs.existsSync(dst)) { console.log("ya existe", nombre); continue; }
    const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST", headers: { "xi-api-key": env.elevenLabsApiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto, duration_seconds: dur, prompt_influence: 0.6 }),
    });
    if (!r.ok) { console.log("FALLÓ", nombre, r.status, (await r.text()).slice(0, 200)); continue; }
    fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
    console.log("ok", nombre);
  }
})();
