// Arma golpe.mp3 y grieta.mp3 (los dos efectos de impacto del skill) a partir de los efectos de
// Pixabay que trae el skill media-use de HyperFrames. No se incluyen en el paquete porque la licencia
// de Pixabay no permite redistribuirlos sueltos; así cada quien los saca de su propia instalación.
//   golpe  = impact-bass-1 sin el silencio inicial, con cola corta
//   grieta = 0,55 s de glitch-2 que suena desde el primer instante
// Uso: node scripts/sfx-base.mjs <proyecto>/assets/sfx      (requiere ffmpeg)
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const SRC = path.join(os.homedir(), ".claude/skills/media-use/audio/assets/sfx");
const OUT = process.argv[2] ?? "assets/sfx";
fs.mkdirSync(OUT, { recursive: true });
for (const [nombre, origen, filtro] of [
  ["golpe", "impact-bass-1", "silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:1.2,afade=t=out:st=0.8:d=0.4"],
  ["grieta", "glitch-2", "silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:0.55,afade=t=out:st=0.45:d=0.1"],
]) {
  const src = path.join(SRC, origen + ".mp3");
  if (!fs.existsSync(src)) { console.log("FALTA", src, "— instala HyperFrames: npx skills add heygen-com/hyperframes"); continue; }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-af", filtro, "-c:a", "libmp3lame", "-q:a", "2", path.join(OUT, nombre + ".mp3")]);
  console.log("ok", nombre);
}
