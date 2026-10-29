// Arma el tutorial en HyperFrames: corta la grabación por pasos, congela el último cuadro de cada paso
// hasta que termina su frase (assets/recorrido.mp4) y escribe index.html con la voz y las capas encima:
// portada, ficha "PASO NN", aro + etiqueta en cada clic, zoom a lo importante, tapas y cierre.
//
// Uso (desde la carpeta del tutorial, después de grabar.mjs y voz.mjs):
//   node <skill>/scripts/armar.mjs
//   npx hyperframes check && npx hyperframes render -o render/<slug>.mp4
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MOTION = path.dirname(SKILL); // edwin-motion: fuentes y sonidos compartidos
const T = JSON.parse(fs.readFileSync('tutorial.json', 'utf8'));
const G = JSON.parse(fs.readFileSync('grabacion.json', 'utf8'));
const C = { fondo: '#0d2233', acento: '#f39200', texto2: '#8cbf3f', tapa: '#e6ecf1', ...T.colores };
const OFF = 0.3;       // el video de Playwright arranca ~0,3 s antes que el reloj de grabar.mjs
const ANTES = 0.15;    // el corte cae justo antes de que el cursor empiece a moverse
const CW = 1728, ESC = CW / G.ancho, CH = Math.round(G.alto * ESC); // grabación escalada dentro de 1920×1080
const INTRO = 2.2, OUTRO = 3.2, VOZ_IN = 0.35, VOZ_OUT = 0.5;
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
const r = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Recursos compartidos
fs.mkdirSync('assets/fonts', { recursive: true }); fs.mkdirSync('assets/sfx', { recursive: true });
for (const f of ['Anton-Regular.ttf', 'Poppins-ExtraBold.ttf', 'JetBrainsMono-ExtraBold.ttf'])
  fs.copyFileSync(path.join(MOTION, 'plantillas/carrusel/fuentes', f), `assets/fonts/${f}`);
fs.copyFileSync(path.join(MOTION, 'assets/sfx/tick.mp3'), 'assets/sfx/tick.mp3');
if (!fs.existsSync('hyperframes.json')) fs.writeFileSync('hyperframes.json', JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { assets: 'assets' }, authoringSkill: 'general-video' }, null, 2));
if (!fs.existsSync('meta.json')) fs.writeFileSync('meta.json', JSON.stringify({ id: T.slug, name: T.slug }));

// 1. Tramos: cada paso empieza en su primera acción y dura lo que dura su frase (o más)
const fin = dur(G.webm);
const P = T.pasos.map((paso, i) => {
  const n = String(i + 1).padStart(2, '0');
  const voz = ['mp3', 'wav'].map((e) => `assets/audio/${n}.${e}`).find((f) => fs.existsSync(f));
  if (!voz) throw new Error(`Falta la voz del paso ${i + 1} (corre voz.mjs)`);
  return { ...paso, n, voz, src0: Math.max(0, G.pasos[i].ini + OFF - (i ? ANTES : 0)) };
});
P.forEach((p, i) => { if (i) p.src0 = Math.max(p.src0, P[i - 1].src0 + 0.1); }); // nunca un tramo de largo negativo
let t = 0;
P.forEach((p, i) => {
  p.src1 = i + 1 < P.length ? P[i + 1].src0 : fin - 0.1;
  p.vozIni = i === 0 ? INTRO : VOZ_IN;
  p.vozDur = dur(p.voz);
  const largo = p.src1 - p.src0;
  p.dur = Math.max(largo, p.vozIni + p.vozDur + VOZ_OUT) + (i === P.length - 1 ? OUTRO : 0);
  p.pad = p.dur - largo;
  p.ini = t; t += p.dur;
});
const TOTAL = r(t);
const aSalida = (v) => { const p = P.findLast((p) => p.src0 <= v) ?? P[0]; return r(p.ini + (v - p.src0)); };

