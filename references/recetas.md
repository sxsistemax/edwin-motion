# Recetas de movimiento edwin-motion

Bloques probados (Short v2 y largo v2 de `guiones/burbuja-ia/`). Todos son GSAP sobre la
timeline pausada `tl`, deterministas y seguros para buscar a cualquier instante. Cambiar
colores, fuentes y objetos libremente: lo que se conserva es el **movimiento**.

## Curvas y tiempos (la "sensación")

| Momento | Duración | Ease |
|---|---|---|
| Entrada de palabra/etiqueta | 0,20–0,25 s | `power3.out` (con y: 20–50 px) |
| Tarjeta/panel que entra | 0,40–0,55 s | `power3.out` (desde y: +900 o x: −900) |
| Pop (casilla, nodo, pastilla) | 0,18–0,30 s | `back.out(2–2.5)` |
| Letras que caen (titulares) | 0,32 s, escalonado 0,06–0,07 s | `back.out(1.7)` |
| Golpe / sello | 0,14–0,18 s, escala 2,4 → 1 | `power4.in` (+ temblor al aterrizar) |
| Contador | 0,7–0,9 s | `power3.out` |
| Línea que se dibuja | 1,0–1,4 s | `power1.in` subida, `power2.in` caída |
| Respiración (personaje, burbuja) | 0,6–0,9 s por medio ciclo, yoyo | `sine.inOut` |
| Salida | 0,15–0,35 s | `power2.in` |

**Sacudida/temblor de un elemento que ENTRA desde fuera:** usar `tl.to(el, { keyframes: [...] }, t)`, nunca
`tl.fromTo(el, { x: 0 }, { keyframes: [...], immediateRender: false }, t)`: con keyframes el `immediateRender: false`
no se respeta, el `x: 0` se pinta desde el inicio y el elemento aparece antes de su entrada (le pasó a la tarjeta 2
de las "señales a vigilar" de burbuja-ia). Igual con destellos tras un warp de tiempos: `set` + `to` en vez de `fromTo`.

Regla de oro: **entra rápido, se asienta con rebote y luego se queda vivo** (respira, gira,
flota). Nada aparece "por fundido lento" y nada se queda completamente quieto más de ~8 s.

## 1. Palabras al ritmo de la voz

```js
// W.* = start de cada palabra en assets/audio/NN.words.json
[W.una, W.empresa, W.llego].forEach((t, i) =>
  tl.fromTo(`#x-kick span:nth-child(${i + 1})`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, t));
```
Cada palabra en `<span style="display:inline-block">`. Solo palabras clave y cifras, no el guion entero.

## 2. Titular que cae letra por letra (editorial)

```js
for (let i = 0; i < N; i++) {
  const dy = -500 - ((i * 137) % 300), rot = ((i * 53) % 30) - 15;   // "aleatorio" fijo
  tl.fromTo(`#x-big span:nth-child(${i + 1})`, { y: dy, rotation: rot, opacity: 0 },
    { y: 0, rotation: 0, opacity: 1, duration: 0.34, ease: "back.out(1.7)" }, t0 + i * 0.06);
}
TEMBLOR(t0 + 0.3);
```
Variante "tecleo" (tablero): `tl.fromTo("#x-title span", { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.07 }, t)`.

## 3. Objeto que pasa ENTRE las letras

Dos copias idénticas del texto; el objeto va en medio en el orden del DOM; la copia de
adelante se recorta para mostrar solo una mitad. El objeto queda detrás de una mitad y
delante de la otra.
```html
<div id="x-back" class="big" data-layout-allow-overlap data-layout-allow-occlusion>…</div>
<div id="x-obj" data-layout-allow-overflow data-layout-allow-overlap data-layout-allow-occlusion>…</div>
<div id="x-front" class="big" data-layout-allow-overlap data-layout-allow-occlusion>…</div>
<style> #x-front { clip-path: inset(0 0 0 52%); } </style>
```
```js
tl.fromTo("#x-obj", { x: 2000 }, { x: 1150, duration: 1.0, ease: "power2.out" }, t);   // entra
tl.to("#x-obj", { x: 400, duration: 2.0, ease: "sine.inOut" }, t + 1.0);               // cruza lento
tl.to("#x-obj", { x: -500, duration: 1.0, ease: "power2.in" }, t + 3.0);               // sale
```
Animar las dos copias del texto con el mismo selector (`#x-back span:nth-child(i), #x-front span:nth-child(i)`).
Objetos usados: burbuja, locomotora, cohete, billete, chip. Cualquier objeto del tema sirve.

