// Graba con Playwright el recorrido de tutorial.json: un video .webm de toda la sesión, una captura al
// final de cada paso (pasos/NN.png, para escribir la voz) y grabacion.json con el segundo de cada clic.
// Con --explorar no graba: corre las acciones y lista los enlaces y botones de la última pantalla
// (para encontrar los selectores del menú antes de escribir los pasos).
//
// Uso (desde la carpeta del tutorial):
//   TUT_USER=... TUT_PASS=... node <skill>/scripts/grabar.mjs [tutorial.json] [--explorar]
// Las credenciales van SOLO en variables de entorno; en tutorial.json se nombra la variable ("env").
import { chromium } from 'playwright';
import fs from 'node:fs';

const args = process.argv.slice(2);
const EXPLORAR = args.includes('--explorar');
const T = JSON.parse(fs.readFileSync(args.find((a) => !a.startsWith('--')) ?? 'tutorial.json', 'utf8'));
const W = T.ancho ?? 1600, H = T.alto ?? 900, PAUSA = T.pausa ?? 2500;
const base = new URL(T.url);

fs.mkdirSync('pasos', { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: W, height: H }, ...(EXPLORAR ? {} : { recordVideo: { dir: 'grabacion', size: { width: W, height: H } } }) });
// Cursor visible: Playwright no lo pinta en el video. La posición sobrevive a la navegación.
await ctx.addInitScript(() => {
  addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M3 2l7 19 2.5-7.5L20 11z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-3px,-2px)' });
    document.body.appendChild(c);
    const xy = JSON.parse(sessionStorage.__xy || `[${innerWidth / 2},${innerHeight * 0.7}]`);
    c.style.left = xy[0] + 'px'; c.style.top = xy[1] + 'px';
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; sessionStorage.__xy = JSON.stringify([e.clientX, e.clientY]); }, true);
  });
});
const p = await ctx.newPage();
const t0 = Date.now();
const ahora = () => +((Date.now() - t0) / 1000).toFixed(3);
const quieto = async (ms = PAUSA) => { await p.waitForLoadState('networkidle').catch(() => {}); await p.waitForTimeout(ms); };
const pasos = [], clics = [];

for (const [i, paso] of T.pasos.entries()) {
  const reg = { n: i + 1, ini: null };
  for (const [k, a] of (paso.acciones ?? []).entries()) {
    const sig = paso.acciones[k + 1];
    reg.ini ??= ahora();
    if (a.ir) { await p.goto(new URL(a.ir, base).href, { waitUntil: 'networkidle' }); reg.ini = ahora(); await quieto(a.pausa ?? 1200); } // el paso arranca con la página ya cargada
    else if (a.clic) {
      const el = p.locator(a.clic).first();
      await el.scrollIntoViewIfNeeded();
      const r = await el.boundingBox();
      const x = r.x + Math.min(r.width / 2, 60), y = r.y + r.height / 2;
      await p.mouse.move(x, y, { steps: 25 });
      await p.waitForTimeout(250);
      clics.push({ paso: i + 1, t: ahora(), x, y, box: r, etiqueta: a.etiqueta ?? null });
      await p.mouse.click(x, y);
      await quieto(a.pausa ?? (sig?.escribir ? 300 : PAUSA)); // antes de escribir no hace falta esperar
    } else if (a.escribir) {
      const texto = a.env ? process.env[a.env] : a.texto;
      if (texto == null) throw new Error(`Falta la variable de entorno ${a.env}`);
      await p.locator(a.escribir).first().pressSequentially(texto, { delay: 45 });
      await p.waitForTimeout(a.pausa ?? 400);
    } else if (a.desplazar) { await p.mouse.wheel(0, a.desplazar); await p.waitForTimeout(a.pausa ?? 900); }
    else if (a.esperarOculto) { await p.getByText(a.esperarOculto).first().waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {}); await quieto(a.pausa ?? 1500); }
    else if (a.esperar) await p.waitForTimeout(a.esperar);
  }
  reg.fin = ahora();
  reg.png = `pasos/${String(i + 1).padStart(2, '0')}.png`;
  reg.url = p.url();
  await p.screenshot({ path: reg.png });
  pasos.push(reg);
  console.log(`paso ${i + 1} ${reg.ini}→${reg.fin}s ${reg.url}`);
}

if (EXPLORAR) {
  await p.screenshot({ path: 'pasos/explorar.png' });
  console.log(await p.evaluate(() => [...document.querySelectorAll('a, button, input, select, [role=menuitem], [role=tab]')]
    .filter((e) => e.offsetParent)
    .map((e) => `${e.tagName.toLowerCase()}${e.getAttribute('href') ? ` href="${e.getAttribute('href')}"` : ''}${e.type ? ` type=${e.type}` : ''} · ${(e.innerText || e.getAttribute('aria-label') || e.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 60)}`)
    .join('\n')));
  await b.close();
} else {
  await p.waitForTimeout(800);
  const webm = await p.video().path();
  await ctx.close(); await b.close();
  fs.writeFileSync('grabacion.json', JSON.stringify({ webm, ancho: W, alto: H, fin: ahora(), pasos, clics }, null, 1));
  console.log('grabación:', webm);
}
