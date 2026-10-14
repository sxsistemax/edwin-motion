// Sonidos automáticos para los movimientos (receta 17): abre cada escena en Chrome headless, recorre su
// timeline GSAP ya construida (con el warp aplicado si lo hay) y pone un efecto según el tipo de
// movimiento. Los golpes/grietas de los sidecars .sfx.json se respetan (no se duplica nada a < 0,3 s).
//
//   desliza-1/2, whoosh-short  entra de lado (|x| ≥ 400 px) — se alternan para no repetir
//   papel         tarjeta/recibo que sube desde abajo (y ≥ 400 px)
//   caida         cae desde arriba (y ≤ −250 px: letras, tarjetas, objetos)
//   llenado       barra que se llena (scaleX/scaleY desde 0, ≥ 0,3 s)
//   acumula       cifra que corre (onUpdate sobre un objeto, 0,4-2,6 s): conteo que acelera y sube
//   disminuye     cifra que baja (valor final menor o con signo −): acumula al revés
//   monedas       la misma cifra si es dinero (US$, $, USD, €, dólares cerca del número): monedas que se apilan
//   marcador      línea/gráfica que se dibuja (strokeDashoffset, ≥ 0,45 s)
//   check         casilla que se marca (strokeDashoffset corto) 
//   pop-suave     etiqueta/chip que salta con rebote (ease back.*)
//   typing        tecleo (stagger de duración ≈ 0) · click: interruptor (sw/knob/toggle/interruptor)
// Efectos: biblioteca propia del skill (../assets/sfx, ElevenLabs, scripts/generar-sfx.ts) + la de media-use.
//
// Uso (desde la raíz del repo):
//   node <skill>/scripts/sonidos.mjs <proyecto>   (desde la raíz del repo) [--index]
//   · largo (escenas en compositions/frames): escribe NN-slug.sfx-auto.json junto a cada escena;
//     armar.mjs los mezcla con los .sfx.json.
//   · --index (Short: escenas montadas en index.html): inserta <audio id="sfxa-N"> en index.html
//     (borra los sfxa anteriores; se puede volver a correr).
// Copia a <proyecto>/assets/sfx los efectos que falten.
import fs from "fs";
import path from "path";
import http from "http";
import os from "os";
import { createRequire } from "module";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