## 4. Objeto colgando de un hilo (aguja, anzuelo, etiqueta de precio)

Contenedor alto con el hilo (div de 2 px) y el objeto en la punta; nace fuera del cuadro
(`top` negativo, `data-layout-allow-overflow`). Baja lento y acelera al final para el impacto:
```js
tl.fromTo("#x-pin", { y: 0 }, { y: 800, duration: 3.0, ease: "sine.inOut" }, t);
tl.to("#x-pin", { y: 900, duration: 0.25, ease: "power3.in" }, tImpacto - 0.25);
```

## 5. Ruptura / estallido

```js
tl.to("#x-obj", { scale: 1.12, opacity: 0, duration: 0.08 }, t);
tl.fromTo("#x-ring", { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.9, duration: 0.45, ease: "power2.out" }, t);
for (let i = 0; i < N; i++) {                       // gotas/partículas con ángulos fijos
  const a = (i / N) * Math.PI * 2 + (i % 3) * 0.17, r = 260 + (i * 53) % 220;
  tl.fromTo(`.x-gota:nth-child(${i + 1})`, { x: 0, y: 0, opacity: 1, scale: 1 },
    { x: Math.cos(a) * r, y: Math.sin(a) * r + 120, opacity: 0, scale: 0.3, duration: 0.7, ease: "power3.out" }, t);
}
tl.fromTo("#x-flash", { opacity: 0.8 }, { opacity: 0, duration: 0.25, immediateRender: false }, t);
TEMBLOR(t + 0.03, 1.1);
```
Grieta partida: dos copias de la palabra con `clip-path: polygon(...)` en zigzag
complementario; en el impacto se separan (`x: ±20, rotation: ±3`).

## 6. Sello / golpe

```js
GOLPE("#x-sello", t);  TEMBLOR(t + 0.18);   // sonido "golpe" en t + 0.18 (sidecar)
```
Sello = Anton grande, borde de 12 px del mismo color, `border-radius: 18px`, `rotate(-7deg)`,
fondo semitransparente del color del papel. Siempre con `data-layout-allow-overlap data-layout-allow-occlusion`.

## 7. Contador

```js
const c = { n: 0 };
tl.to(c, { n: 40000, duration: 0.9, ease: "power3.out",
  onUpdate: () => { el.textContent = Math.round(c.n).toLocaleString("es-CO"); } }, t);
tl.fromTo("#x-num", { scale: 0.7, transformOrigin: "0 50%" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
```
`font-variant-numeric: tabular-nums` para que no baile. Nunca `tl.set(el, { textContent })`.

## 8. Barras, casillas, recibo

```js
tl.fromTo("#x-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, t);      // transform-origin: 0 50%
tl.fromTo(".x-sq", { scale: 0 }, { scale: 1, duration: 0.18, stagger: 0.025, ease: "back.out(2)" }, t);
// casilla con chulo: fondo que crece + trazo SVG que se dibuja
tl.fromTo(`${fila} .fill`, { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2.5)" }, t);
tl.fromTo(`${fila} path`, { strokeDashoffset: 80 }, { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, t + 0.08);
```
Recibo: tarjeta blanca, borde negro 4 px, sombra dura `10px 10px 0 #111`, borde inferior
en zigzag con `clip-path: polygon(...)`, etiquetas en mono.

## 9. Gráfica que se dibuja con punto en la punta

```js
const L = path.getTotalLength();            // medir al construir, NO dentro de callbacks
path.style.strokeDasharray = L;
const p = { l: 0 };
tl.fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, ease: "power1.in" }, t);
tl.fromTo(p, { l: 0 }, { l: L, duration: 1.4, ease: "power1.in", onUpdate: () => {
  const q = path.getPointAtLength(p.l); gsap.set("#x-tip", { attr: { cx: q.x, cy: q.y } }); } }, t);
tl.fromTo("#x-tip", { opacity: 0 }, { opacity: 1, duration: 0.05 }, t);
```
No usar `pathLength="1"` (no renderiza). Tramo de caída en otro `path` de color de alarma.

## 10. Paquetes que viajan por líneas (diagramas de flujo)

```js
["#p1", "#p2", "#p3"].forEach((p, i) =>
  tl.fromTo(p, { y: 0, opacity: 1 }, { y: 230, duration: 0.7, ease: "none", repeat: 2 }, t + i * 0.25));
```
Líneas punteadas (`repeating-linear-gradient` o `stroke-dasharray`) entre tarjetas; puntos
de 17 px con borde negro. Para trayectorias curvas, usar `getPointAtLength` como en la receta 9.

