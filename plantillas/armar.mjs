// Plantilla edwin-motion (copiar a la carpeta del video y editar ESCENAS, TITULO y el
// bloque que sigue al gancho). Arma index.html: una escena por bloque del guion, cada una dura
// lo que su voz (assets/audio/NN.mp3) + PAUSA, y entre el gancho y la tesis el
// título de marca (compositions/frames/00-titulo.html). Escenas aún sin archivo
// se saltan (el tiempo se conserva). Los golpes de sonido salen de cada
// compositions/frames/NN-slug.sfx.json. Después de correrlo, aplicar el carve:
//   node ~/.claude/skills/hyperframes-audio/scripts/carve.mjs --comp index.html --bed musica --voice voz-01 … --voice voz-12
import fs from "fs";
import { execFileSync } from "child_process";

const PAUSA = 0.8;
const TITULO = 4.6;
const ESCENAS = [
  "01-gancho", "02-tesis", "03-trenes", "04-puntocom", "05-apuesta", "06-grieta-firmus",
  "07-grieta-spacex", "08-grieta-openai", "09-alarma", "10-contrapunto", "11-veredicto", "12-cierre",
];

const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const r = (x) => Math.round(x * 100) / 100;
const existe = (slug) => fs.existsSync(`compositions/frames/${slug}.html`);

let t = 0;
const clips = [];
ESCENAS.forEach((slug, i) => {
  const n = String(i + 1).padStart(2, "0");
  const voz = dur(`assets/audio/${n}.mp3`);
  clips.push({ n, slug, start: r(t), voz: r(voz), escena: r(voz + PAUSA) });
  t += voz + PAUSA;
  if (i === 0) { clips.push({ n: "00", slug: "00-titulo", start: r(t), voz: 0, escena: TITULO }); t += TITULO; }
});
const total = r(t);

const hosts = clips.filter((c) => existe(c.slug)).map((c) => `      <div id="f${c.n}" data-composition-id="f${c.n}" data-composition-src="compositions/frames/${c.slug}.html"
        data-start="${c.start}" data-duration="${c.escena}" data-track-index="1" data-width="1920" data-height="1080"></div>`).join("\n");

const efectos = clips.flatMap((c) => {
  // golpes a mano (.sfx.json) + sonidos de los movimientos (.sfx-auto.json, scripts/sonidos.mjs del skill)
  if (!existe(c.slug)) return [];
  return [".sfx.json", ".sfx-auto.json"].map((x) => `compositions/frames/${c.slug}${x}`).filter((f) => fs.existsSync(f))
    .flatMap((f) => JSON.parse(fs.readFileSync(f, "utf8")).map(([s, tipo, v]) => ({ at: r(c.start + s), tipo, v })));
}).map((e, i) => `      <audio id="sfx-${i + 1}" src="assets/sfx/${e.tipo}.mp3" data-start="${e.at}" data-duration="${r(dur(`assets/sfx/${e.tipo}.mp3`))}" data-track-index="${12 + (i % 4)}" data-volume="${e.v}"></audio>
`).join("");
const voces = clips.filter((c) => c.voz).map((c) => `      <audio id="voz-${c.n}" src="assets/audio/${c.n}.mp3" data-start="${c.start}" data-duration="${c.voz}" data-track-index="10" data-volume="1"></audio>`).join("\n");
const cortes = clips.slice(1).map((c) => c.start);

fs.writeFileSync("index.html", `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <!-- Generado por armar.mjs — no editar a mano los tiempos -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #050505; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #050505; }
      #corte { position: absolute; inset: 0; z-index: 80; background: #fff; opacity: 0; pointer-events: none; }
      .grain { position: absolute; inset: 0; z-index: 100; overflow: hidden; pointer-events: none; }
      @keyframes hf-grain-noise {
        0%, 100% { transform: translate(0, 0); } 10% { transform: translate(-5%, -5%); } 20% { transform: translate(-10%, 5%); }
        30% { transform: translate(5%, -10%); } 40% { transform: translate(-5%, 15%); } 50% { transform: translate(-10%, 5%); }
        60% { transform: translate(15%, 0); } 70% { transform: translate(0, 10%); } 80% { transform: translate(-15%, 0); } 90% { transform: translate(10%, 5%); }
      }
      .grain-texture {
        position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        opacity: 0.07; animation: hf-grain-noise 0.5s steps(1) infinite;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${hosts}
      <div id="corte"></div>
      <div id="grain-overlay" class="grain"><div class="grain-texture"></div></div>
      <audio id="musica" src="assets/bgm/cama.wav" data-start="0" data-duration="${total}" data-track-index="11" data-volume="1"></audio>
${efectos}${voces}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      // destello corto en cada corte de escena
      [${cortes.join(", ")}].forEach((t) =>
        tl.fromTo("#corte", { opacity: 0.6 }, { opacity: 0, duration: 0.14, ease: "power2.out", immediateRender: false }, t));
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);

fs.writeFileSync("tiempos.json", JSON.stringify({ total, escenas: clips }, null, 1));
console.log(clips.map((c) => `${c.n} ${c.slug.padEnd(18)} inicio ${String(c.start).padStart(7)}  escena ${c.escena}s${existe(c.slug) ? "" : "  (falta archivo)"}`).join("\n"));
console.log(`total ${total}s = ${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`);
