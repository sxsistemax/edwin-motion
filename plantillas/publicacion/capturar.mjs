// Captura la miniatura (1280x720) y las portadas del Short por red (YouTube Shorts 9:16 completa;
// TikTok e Instagram 9:16 con lo importante en la franja central 4:5/3:4; cuadrícula de Instagram 3:4) desde
// portadas.html con Chrome headless.
// Uso (desde la raíz del repo): python -m http.server 8765   (otra terminal)
//                               node guiones/jev-tutorial/publicacion/capturar.mjs
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = "http://localhost:8765/guiones/jev-tutorial/publicacion/portadas.html?f=";
const DIR = path.join(process.cwd(), "guiones/jev-tutorial/publicacion");

let n = 0;
for (const [f, salida, w, h] of [["mini", "miniatura.png", 1280, 720], ["short", "portada-youtube-shorts.png", 1080, 1920],
  ["centro", "portada-tiktok.png", 1080, 1920], ["centro", "portada-instagram.png", 1080, 1920], ["grid", "portada-instagram-cuadricula.png", 1080, 1440]]) {
  fs.rmSync(path.join(DIR, salida), { force: true });
  const listo = () => { for (let i = 0; i < 20 && !fs.existsSync(path.join(DIR, salida)); i++) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); return fs.existsSync(path.join(DIR, salida)); };
  for (let intento = 0; intento < 3 && !listo(); intento++)  // Chrome a veces escribe tarde o no escribe la captura
    execFileSync(CHROME, ["--headless=new", `--user-data-dir=${path.join(os.tmpdir(), "chrome-jev-" + process.pid + "-" + n++)}`,
    "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000", `--window-size=${w},${h}`,
    `--screenshot=${path.join(DIR, salida)}`, URL + f], { stdio: "ignore" });
  console.log(listo() ? "ok" : "FALLÓ", salida);
}
