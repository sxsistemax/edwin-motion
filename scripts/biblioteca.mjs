// Biblioteca del canal (modo `biblioteca`): junta en un índice todo lo ya descargado o generado —medios
// reales (medios.json de cada tema), imágenes IA, sonidos y camas de música— para reutilizarlo entre
// videos en vez de volver a buscarlo, bajarlo o pagarlo. Los duplicados (mismo contenido) se cuentan una
// vez, con la lista de temas donde se usaron.
//
// Uso (desde la raíz del repo):
//   node .claude/skills/edwin-motion/scripts/biblioteca.mjs                       reconstruye guiones/BIBLIOTECA.md
//   node .claude/skills/edwin-motion/scripts/biblioteca.mjs buscar <texto> [--tipo sfx|foto|video|captura|documento|ia|musica]
//   node .claude/skills/edwin-motion/scripts/biblioteca.mjs usar <archivo> <slug>  copia al tema con su fuente/licencia
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const SKILL_SFX = ".claude/skills/edwin-motion/assets/sfx";
const MEDIAUSE_SFX = path.join(os.homedir(), ".claude/skills/media-use/audio/assets/sfx");
const rel = (p) => path.relative(process.cwd(), p).replaceAll("\\", "/");
const hash = (p) => crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex").slice(0, 12);
const slugDe = (p) => rel(p).split("/")[1];

function recorrer(dir, filtro, salida = []) {
  if (!fs.existsSync(dir)) return salida;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === "skill-publico" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, filtro, salida);
    else if (filtro(p)) salida.push(p);
  }
  return salida;
}

function indexar() {
  const items = new Map(); // hash → item
  const agregar = (archivo, datos, slug) => {
    const h = hash(archivo);
    const it = items.get(h) ?? { id: h, archivo: rel(archivo), nombre: path.basename(archivo, path.extname(archivo)), usadoEn: [], ...datos };
    if (slug && !it.usadoEn.includes(slug)) it.usadoEn.push(slug);
    items.set(h, it);
  };

  // Sonidos: primero las bibliotecas fuente (para que el archivo índice apunte ahí), luego las copias de cada video.
  const manifiesto = fs.existsSync(path.join(MEDIAUSE_SFX, "manifest.json")) ? JSON.parse(fs.readFileSync(path.join(MEDIAUSE_SFX, "manifest.json"), "utf8")) : {};
  for (const p of recorrer(SKILL_SFX, (f) => f.endsWith(".mp3"))) agregar(p, { tipo: "sfx", fuente: "Biblioteca del canal (skill)", licencia: "propia / Pixabay" });
  for (const p of recorrer(MEDIAUSE_SFX, (f) => f.endsWith(".mp3")))
    agregar(p, { tipo: "sfx", fuente: "media-use (Pixabay)", licencia: "Pixabay", descripcion: Object.values(manifiesto).find((m) => m.file === path.basename(p))?.description ?? "" });
  for (const p of recorrer("guiones", (f) => /[\\/]assets[\\/]sfx[\\/][^\\/]+\.mp3$/.test(f))) agregar(p, { tipo: "sfx", fuente: "copia de un video", licencia: "ver sonidos.md del tema" }, slugDe(p));

  // Medios reales e imágenes IA anotados por medios.mjs / imagen.mjs.
  for (const m of recorrer("guiones", (f) => f.endsWith("medios.json"))) {
    const proyecto = path.resolve(path.dirname(m), "../..");
    for (const e of JSON.parse(fs.readFileSync(m, "utf8"))) {
      const p = path.join(proyecto, e.archivo);
      if (fs.existsSync(p)) agregar(p, { tipo: e.tipo, fuente: e.fuente, licencia: e.licencia, origen: e.origen, descripcion: e.prompt ?? "" }, slugDe(p));
    }
  }

  // Camas de música: solo de referencia (regla del canal: cama nueva por video), con su prompt si ESTILO.md lo trae.
  for (const p of recorrer("guiones", (f) => /[\\/]assets[\\/]bgm[\\/]cama\.wav$/.test(f))) {
    const estilo = path.join(path.dirname(p), "../../ESTILO.md");
    const prompt = fs.existsSync(estilo) ? fs.readFileSync(estilo, "utf8").match(/Prompt:\s*\n?([\s\S]*?)(?:\n\s*\n|$)/)?.[1]?.trim() ?? "" : "";
    agregar(p, { tipo: "musica", fuente: "MusicGen local", licencia: "propia", descripcion: prompt }, slugDe(p));
  }
  return [...items.values()];
}

