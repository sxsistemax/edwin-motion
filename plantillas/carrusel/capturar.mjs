// Captura todas las láminas de un carrusel (1080x1350) con Chrome headless.
// Uso (desde la raíz del proyecto): node <skill>/plantillas/carrusel/capturar.mjs guiones/<slug>/publicacion/carrusel
// Lee <carpeta>/carrusel.json y escribe <carpeta>/slide-01.png … slide-NN.png.
// Levanta su propio servidor: la raíz del proyecto en "/" (rutas de carrusel.json como /out/…) y esta
// carpeta del skill en "/__skill/", así funciona aunque el skill esté instalado en ~/.claude/skills.
import { execFileSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe"; // en Mac/Linux: exportar CHROME_PATH
const SKILL = path.dirname(fileURLToPath(import.meta.url));
const dir = (process.argv[2] || "").replace(/\\/g, "/").replace(/\/$/, "");
if (!dir || !fs.existsSync(path.join(dir, "carrusel.json"))) { console.error("Falta la carpeta con carrusel.json"); process.exit(1); }
const total = JSON.parse(fs.readFileSync(path.join(dir, "carrusel.json"), "utf8")).slides.length;

// Servidor en un proceso aparte: el bucle de abajo es síncrono (execFileSync) y bloquearía uno propio.
const PUERTO = 8700 + (process.pid % 200);
const servidor = spawn(process.execPath, ["-e", `
  const http = require("http"), fs = require("fs"), path = require("path");
  const T = { ".html": "text/html", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
  http.createServer((q, s) => {
    const u = decodeURIComponent(q.url.split("?")[0]);
    const f = u.startsWith("/__skill/") ? path.join(${JSON.stringify(SKILL)}, u.slice(9)) : path.join(process.cwd(), u);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { "Content-Type": T[path.extname(f).toLowerCase()] || "application/octet-stream" }); fs.createReadStream(f).pipe(s);
  }).listen(${PUERTO}, () => console.log("listo"));`], { stdio: ["ignore", "pipe", "inherit"] });
await new Promise((ok) => servidor.stdout.once("data", ok));
const URL = `http://localhost:${PUERTO}/__skill/carrusel.html?d=/${dir}/&s=`;

try {
  for (let s = 1; s <= total; s++) {
    const salida = path.resolve(dir, `slide-${String(s).padStart(2, "0")}.png`);
    fs.rmSync(salida, { force: true });
    const listo = () => { for (let i = 0; i < 20 && !fs.existsSync(salida); i++) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); return fs.existsSync(salida); };
    for (let intento = 0; intento < 3 && !listo(); intento++)  // Chrome a veces escribe tarde o no escribe la captura
      execFileSync(CHROME, ["--headless=new", `--user-data-dir=${path.join(os.tmpdir(), `chrome-carrusel-${process.pid}-${s}-${intento}`)}`,
        "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000", "--window-size=1080,1350",
        `--screenshot=${salida}`, URL + s], { stdio: "ignore" });
    console.log(listo() ? "ok" : "FALLÓ", path.basename(salida));
  }
} finally {
  servidor.kill();
}
