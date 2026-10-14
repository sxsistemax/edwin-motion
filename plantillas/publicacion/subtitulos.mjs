// Genera los subtítulos .srt del video largo y los capítulos para YouTube, a
// partir de los tiempos reales de cada palabra (assets/audio/NN.words.json) y
// del inicio de cada escena en el video (tiempos.json, que escribe armar.mjs).
// Uso (desde guiones/<slug>): node publicacion/subtitulos.mjs   (cambiar SLUG abajo)
// Si la voz pronuncia algo distinto a como se escribe (ej. "Yev" por "Jev"), corregirlo en el .replace de abajo.
import fs from "fs";
const SLUG = "mi-video";

const { escenas } = JSON.parse(fs.readFileSync("tiempos.json", "utf8"));
const MAX_CAR = 42; // por línea, como recomienda YouTube

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const cues = [];
for (const e of escenas) {
  const archivo = `assets/audio/${e.n}.words.json`;
  if (!fs.existsSync(archivo)) continue;
  const palabras = JSON.parse(fs.readFileSync(archivo, "utf8"))
    .filter((w) => !/^\[.*\]$/.test(w.text) && w.text !== "—")
    .map((w) => ({ ...w, text: w.text.replace(/^\[[^\]]*\]/, "").replace(/^Yev/, "Jev").replace(/^Nul/, "noul") }));
  let actual = [];
  const cerrar = () => {
    if (!actual.length) return;
    cues.push({ ini: e.start + actual[0].start, fin: e.start + actual.at(-1).end, texto: actual.map((w) => w.text).join(" ") });
    actual = [];
  };
  for (const w of palabras) {
    const largo = [...actual, w].map((x) => x.text).join(" ").length;
    if (actual.length && largo > MAX_CAR * 2) cerrar();
    actual.push(w);
    if (/[.?!…]$/.test(w.text) || (/[,:;]$/.test(w.text) && largo > MAX_CAR)) cerrar();
  }
  cerrar();
}

// Partir en dos líneas por el espacio más cercano a la mitad.
const dosLineas = (t) => {
  if (t.length <= MAX_CAR) return t;
  const mitad = t.length / 2;
  let mejor = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (mejor < 0 || Math.abs(i - mitad) < Math.abs(mejor - mitad))) mejor = i;
  return t.slice(0, mejor) + "\n" + t.slice(mejor + 1);
};

const srt = cues.map((c, i) => `${i + 1}\n${ts(c.ini)} --> ${ts(Math.max(c.fin, c.ini + 0.8))}\n${dosLineas(c.texto)}\n`).join("\n").replace(/llama C P P/g, "llama.cpp");
fs.writeFileSync(`publicacion/${SLUG}.es.srt`, srt);
console.log(`ok publicacion/${SLUG}.es.srt (${cues.length} subtítulos)`);

const NOMBRES = {
  "01-gancho": "La IA que no habla: te devuelve un número",
  "02-que-es": "Qué es Jev: el LLM escribe, Jev decide",
  "03-tres-preguntas": "Las 3 preguntas: noul, choice y score",
  "04-problema": "El ejemplo: 200 hojas de vida",
  "05-instalar": "Paso 1 y 2: instalar y armar el estado",
  "06-anonimizar": "Paso 3: anonimizar con Mistral o un modelo local",
  "07-preguntas": "Paso 4: las preguntas en código",
  "08-respuesta": "Paso 5: leer la respuesta y decidir en tu código",
  "09-costo": "Cuánto cuesta",
  "10-sin-humo": "Sin humo: lo que no te dicen",
  "11-cierre": "Parte 2 y despedida",
};
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const capitulos = escenas.filter((e) => NOMBRES[e.slug]).map((e) => `${mmss(e.slug === "01-gancho" ? 0 : e.start)} ${NOMBRES[e.slug]}`);
fs.writeFileSync("publicacion/capitulos.txt", capitulos.join("\n") + "\n");
console.log(capitulos.join("\n"));