const [cmd, a, b, ...resto] = process.argv.slice(2);
const items = indexar();

if (!cmd) {
  const titulos = { sfx: "Sonidos", foto: "Fotos y logos", video: "Clips de video", captura: "Pantallazos", documento: "Documentos", ia: "Imágenes IA", musica: "Camas de música (solo referencia: cada video lleva cama nueva)" };
  let md = `# Biblioteca del canal\n\nGenerado por \`biblioteca.mjs\` (${new Date().toISOString().slice(0, 10)}). No editar a mano: volver a correrlo.\n` +
    `Reutilizar: \`node .claude/skills/edwin-motion/scripts/biblioteca.mjs usar <archivo> <slug>\`.\n`;
  for (const [tipo, titulo] of Object.entries(titulos)) {
    const lista = items.filter((i) => i.tipo === tipo).sort((x, y) => x.nombre.localeCompare(y.nombre));
    if (!lista.length) continue;
    md += `\n## ${titulo} (${lista.length})\n\n| Nombre | Archivo | Fuente · licencia | Usado en | Descripción |\n|---|---|---|---|---|\n`;
    for (const i of lista)
      md += `| ${i.nombre} | \`${i.archivo}\` | ${i.fuente || "⚠ sin fuente"} · ${i.licencia} | ${i.usadoEn.join(", ")} | ${(i.descripcion ?? "").replace(/\s+/g, " ").replaceAll("|", "/").slice(0, 140)} |\n`;
  }
  fs.writeFileSync("guiones/BIBLIOTECA.md", md);
  const cuenta = Object.keys(titulos).map((t) => `${t} ${items.filter((i) => i.tipo === t).length}`).join(" · ");
  console.log(`ok guiones/BIBLIOTECA.md — ${cuenta}`);
} else if (cmd === "buscar") {
  const tipo = [b, ...resto].join(" ").match(/--tipo\s+(\S+)/)?.[1];
  const q = (a ?? "").toLowerCase();
  for (const i of items.filter((i) => (!tipo || i.tipo === tipo) && JSON.stringify(i).toLowerCase().includes(q)))
    console.log(`${i.tipo.padEnd(9)} ${i.archivo}  [${i.fuente} · ${i.licencia}]  ${i.usadoEn.join(",")}  ${(i.descripcion ?? "").slice(0, 80)}`);
} else if (cmd === "usar") {
  if (!a || !b) throw new Error("Uso: biblioteca.mjs usar <archivo> <slug>");
  const i = items.find((x) => x.archivo === a.replaceAll("\\", "/")) ?? items.find((x) => x.id === hash(a));
  if (!i) throw new Error(`${a} no está en la biblioteca (correr medios.mjs o imagen.mjs primero)`);
  if (i.tipo === "musica") throw new Error("Las camas no se reutilizan: cada video lleva cama nueva (modo musica)");
  const destDir = path.resolve("guiones", b, i.tipo === "sfx" ? "assets/sfx" : "assets/medios");
  fs.mkdirSync(destDir, { recursive: true });
  const destino = path.join(destDir, path.basename(i.archivo));
  fs.copyFileSync(i.archivo, destino);
  if (i.tipo !== "sfx") {
    const m = path.join(destDir, "medios.json");
    const lista = fs.existsSync(m) ? JSON.parse(fs.readFileSync(m, "utf8")) : [];
    if (!lista.some((e) => e.archivo.endsWith(path.basename(destino))))
      lista.push({ archivo: "assets/medios/" + path.basename(destino), tipo: i.tipo, origen: i.origen ?? i.archivo, fuente: i.fuente, licencia: i.licencia, fecha: new Date().toISOString().slice(0, 10), reutilizado: i.archivo });
    fs.writeFileSync(m, JSON.stringify(lista, null, 2));
  }
  console.log("ok", rel(destino));
} else {
  console.error("comando desconocido (buscar | usar | sin argumentos para reindexar)");
  process.exit(1);
}