// RAIZ = carpeta desde la que se corre (se sirve por HTTP para leer las escenas): correr desde la raíz del repo.
const RAIZ = process.cwd();
const BIBS = [path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/sfx"), path.join(os.homedir(), ".claude/skills/media-use/audio/assets/sfx")];
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe"; // en Mac/Linux: exportar CHROME_PATH
// volúmenes probados de oído (con ~0,12 se oían muy bajitos)
const VOL = { "whoosh-short": 0.28, "desliza-1": 0.3, "desliza-2": 0.3, papel: 0.28, caida: 0.3, llenado: 0.22, tick: 0.2,
  marcador: 0.25, acumula: 0.26, disminuye: 0.26, monedas: 0.3, check: 0.3, "pop-suave": 0.28, typing: 0.18, click: 0.35 };
const HUECO = 0.3; // separación mínima entre efectos

const [, , proyArg, ...flags] = process.argv;
if (!proyArg) { console.error("uso: sonidos.mjs <proyecto> [--index]"); process.exit(1); }
const PROY = path.resolve(proyArg);
const MODO_INDEX = flags.includes("--index");

// puppeteer-core del caché de npx (lo trae hyperframes)
const npx = path.join(os.homedir(), "AppData/Local/npm-cache/_npx");
const pp = fs.readdirSync(npx).map((d) => path.join(npx, d, "node_modules/puppeteer-core")).find((d) => fs.existsSync(d));
if (!pp) { console.error("no encontré puppeteer-core en el caché de npx (corra antes un render de hyperframes)"); process.exit(1); }
const puppeteer = createRequire(path.join(pp, "package.json"))(pp);

// servidor estático de la raíz del repo
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".json": "application/json", ".svg": "image/svg+xml" };
const srv = http.createServer((q, s) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split("?")[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(s);
}).listen(0);
const PUERTO = srv.address().port;
const url = (f) => `http://localhost:${PUERTO}/${path.relative(RAIZ, f).split(path.sep).map(encodeURIComponent).join("/")}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--disable-gpu"] });

// Analiza una composición <template> y devuelve [[t, tipo], …] en segundos locales de la escena.
async function analizar(archivo, id) {
  const tpl = fs.readFileSync(archivo, "utf8").replace(/^[\s\S]*?<template>/, "").replace(/<\/template>[\s\S]*$/, "");
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><base href="${url(archivo)}"><meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script><script>window.__timelines = {};</script></head><body>${tpl}</body></html>`, { waitUntil: "load" });
  const ev = await page.evaluate((id) => {
    const tl = (window.__timelines || {})[id] || Object.values(window.__timelines || {})[0];
    if (!tl) return [];
    const base = tl.globalTime(0), out = [];
    const sel = (t) => t.targets().map((e) => (e && e.id ? "#" + e.id : "") + " " + (e && e.className && e.className.baseVal === undefined ? e.className : "")).join(" ").toLowerCase();
    let lado = 0;
    // ¿qué cifra cambia entre el inicio y el final del contador? baja (valor menor o con signo −) → disminuye;
    // dinero (US$, $, USD, €, dólares alrededor del número) → monedas; si no → acumula
    const hojas = () => new Map([...document.querySelectorAll("body *")].filter((e) => !e.children.length).map((e) => [e, e.textContent]));
    const num = (t) => parseFloat(String(t).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    const tipoCifra = (ini, d) => {
      tl.seek(Math.max(0, ini - 0.001), false); const a = hojas(); tl.seek(ini + d, false);
      const cambian = [...hojas()].filter(([e, txt]) => a.get(e) !== txt);
      if (!cambian.length) return null;  // onUpdate que no cambia texto (p. ej. punta de una gráfica): sin sonido
      if (cambian.some(([e, txt]) => /^\s*[−-]/.test(txt) || num(txt) < num(a.get(e)))) return "disminuye";
      return cambian.some(([e]) => /US\$|\$|USD|€|d[oó]lar/i.test((e.parentElement?.parentElement || e).textContent)) ? "monedas" : "acumula";
    };
    const LADO = ["desliza-1", "desliza-2", "whoosh-short"];
    for (const t of tl.getChildren(true, true, false)) {
      const v = t.vars || {}, d = t.duration(), ini = t.globalTime(0) - base;
      const tg = t.targets(), els = tg.filter((e) => e && e.nodeType === 1);
      if (v.repeat || v.yoyo) continue;
      if (!els.length) { if (v.onUpdate && d >= 0.4 && d <= 2.6) { const k = tipoCifra(ini, d); if (k) out.push([ini, k]); } continue; }
      const ease = String(v.ease || ""), s = sel(t);
      const desde = (v.startAt) || t._from || {};
      const n = (o, k) => (o && o[k] !== undefined && !isNaN(+o[k]) ? +o[k] : null);
      const dx = n(desde, "x"), dy = n(desde, "y");
      if (/(^|[\s#.-])(sw|knob|toggle|interruptor)/.test(s) && (v.x !== undefined || v.backgroundColor)) out.push([ini, "click"]);
      else if (v.stagger && (+v.duration || 0) <= 0.03) out.push([ini, "typing"]);
      else if (v.strokeDashoffset !== undefined || desde.strokeDashoffset !== undefined) out.push([ini, d >= 0.45 ? "marcador" : "check"]);
      else if ((n(desde, "scaleX") === 0 || n(desde, "scaleY") === 0) && d >= 0.3) out.push([ini, "llenado"]);
      else if (dy !== null && dy <= -250 && d <= 1.6) out.push([ini, "caida"]);
      else if (dx !== null && Math.abs(dx) >= 400 && d >= 0.2 && d <= 1.6) out.push([ini, LADO[lado++ % 3]]);
      else if (dy !== null && dy >= 400 && d >= 0.2 && d <= 1.6) out.push([ini, "papel"]);
      else if (/back/.test(ease) && d <= 0.6) out.push([ini, "pop-suave"]);
    }
    return out;
  }, id);
  await page.close();
  return ev;
}

const filtrar = (ev, existentes) => {
  const usados = existentes.map(([t]) => t), res = [], ultimo = {};
  const MIN = { "pop-suave": 1.2, tick: 1.0, acumula: 1.0, disminuye: 1.0, monedas: 1.0, papel: 0.8 };  // que el pop no se vuelva repetitivo
  for (const [t, tipo] of ev.sort((a, b) => a[0] - b[0])) {
    // las cifras (sonido largo de conteo) sí pueden ir encima de un golpe: el golpe marca el sello, el conteo la cifra
    const cifra = /^(acumula|disminuye|monedas)$/.test(tipo);
    if (t < 0.05 || (!cifra && usados.some((u) => Math.abs(u - t) < HUECO))) continue;
    if (MIN[tipo] && ultimo[tipo] !== undefined && t - ultimo[tipo] < MIN[tipo]) continue;
    ultimo[tipo] = t;
    usados.push(t); res.push([Math.round(t * 100) / 100, tipo, VOL[tipo]]);
  }
  return res;
};

// copiar efectos que falten
fs.mkdirSync(path.join(PROY, "assets/sfx"), { recursive: true });
for (const n of Object.keys(VOL)) {
  const dst = path.join(PROY, "assets/sfx", n + ".mp3"), src = BIBS.map((b) => path.join(b, n + ".mp3")).find((f) => fs.existsSync(f));
  if (src && (!fs.existsSync(dst) || src.includes("edwin-motion"))) fs.copyFileSync(src, dst);
}

if (!MODO_INDEX) {
  const dir = path.join(PROY, "compositions/frames");
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".html")).sort()) {
    const id = "f" + f.slice(0, 2);
    const sc = path.join(dir, f.replace(/\.html$/, ".sfx.json"));
    const prev = fs.existsSync(sc) ? JSON.parse(fs.readFileSync(sc, "utf8")) : [];
    const nuevos = filtrar(await analizar(path.join(dir, f), id), prev);
    fs.writeFileSync(path.join(dir, f.replace(/\.html$/, ".sfx-auto.json")), JSON.stringify(nuevos));
    console.log(f, nuevos.length, "efectos", Object.entries(nuevos.reduce((a, [, t]) => ((a[t] = (a[t] || 0) + 1), a), {})).map(([k, n]) => `${k}×${n}`).join(" "));
  }
} else {
  const idx = path.join(PROY, "index.html");
  let html = fs.readFileSync(idx, "utf8").replace(/\s*<audio id="sfxa-\d+"[^>]*><\/audio>/g, "");
  const prev = [...html.matchAll(/<audio id="sfx-\d+"[^>]*data-start="([\d.]+)"/g)].map((m) => [+m[1]]);
  const hosts = [...html.matchAll(/<div id="([\w-]+)" data-composition-id="([\w-]+)" data-composition-src="([^"]+)"[^>]*data-start="([\d.]+)"/g)];
  let todos = [];
  for (const [, , cid, src, ini] of hosts) { const ev = await analizar(path.join(PROY, src), cid); console.log(src, ev.length); todos.push(...ev.map(([t, k]) => [t + +ini, k])); }
  const nuevos = filtrar(todos, prev);
  const durS = (k) => Math.round(+execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(PROY, "assets/sfx", k + ".mp3")]).toString() * 100) / 100;
  const tags = nuevos.map(([t, k, v], i) => `      <audio id="sfxa-${i + 1}" src="assets/sfx/${k}.mp3" data-start="${t}" data-duration="${durS(k)}" data-track-index="${14 + (i % 4)}" data-volume="${v}"></audio>`).join("\n");
  html = html.replace(/(\s*<audio id="voz-)/, `\n${tags}$1`);
  fs.writeFileSync(idx, html);
  console.log("index.html:", nuevos.length, "efectos");
}
await browser.close();
srv.close();
