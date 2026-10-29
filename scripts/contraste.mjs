// Verifica el contraste WCAG de los pares declarados en un ui-kit.css.
// Uso: node <skill>/scripts/contraste.mjs <ruta/ui-kit.css>
// Pares en comentarios del CSS:  /* @par <var-texto> <var-fondo> <mínimo> */  (sin los "--")
// Sale con código 1 si algún par no llega a su mínimo.
import { readFileSync } from 'node:fs';

const css = readFileSync(process.argv[2] ?? 'identidad/ui-kit.css', 'utf8');
const vars = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const hex = n => {
  let v = vars[n];
  for (let i = 0; v?.startsWith('var('); i++) v = i < 5 ? vars[v.slice(6, -1)] : undefined; // var(--x) encadenadas
  if (!/^#[0-9a-f]{6}$/i.test(v ?? '')) throw new Error(`--${n} no es un hex de 6 dígitos: ${v}`);
  return v;
};
const lum = h => {
  const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let fallas = 0;
const pares = [...css.matchAll(/@par\s+([\w-]+)\s+([\w-]+)\s+([\d.]+)/g)];
for (const [, fg, bg, min] of pares) {
  const r = ratio(hex(fg), hex(bg));
  const ok = r >= Number(min);
  if (!ok) fallas++;
  console.log(`${ok ? '✔' : '✘'} ${fg} sobre ${bg}: ${r.toFixed(2)}:1 (mín. ${min})`);
}
if (!pares.length) { console.error('Sin pares @par en el CSS.'); process.exit(1); }
console.log(fallas ? `${fallas} par(es) por debajo del mínimo.` : `${pares.length} pares OK.`);
process.exit(fallas ? 1 : 0);