const filtros = P.map((p, i) => `[0:v]trim=${p.src0.toFixed(3)}:${p.src1.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${p.pad.toFixed(3)}[v${i}]`);
filtros.push(P.map((_, i) => `[v${i}]`).join('') + `concat=n=${P.length}:v=1:a=0,fps=30[out]`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', G.webm, '-filter_complex', filtros.join(';'), '-map', '[out]',
  '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-g', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'assets/recorrido.mp4']);

// 2. Clics en tiempo de salida (solo los que tienen etiqueta llevan cartel)
const CLICS = G.clics.map((c) => ({ ...c, t: aSalida(c.t + OFF) }));

// 3. Zooms: "foco": [x, y, escala] en píxeles de la grabación. Arranca 2 s después del último clic del
// paso (o al inicio con "desde": "inicio") y vuelve antes del corte. Pasos seguidos con el mismo foco se unen.
let ZOOMS = [];
P.forEach((p) => {
  if (!p.foco) return;
  const clicsPaso = CLICS.filter((c) => c.t >= p.ini && c.t < p.ini + p.dur);
  const ini = p.desde === 'inicio' || !clicsPaso.length ? p.ini + (p.vozIni > 1 ? p.vozIni : 0.5) : Math.max(...clicsPaso.map((c) => c.t)) + 2;
  const finZ = p.ini + p.dur - 0.75;
  if (finZ - ini > 1.2) ZOOMS.push({ ini, fin: finZ, f: p.foco });
});
ZOOMS = ZOOMS.reduce((a, z) => { const u = a.at(-1); if (u && z.ini - u.fin < 1.5 && String(u.f) === String(z.f)) u.fin = z.fin; else a.push(z); return a; }, []);
const lente = ([fx, fy, s]) => {
  const x = Math.min(0, Math.max(CW - CW * s, CW / 2 - fx * ESC * s));
  const y = Math.min(0, Math.max(CH - CH * s, CH / 2 - fy * ESC * s));
  return `{ scale: ${s}, x: ${x.toFixed(1)}, y: ${y.toFixed(1)} }`;
};

// 4. Composición
const etiqueta = (c, i) => {
  const der = c.box.x + c.box.width + 14, izq = der > G.ancho - 340;
  const left = izq ? c.box.x - 14 : der;
  return `            <div id="etiq-${i}" class="clip etiq${izq ? ' izq' : ''}" data-start="${c.t}" data-duration="1.9" data-track-index="${5 + (i % 2)}" style="left:${left.toFixed(0)}px; top:${(c.box.y + c.box.height / 2 - 28).toFixed(0)}px">${esc(c.etiqueta)}</div>`;
};
const tapas = P.flatMap((p) => (p.tapar ?? []).map(([x, y, w, h, color], k) =>
  `            <div id="tapa-${p.n}-${k}" class="clip" data-start="${r(p.ini)}" data-duration="${r(p.dur)}" data-track-index="${8 + (k % 4)}" style="position:absolute; left:${x}px; top:${y}px; width:${w}px; height:${h}px; background:${color ?? C.tapa}; border-radius:4px"></div>`));
