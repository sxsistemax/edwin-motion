// Descarga material real para combinar con las animaciones (modo `medios`, ver references/medios.md).
// Todo cae en guiones/<slug>/assets/medios/ y queda anotado en medios.json (origen, fuente, licencia)
// para poder dar crédito y no usar algo cuyo origen no se sabe.
//
// Uso (desde la raíz del repo):
//   node .claude/skills/edwin-motion/scripts/medios.mjs <slug> foto <url>                 imagen directa; si la URL es una página, toma su og:image
//   node .claude/skills/edwin-motion/scripts/medios.mjs <slug> video <url> [--desde 1:02 --hasta 1:10]   yt-dlp (≤1080p, mp4), solo el tramo si se pide
//   node .claude/skills/edwin-motion/scripts/medios.mjs <slug> captura <url> [--ancho 1920 --alto 1080 --escala 1]   pantallazo de una web (Chrome headless)
//   node .claude/skills/edwin-motion/scripts/medios.mjs <slug> documento <pdf|url> [--paginas 1-3 --dpi 200]   páginas de un PDF a PNG (PyMuPDF)
// Opciones comunes: --nombre <base> --fuente "Crédito visible" --licencia "…"
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

const [slug, tipo, origen, ...resto] = process.argv.slice(2);
if (!slug || !tipo || !origen) {
  console.error("Uso: medios.mjs <slug> foto|video|captura|documento <url|ruta> [opciones]");
  process.exit(1);
}
const op = {};
for (let i = 0; i < resto.length; i += 2) op[resto[i].replace(/^--/, "")] = resto[i + 1];

const DIR = path.resolve("guiones", slug, "assets/medios");
fs.mkdirSync(DIR, { recursive: true });
const base = op.nombre ?? `${tipo}-${new URL(origen.startsWith("http") ? origen : "file:///" + origen).hostname.replace(/^www\./, "") || "local"}-${Date.now().toString(36)}`;

function anotar(archivos) {
  const manifiesto = path.join(DIR, "medios.json");
  const lista = fs.existsSync(manifiesto) ? JSON.parse(fs.readFileSync(manifiesto, "utf8")) : [];
  for (const a of archivos)
    lista.push({ archivo: path.relative(path.resolve("guiones", slug), a).replaceAll("\\", "/"), tipo, origen,
      fuente: op.fuente ?? "", licencia: op.licencia ?? "por confirmar", fecha: new Date().toISOString().slice(0, 10) });
  fs.writeFileSync(manifiesto, JSON.stringify(lista, null, 2));
  for (const a of archivos) console.log("ok", path.relative(process.cwd(), a));
}

async function bajar(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} al bajar ${url} — si es Cloudflare/403, bajarlo con el navegador de Playwright (references/medios.md)`);
  return r;
}

const ext = (tipoMime, url) =>
  ({ "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg", "image/avif": ".avif", "application/pdf": ".pdf" })[tipoMime] ??
  (path.extname(new URL(url).pathname) || ".bin");

if (tipo === "foto") {
  let r = await bajar(origen);
  let mime = (r.headers.get("content-type") ?? "").split(";")[0];
  if (mime === "text/html") {
    const html = await r.text();
    const img = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]+content=["']([^"']+)/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)/i)?.[1];
    if (!img) throw new Error("la página no trae og:image: buscar la imagen con Playwright y pasar su URL directa");
    r = await bajar(new URL(img.replaceAll("&amp;", "&"), origen).href);
    mime = (r.headers.get("content-type") ?? "").split(";")[0];
  }
  if (!mime.startsWith("image/")) throw new Error(`no es una imagen (${mime})`);
  const destino = path.join(DIR, base + ext(mime, r.url));
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  anotar([destino]);
} else if (tipo === "video") {
  const destino = path.join(DIR, base + ".mp4");
  const args = ["-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/b", "--merge-output-format", "mp4", "--no-playlist", "-o", destino];
  if (op.desde || op.hasta) args.push("--download-sections", `*${op.desde ?? "0"}-${op.hasta ?? "inf"}`, "--force-keyframes-at-cuts");
  execFileSync("yt-dlp", [...args, origen], { stdio: "inherit" });
  anotar([destino]);
} else if (tipo === "captura") {
  const destino = path.join(DIR, base + ".png");
  const [w, h, s] = [op.ancho ?? 1920, op.alto ?? 1080, op.escala ?? 1];
  fs.rmSync(destino, { force: true });
  const listo = () => { for (let i = 0; i < 20 && !fs.existsSync(destino); i++) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); return fs.existsSync(destino); };
  for (let intento = 0; intento < 3 && !listo(); intento++)  // Chrome a veces escribe tarde o no escribe la captura (igual que capturar.mjs)
    execFileSync(CHROME, ["--headless=new", `--user-data-dir=${path.join(os.tmpdir(), "chrome-medios-" + process.pid + "-" + intento)}`,
      "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=10000", `--window-size=${w},${h}`, `--force-device-scale-factor=${s}`,
      `--user-agent=${UA}`, `--screenshot=${destino}`, origen], { stdio: "ignore" });
  if (!fs.existsSync(destino)) throw new Error("Chrome no escribió la captura (página con login/cookies: usar Playwright)");
  anotar([destino]);
} else if (tipo === "documento") {
  let pdf = origen;
  if (origen.startsWith("http")) {
    pdf = path.join(DIR, base + ".pdf");
    fs.writeFileSync(pdf, Buffer.from(await (await bajar(origen)).arrayBuffer()));
  }
  const [a, b] = (op.paginas ?? "1").split("-").map(Number);
  const py = `import sys, pymupdf as fitz
d = fitz.open(sys.argv[1]); a, b, dpi, out = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
for i in range(a - 1, min(b, d.page_count)):
    p = f"{out}-p{i + 1}.png"; d[i].get_pixmap(dpi=dpi).save(p); print(p)`;
  const salida = execFileSync("python", ["-I", "-c", py, path.resolve(pdf), String(a), String(b ?? a), String(op.dpi ?? 200), path.join(DIR, base)], { encoding: "utf8" });
  anotar(salida.trim().split(/\r?\n/).filter((l) => l.endsWith(".png")));
} else {
  console.error(`tipo desconocido: ${tipo} (foto|video|captura|documento)`);
  process.exit(1);
}