## 11. Presentador + etiqueta de palabra clave

```js
tl.fromTo("#x-pj", { y: 600 }, { y: 0, duration: 0.5, ease: "back.out(1.4)" }, t0);
tl.fromTo("#x-pj", { rotation: 0, transformOrigin: "50% 100%" },
  { rotation: 1.6, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: Math.floor(dur / 0.6) - 1, immediateRender: false }, t0 + 0.5);
const POSE = (id, t) => { tl.set("#x-pj img", { opacity: 0 }, t); tl.set(id, { opacity: 1 }, t); };
KEYS.forEach(([id, t], i) => {   // [["#k1", W.unica], ["#k2", W.elon], …]
  tl.fromTo(id, { opacity: 0, scale: 0.6, rotation: -6 }, { opacity: 1, scale: 1, rotation: -2, duration: 0.22, ease: "back.out(2.4)" }, t);
  tl.to(id, { opacity: 0, duration: 0.05 }, i + 1 < KEYS.length ? KEYS[i + 1][1] - 0.05 : fin);
});
```
Poses: `pj-brazos` (serio), `pj-senala` / `pj-apunta` / `pj-apunta-espejo` (señala; elegir la que apunte hacia el contenido), `pj-abre` (explica), `pj-celebra`
(buena noticia / cierre). Cambiar de pose en las palabras fuertes, no al azar.

## 12. Objeto vivo (nunca estático)

```js
tl.fromTo("#x-film", { rotation: 0 }, { rotation: 300, duration: dur, ease: "none" }, 0);           // brillo que gira
tl.fromTo("#x-obj", { y: 0 }, { y: -18, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 6, immediateRender: false }, t);
```
Burbuja tornasolada CSS: `radial-gradient` con brillo + anillo `conic-gradient` enmascarado
(`mask: radial-gradient(circle, transparent 52%, #000 76%, #000 97%, transparent 100%)`).
Sobre fondo oscuro, `mix-blend-mode: screen`; sobre papel claro, sin blend y con borde más oscuro.

## 13. Isométrico CSS

```css
#x-iso { transform: rotateX(58deg) rotateZ(-45deg); transform-style: preserve-3d; }
```
Capas apiladas que caen: `tl.fromTo(capa, { z: 700, opacity: 0 }, { z: i * 34, opacity: 1, duration: 0.35, ease: "bounce.out" }, t + i * 0.22)`.

## 14. Corte duro entre paneles + destello

Dentro de la escena: `CORTE("#p1", "#p2", t)` (plantilla). Entre escenas, `armar.mjs` pone un
destello blanco de 0,14 s (`opacity 0.6 → 0`). Cambiar de fondo/técnica en el corte es lo que
da la energía de los videos de referencia.

## 15. Boca del presentador al ritmo de la voz

`scripts/presentador.py` genera, junto a cada pose, `pj-<pose>-boca.png` (misma imagen con la boca
abierta, pintada dentro de los dientes reales: los dientes de abajo pasan a interior oscuro con lengua).
En `pj-celebra`, que ya ríe con la boca abierta, la `-boca` es la boca casi cerrada: los dientes de arriba
se copian invertidos sobre el hueco (dos filas con contorno y sombra; aprobado por Edwin 13-oct-2026, no
rellenar con blanco plano). Si cambia el arte del personaje, revisar las cajas de boca en `POSES`. Cada pose va en un contenedor con las dos imágenes
y la boca se prende y apaga por sílaba con los tiempos de `NN.words.json`:
```html
<div class="ps a"><img src="../../assets/img/pj-abre.png" /><img class="boca" src="../../assets/img/pj-abre-boca.png" /></div>
<style> .x-pj .ps { position: absolute; inset: 0; opacity: 0; } .x-pj img { position: absolute; left: 0; top: 0; width: 100%; } .x-pj img.boca { opacity: 0; } </style>
```
```js
// P = [[inicio, fin, letras], …] de las palabras dichas mientras se ve el presentador (sin las [etiquetas])
const HABLA = (pj, P) => P.forEach(([a, b, n]) => {
  const k = Math.max(1, Math.round(n / 3)), seg = Math.min(b - a, n * 0.075 + 0.06) / k;
  for (let i = 0; i < k; i++) { tl.set(`${pj} img.boca`, { opacity: 1 }, a + i * seg); tl.set(`${pj} img.boca`, { opacity: 0 }, a + i * seg + seg * 0.55); }
});
// pose = contenedor: tl.set(`${pj} .ps`, { opacity: 0 }, t); tl.set(`${pj} .ps.a`, { opacity: 1 }, t);
```
Sacar `P` con node: `words.filter(w => !w.text.startsWith("[") && w.start >= t0 && w.start < t1)`.
Ojo: un `tl.set` en t = 0 exacto no se repinta al buscar; la primera pose va en 0.02.