const conEtiq = CLICS.map((c, i) => [c, i]).filter(([c]) => c.etiqueta);
const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <!-- Tutorial "${esc(T.titulo)}": grabación de Playwright con voz y capas encima. Generado por edwin-tutorial/scripts/armar.mjs: no editar a mano, cambiar tutorial.json y volver a armar. -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: Anton; src: url(assets/fonts/Anton-Regular.ttf); }
      @font-face { font-family: Poppins; font-weight: 800; src: url(assets/fonts/Poppins-ExtraBold.ttf); }
      @font-face { font-family: JBM; font-weight: 800; src: url(assets/fonts/JetBrainsMono-ExtraBold.ttf); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: ${C.fondo}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: radial-gradient(circle at 20% 0%, color-mix(in srgb, ${C.fondo}, #fff 12%) 0%, ${C.fondo} 55%); font-family: Poppins; font-weight: 800; }
      #marco { position: absolute; left: 96px; top: 92px; width: ${CW}px; height: ${CH}px; overflow: hidden; border-radius: 14px; box-shadow: 0 0 0 3px ${C.acento}, 10px 10px 0 rgba(0,0,0,.45); background: #fff; }
      #lente { position: absolute; left: 0; top: 0; width: ${CW}px; height: ${CH}px; transform-origin: 0 0; }
      #cam { position: absolute; left: 0; top: 0; width: ${G.ancho}px; height: ${G.alto}px; transform: scale(${ESC.toFixed(4)}); transform-origin: 0 0; }
      #recorrido { position: absolute; left: 0; top: 0; width: ${G.ancho}px; height: ${G.alto}px; }
      .aro { position: absolute; width: 56px; height: 56px; margin: -28px 0 0 -28px; border: 5px solid ${C.acento}; border-radius: 50%; }
      .etiq { position: absolute; padding: 10px 20px 10px 16px; background: #fff; color: ${C.fondo}; font-size: 26px; border: 3px solid ${C.fondo}; border-left: 10px solid ${C.acento}; border-radius: 8px; box-shadow: 6px 6px 0 ${C.fondo}; white-space: nowrap; transform-origin: 0 50%; }
      .etiq::before { content: "◀ "; color: ${C.acento}; }
      .etiq.izq { translate: -100% 0; transform-origin: 100% 50%; border-left: 3px solid ${C.fondo}; border-right: 10px solid ${C.acento}; }
      .etiq.izq::before { content: ""; } .etiq.izq::after { content: " ▶"; color: ${C.acento}; }
      .paso { position: absolute; left: 96px; top: 22px; height: 52px; display: flex; align-items: center; gap: 18px; }
      .paso b { font-family: JBM; font-size: 22px; color: ${C.fondo}; background: ${C.acento}; padding: 9px 14px; border-radius: 6px; letter-spacing: 1px; }
      .paso span { font-size: 32px; color: #fff; }
      #marca { position: absolute; right: 96px; top: 36px; font-family: JBM; font-size: 18px; color: #fff; opacity: .6; letter-spacing: 1px; }
      #intro, #outro { position: absolute; inset: 0; background: ${C.fondo}; display: flex; flex-direction: column; justify-content: center; padding-left: 160px; }
      .k { font-family: JBM; font-size: 30px; color: ${C.acento}; letter-spacing: 4px; }
      #intro h1, #outro h1 { font-family: Anton; font-weight: 400; font-size: 150px; line-height: 1; color: #fff; margin-top: 14px; max-width: 1600px; }
      #intro p, #outro p { font-size: 44px; color: ${C.texto2}; margin-top: 22px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      <div id="marca">${esc(T.marca ?? '')}</div>
${P.map((p, i) => `      <div id="paso-${p.n}" class="clip paso" data-start="${r(p.ini)}" data-duration="${r(p.dur)}" data-track-index="2"><b>PASO ${p.n}</b><span>${esc(p.titulo)}</span></div>`).join('\n')}
      <div id="marco">
        <div id="lente" data-layout-allow-overflow>
          <div id="cam">
            <video id="recorrido" class="clip" src="assets/recorrido.mp4" data-start="0" data-duration="${TOTAL}" data-track-index="1" muted playsinline></video>
${tapas.join('\n')}
${CLICS.map((c, i) => `            <div id="aro-${i}" class="clip aro" data-start="${c.t}" data-duration="0.8" data-track-index="${3 + (i % 2)}" style="left:${c.x.toFixed(0)}px; top:${c.y.toFixed(0)}px"></div>`).join('\n')}
${conEtiq.map(([c, i]) => etiqueta(c, i)).join('\n')}
          </div>
        </div>
      </div>
      <div id="intro" class="clip" data-start="0" data-duration="${INTRO}" data-track-index="7"><div class="k">TUTORIAL</div><h1>${esc(T.titulo)}</h1><p>${esc(T.subtitulo ?? '')}</p></div>
      <div id="outro" class="clip" data-start="${r(TOTAL - OUTRO + 0.4)}" data-duration="${r(OUTRO - 0.4)}" data-track-index="7"><div class="k">LISTO</div><h1>${esc(T.cierre?.titulo ?? 'YA LO SABES HACER')}</h1><p>${esc(T.cierre?.subtitulo ?? '')}</p></div>
${P.map((p) => `      <audio id="voz-${p.n}" src="${p.voz}" data-start="${r(p.ini + p.vozIni)}" data-duration="${r(p.vozDur)}" data-track-index="10" data-volume="1"></audio>`).join('\n')}
${CLICS.map((c, i) => `      <audio id="sfx-${i}" src="assets/sfx/tick.mp3" data-start="${c.t}" data-duration="0.3" data-track-index="${20 + (i % 2)}" data-volume="0.12"></audio>`).join('\n')}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // portada: el título golpea y sube destapando la grabación
      tl.from("#intro .k", { x: -60, opacity: 0, duration: 0.3, ease: "power3.out" }, 0.1)
        .from("#intro h1", { scale: 1.6, opacity: 0, duration: 0.25, ease: "back.out(2)", transformOrigin: "0% 50%" }, 0.2)
        .from("#intro p", { y: 30, opacity: 0, duration: 0.3, ease: "power3.out" }, 0.5)
        .to("#intro", { yPercent: -100, duration: 0.4, ease: "power3.in" }, ${INTRO - 0.4})
        .from("#marco", { scale: 0.94, duration: 0.5, ease: "back.out(1.6)" }, ${INTRO - 0.1});
      // ficha de cada paso
${P.map((p) => `      tl.from("#paso-${p.n} b", { scale: 1.8, duration: 0.2, ease: "back.out(2)" }, ${r(p.ini)}).from("#paso-${p.n} span", { x: -40, opacity: 0, duration: 0.3, ease: "power3.out" }, ${r(p.ini + 0.05)});`).join('\n')}
      // clic: aro que se abre; etiqueta que salta, flota y se va
${CLICS.map((c, i) => `      tl.fromTo("#aro-${i}", { scale: 0.3, opacity: 1 }, { scale: 2.2, opacity: 0, duration: 0.7, ease: "power2.out" }, ${c.t});`).join('\n')}
${conEtiq.map(([c, i]) => `      tl.from("#etiq-${i}", { scale: 0, duration: 0.3, ease: "back.out(2.2)" }, ${c.t}).to("#etiq-${i}", { y: -6, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, ${r(c.t + 0.4)}).to("#etiq-${i}", { opacity: 0, duration: 0.2 }, ${r(c.t + 1.7)});`).join('\n')}
      // zoom a lo importante
${ZOOMS.map((z) => `      tl.to("#lente", { ...${lente(z.f)}, duration: 0.6, ease: "power3.inOut" }, ${r(z.ini)}).to("#lente", { scale: 1, x: 0, y: 0, duration: 0.5, ease: "power3.inOut" }, ${r(z.fin)});`).join('\n')}
      // cierre
      tl.from("#outro", { yPercent: 100, duration: 0.4, ease: "power3.out" }, ${r(TOTAL - OUTRO + 0.4)})
        .from("#outro h1", { scale: 1.6, opacity: 0, duration: 0.25, ease: "back.out(2)", transformOrigin: "0% 50%" }, ${r(TOTAL - OUTRO + 0.7)})
        .from("#outro p", { y: 30, opacity: 0, duration: 0.3, ease: "power3.out" }, ${r(TOTAL - OUTRO + 0.95)});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync('index.html', html);
fs.writeFileSync('tiempos.json', JSON.stringify({ TOTAL, pasos: P.map(({ n, titulo, ini, dur, src0, src1 }) => ({ n, titulo, ini, dur, src0, src1 })), clics: CLICS, zooms: ZOOMS }, null, 1));
console.log(`total ${TOTAL} s ·`, P.map((p) => `${p.n}@${p.ini.toFixed(1)}`).join(' '));
