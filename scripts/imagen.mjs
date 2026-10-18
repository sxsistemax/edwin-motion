// Genera una imagen con IA (modo `imagen`, ver references/medios.md). Cuesta plata: sin --autorizado
// solo muestra el precio y no genera nada. Con --ref usa nano-banana/edit (consistencia con una imagen
// ancla, p. ej. el personaje).
//
// Uso (desde la raíz del proyecto; <skill> = carpeta de este skill):
//   node <skill>/scripts/imagen.mjs <slug> "<prompt en inglés>" [--ref a.png,b.png] [--aspecto 16:9] [--n 1] [--nombre x] [--autorizado]
// Sale en guiones/<slug>/assets/medios/ia-<nombre>[-N].png, anotada en medios.json y en costos/costos.csv.
import fs from "fs";
import path from "path";

const [slug, prompt, ...resto] = process.argv.slice(2);
if (!slug || !prompt) {
  console.error('Uso: imagen.mjs <slug> "<prompt>" [--ref a.png,b.png] [--aspecto 16:9] [--n 1] [--nombre x] [--autorizado]');
  process.exit(1);
}
const op = {};
for (let i = 0; i < resto.length; i++)
  if (resto[i] === "--autorizado") op.autorizado = true;
  else op[resto[i].replace(/^--/, "")] = resto[++i];

const linea = fs.readFileSync(".env", "utf8").split(/\r?\n/).find((l) => l.startsWith("FALIA_API_KEY="));
const FAL = linea?.slice("FALIA_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
if (!FAL) throw new Error("falta FALIA_API_KEY en .env");

const refs = op.ref ? op.ref.split(",") : [];
const modelo = refs.length ? "fal-ai/nano-banana/edit" : "fal-ai/nano-banana";
const n = Number(op.n ?? 1);

const precio = await fetch(`https://api.fal.ai/v1/models/pricing?endpoint_id=${encodeURIComponent(modelo)}`, { headers: { Authorization: `Key ${FAL}` } })
  .then((r) => (r.ok ? r.json() : null)).then((d) => d?.prices?.[0]?.unit_price ?? null).catch(() => null);
const costo = precio == null ? null : +(precio * n).toFixed(4);
console.log(`${modelo} × ${n} = ${costo == null ? "precio no disponible (revisar dashboard de fal.ai)" : "USD " + costo}`);
if (!op.autorizado) {
  console.log("No se generó nada. Pedir aprobación al creador y repetir con --autorizado.");
  process.exit(2);
}

const dataUri = (ruta) => `data:image/${ruta.endsWith(".png") ? "png" : "jpeg"};base64,${fs.readFileSync(ruta).toString("base64")}`;
const res = await fetch(`https://fal.run/${modelo}`, {
  method: "POST",
  headers: { Authorization: `Key ${FAL}`, "Content-Type": "application/json" },
  body: JSON.stringify({ prompt, num_images: n, output_format: "png", aspect_ratio: op.aspecto ?? "16:9", ...(refs.length && { image_urls: refs.map(dataUri) }) }),
});
if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 300)}`);
const imagenes = (await res.json())?.images ?? [];
if (!imagenes.length) throw new Error("fal no devolvió imágenes");

const DIR = path.resolve("guiones", slug, "assets/medios");
fs.mkdirSync(DIR, { recursive: true });
const nombre = op.nombre ?? Date.now().toString(36);
const manifiesto = path.join(DIR, "medios.json");
const lista = fs.existsSync(manifiesto) ? JSON.parse(fs.readFileSync(manifiesto, "utf8")) : [];
for (const [i, img] of imagenes.entries()) {
  const destino = path.join(DIR, `ia-${nombre}${imagenes.length > 1 ? "-" + (i + 1) : ""}.png`);
  fs.writeFileSync(destino, Buffer.from(await (await fetch(img.url)).arrayBuffer()));
  lista.push({ archivo: path.relative(path.resolve("guiones", slug), destino).replaceAll("\\", "/"), tipo: "ia", origen: modelo,
    fuente: "Imagen generada con IA", licencia: "propia (fal.ai)", prompt, fecha: new Date().toISOString().slice(0, 10) });
  console.log("ok", path.relative(process.cwd(), destino));
}
fs.writeFileSync(manifiesto, JSON.stringify(lista, null, 2));

const nota = `imagen IA (modo imagen del skill), request ${res.headers.get("x-fal-request-id") ?? "?"}${costo == null ? "; precio no disponible en la API de fal" : ""}`;
if (!fs.existsSync("costos/costos.csv")) {
  fs.mkdirSync("costos", { recursive: true });
  fs.writeFileSync("costos/costos.csv", "fecha,nombre_video,proveedor_imagen,modelo_imagen,imagenes_generadas,costo_imagen_usd,proveedor_voz,modelo_voz,costo_voz_usd,costo_video_ia_usd,costo_total_usd,nota\r\n");
}
fs.appendFileSync("costos/costos.csv",
  `${new Date().toISOString().slice(0, 10)},${slug},fal.ai,${modelo},${imagenes.length},${costo ?? ""},,,,0,${costo ?? ""},"${nota}"\r\n`);