## 16. Girar piezas SVG (ruedas, engranajes, agujas)

No girar un `<g>`/`<path>` de SVG con `rotation` de GSAP + `transform-origin`/`transform-box` en CSS:
las ruedas del tren de `burbuja-ia` orbitaban por la pantalla. Girar con el atributo del SVG y su centro:
```js
const giro = { a: 0 };
tl.fromTo(giro, { a: 0 }, { a: -2200, duration: 5.6, ease: "none", onUpdate: () =>
  document.querySelectorAll("#x-loco .rueda").forEach((g) => { const c = g.querySelector("circle");
    g.setAttribute("transform", `rotate(${giro.a} ${c.getAttribute("cx")} ${c.getAttribute("cy")})`); }) }, t);
```
(Elementos HTML, no SVG, sí se giran normal con `rotation`.) En capturas, mirar 2-3 instantes del giro, no solo el inicio.

## 17. Sonido en cada movimiento (automático)

`scripts/sonidos.mjs` abre cada escena en Chrome headless (puppeteer-core del caché de npx), recorre la timeline ya
construida y asigna un efecto por tipo de movimiento:

| Movimiento | Efecto | Vol. |
|---|---|---|
| Entra de lado (abs(x) ≥ 400 px) | `desliza-1` / `desliza-2` / `whoosh-short` (se alternan) | 0,28-0,3 |
| Sube desde abajo (y ≥ 400 px: tarjetas, recibos) | `papel` (≥ 0,8 s entre uno y otro) | 0,28 |
| Cae desde arriba (y ≤ −250 px) | `caida` | 0,3 |
| Barra que se llena (scaleX/Y desde 0) | `llenado` | 0,22 |
| Cifra que corre (onUpdate sobre un objeto) | `acumula` (conteo que acelera y sube); si el texto alrededor tiene US$, $, USD, € o dólares: `monedas` (se apilan); si la cifra baja (valor final menor o con signo −): `disminuye` (acumula al revés). Pueden sonar encima de un golpe | 0,26 / 0,3 |
| Línea/gráfica que se dibuja (strokeDashoffset ≥ 0,45 s) / casilla marcada (corta) | `marcador` / `check` | 0,25 / 0,3 |
| Etiqueta que salta (ease back.*) | `pop-suave` (≥ 1,2 s entre uno y otro) | 0,28 |
| Tecleo · interruptor | `typing` · `click` | 0,18 · 0,35 |

Biblioteca propia del canal: `assets/sfx/` del skill (desliza-1/2, caida, llenado, tick, acumula, disminuye, monedas, marcador, papel, check,
pop-suave), generada con ElevenLabs Sound Effects (`npx tsx .claude/skills/edwin-motion/scripts/generar-sfx.ts`,
~USD 0,01 los 9; silencio inicial recortado y pico a −3 dB). El resto (whoosh, typing, click, chime, error, riser,
impact, glitch…) sale de `~/.claude/skills/media-use/audio/assets/sfx` (Pixabay, uso comercial). Volúmenes
aprobados tras la prueba de Edwin (los primeros, ~0,12, se oían muy bajitos). Al final se iguala el volumen general
del video a ~−16,5 LUFS. Para quitar o ajustar un efecto puntual: editar el `.sfx-auto.json` (o los `sfxa-N` del
index en Shorts) y volver a armar.

## 18. Re-locutar un video ya animado (warp de tiempos)

Si cambia la voz de un video ya hecho, no reescribir tiempos: mapear tiempo viejo → nuevo por tramos entre las
palabras (mismo texto) y aplicarlo **al crear** cada animación (envolver `tl.to/from/fromTo/set/call/add`: posición
`p → W(p)`, duración/stagger/keyframes escalados). Implementación: `guiones/burbuja-ia/migrar-tiempos.mjs` +
`rewarp.py`. **No** mover los hijos ya creados con `startTime()`/`timeScale()`: hacia adelante se ve bien, pero el
render salta en el tiempo y quedan letreros encimados que no desaparecen. Probar saltos desordenados
(adelante y atrás) antes de renderizar.
