// Captura todas las láminas de un carrusel (1080x1350) con Chrome headless.
// Uso (desde la raíz del repo, con `python -m http.server 8765` corriendo en la raíz):
//   node .claude/skills/edwin-motion/plantillas/carrusel/capturar.mjs guiones/<slug>/publicacion/carrusel
// Lee <carpeta>/carrusel.json y escribe <carpeta>/slide-01.png … slide-NN.png.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const dir = (process.argv[2] || "").replace(/\\/g, "/").replace(/\/$/, "");
if (!dir || !fs.existsSync(path.join(dir, "carrusel.json"))) { console.error("Falta la carpeta con carrusel.json"); process.exit(1); }
const total = JSON.parse(fs.readFileSync(path.join(dir, "carrusel.json"), "utf8")).slides.length;
const URL = `http://localhost:8765/.claude/skills/edwin-motion/plantillas/carrusel/carrusel.html?d=/${dir}/&s=`;

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
