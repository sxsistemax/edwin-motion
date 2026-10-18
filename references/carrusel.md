# Carrusel (modo `carrusel <slug> [--personaje]`)


Un carrusel se lee deslizando con el pulgar: **cada lámina es una idea que golpea**, el conjunto
avanza y termina en una acción. Las láminas son "el cuadro más fuerte" de una escena edwin-motion:
Anton gigante, tarjetas brutalistas con sombra dura, sellos, chips, cifras enormes y un objeto
protagonista. Sin fotos de banco, sin plantillas, sin imágenes generadas.

**1080×1350 (4:5). Por defecto 7 láminas:** 1 `hook` · 5 de contenido · 1 `cta`. Si el creador pide
otro número o el contenido tiene una forma fija (ej. "los 7 pasos del guion" → portada + 7 + CTA = 9),
manda eso. Una idea por lámina; nunca dos pasos en una.
**Personaje:** solo si el pedido trae `--personaje` (o el creador lo dice). Por defecto, sin él
(`"personaje": false`: el renderizador ignora los visuales `presentador`).

## Archivos

- `plantillas/carrusel/carrusel.html` — renderizador: lee `carrusel.json` y dibuja la lámina `?s=N`. Encoge el texto
  solo (`--k`) hasta que cabe y lo agranda si sobra espacio; respeta los `\n` del JSON.
- `plantillas/carrusel/capturar.mjs` — `node <skill>/plantillas/carrusel/capturar.mjs <carpeta>` (levanta su propio servidor) → `<carpeta>/slide-01.png … slide-07.png`.
- `plantillas/carrusel/fuentes/` — Anton, Poppins 800/900, JetBrains Mono, Source Serif itálica.

## Flujo

1. **Fuente.** Leer lo que ya existe del tema: `guiones/<slug>/guion.md`, los `*.words.json` del
   Short o del largo, `out/<slug>/publicacion.md`. El carrusel **no inventa**: cifras solo las del
   guion o las medidas (`costos/costos.csv`); sin dato real, no hay `stats`/`number`.
2. **Copy** → `guiones/<slug>/publicacion/carrusel/carrusel.json` (formato abajo), con las reglas de copy.
3. **Visuales** de cada lámina (en la misma carpeta):
   - `cuadro`: un cuadro real del video (`ffmpeg -ss <s> -i <short.mp4> -frames:v 1 cuadros/cNN.png`),
     elegido donde la pantalla está llena y **sin repetir lo que dice el texto**.
   - `html`: un objeto propio dibujado en HTML/SVG dentro de la franja inferior (1080×590, y=760):
     onda de voz, tarjeta de código, recibo, contador, el objeto protagonista del video… Paleta y
     tipografías del canal; nada aleatorio (fórmulas fijas tipo `(i*137)%9`).
   - `presentador`: pose del personaje (`guiones/<slug>/assets/img/pj-*.png`, o generarlas con
     `scripts/presentador.py`). Solo con `--personaje`.
   - Láminas de listas, pasos o comparación van **sin visual**: el texto llena la lámina.
4. **Capturar** y **mirar** todas las láminas (hoja de contacto con `ffmpeg … hstack`). Corregir:
   texto diminuto (líneas demasiado largas → más `\n`), palabra sola en la última línea, visual
   que tapa texto, glifos que Anton no tiene (`«»` → `“”`).
5. **Entrega:** copiar `slide-*.png` a `out/<slug>/carrusel/` y agregar a `out/<slug>/publicacion.md`
   una sección "Carrusel" con el texto del post por red (Instagram, LinkedIn, Facebook).
   **El carrusel lleva su propio texto**:
   - Se escribe para un carrusel: habla de las láminas ("estos son los 7 pasos…"), invita a
     deslizar o guardar, y lleva al video completo. Nunca copia ni adapta el texto del Short o del
     largo, y nunca dice "este video" (un carrusel no es un video).
   - Puede abrir con la misma promesa de la portada, pero el resto es nuevo.
   - **No se tocan los textos del Short ni del largo** al hacer el carrusel: si algo de ellos
     parece desalineado, se le pregunta al creador.
   - CTA = acción + para qué, igual que en todo el canal.

## Reglas de copy

**Arco:** el hook abre una tensión → las 5 láminas la desarrollan (una idea por lámina, en
secuencia lógica; si dos se pueden intercambiar sin notarse, no hay progresión) → el cta pide una
acción. Cada lámina se entiende sola.

**Variedad:** nunca el mismo tipo dos veces seguidas; en las 5 de contenido, al menos 4 tipos.
El tipo sale de la forma del contenido: enumeración → `list`; requisitos → `checklist`; pasos en
orden → `process`; antes/después o dos opciones → `comparison`; ventajas/desventajas → `body` con
`points`; una cifra real → `number`; varias → `stats`; cita real y atribuible → `quote`; lo demás → `body`.

| Tipo | Campos | Límites |
|---|---|---|
| `hook` | `text`, `highlight`, `sello`? | ≤ 90 car., 2-4 líneas. Afirma algo: contradice una creencia o nombra un dolor. Nada de "¿Sabías que…?" |
| `body` | `title`, `text` ó `points` [{`type`: plus\|minus, `text`}] | título ≤ 42; texto ≤ 180 y ≤ 4 líneas; 3-4 puntos de ≤ 50 |
| `list` / `checklist` | `title`, `items` | 3-4 ítems de ≤ 55 (≤ 50 checklist), misma estructura gramatical, sin numerar |
| `process` | `title`, `steps` [{`title`, `text`}] | 3-4 pasos; título ≤ 18 (un verbo); texto ≤ 65 |
| `comparison` | `leftLabel`, `leftItems`, `rightLabel`, `rightItems` | etiquetas ≤ 14; 3 ítems por lado de ≤ 38, enfrentados uno a uno |
| `number` | `bigNumber`, `title`, `text` | ≤ 5 car. ("0,44", "24h"); título ≤ 36; texto ≤ 130 |
| `stats` | `title`, `stats` [{`value`, `label`}] | 2-3; valor ≤ 6, etiqueta ≤ 22. Solo cifras verificadas |
| `quote` | `text`, `author`, `role` | ≤ 110; nunca una cita inventada |
| `cta` | `text`, `highlight`, `handle`? | ≤ 70, 2-4 líneas. **Acción + para qué** ("Comenta SKILL y te envío gratis el skill…"), nunca "Sígueme para más" |

- `badge` "01"…"05" en las de contenido; hook y cta sin badge.
- `highlight`: texto LITERAL de esa lámina, ≤ 2 palabras, el concepto (no el conector); 2-3 en todo el carrusel.
- `\n` donde cambia el sentido, no donde se acaba el renglón; nunca una palabra sola al final.
  El renderizador NO parte renglones en hook, cta, títulos y párrafos: cada `\n` es un renglón y,
  si uno es largo, todo el texto se encoge. Renglones de ≤ 18 car. en hook/cta, ≤ 22 en títulos
  y ≤ 38 en párrafos.
- Tono del canal: tú, frases cortas, verbos concretos, un poco de humor; español de Colombia con
  tildes y ¿ ¡; sin voseo. Prohibido: "hoy en día", "revolucionario", "potencia tu", "descubre
  cómo", "no te lo pierdas", hashtags o emojis dentro de las láminas, hablar del carrusel ("en
  este slide…"), "4 de 7", "Desliza →".

## Formato de `carrusel.json`

```json
{
  "tema": { "marca": "EDWIN·IA / ASÍ SE HIZO", "acento": "#ff6b1a", "fondo": "#08111f" },
  "personaje": false,
  "slides": [
    { "type": "hook", "text": "Este video\nno lo grabé.", "highlight": "no lo grabé", "sello": "SIN CÁMARA",
      "visual": { "tipo": "cuadro", "img": "cuadros/c12.4.png", "lado": "der", "recorte": 60 } },
    { "type": "body", "badge": "01", "title": "…", "text": "…", "visual": { "tipo": "html", "html": "<div …>…</div>" } },
    { "type": "process", "badge": "02", "title": "…", "steps": [{ "title": "…", "text": "…" }] },
    { "type": "cta", "text": "Comenta SKILL\ny te envío…", "highlight": "SKILL",
      "visual": { "tipo": "presentador", "img": "../../assets/img/pj-senala.png", "lado": "der" } }
  ]
}
```
`tema` acepta cualquier variable CSS del renderizador (`acento`, `fondo`, `rojo`, `amarillo`,
`texto`, `tinta`) para darle a cada carrusel la paleta de su video. `visual.lado`: `izq` | `centro`
| `der`; `recorte` sube el cuadro N px. `sello` y `chip` caen en la esquina libre de abajo.
`visual.horizontal: true` = cuadro de un video 16:9 (el largo) en tarjeta apaisada. En `visual.html`
las imágenes van con ruta absoluta desde la raíz del repo (`/out/<slug>/largo/miniatura.png`).
`comparison` acepta `title`. Cada lámina acepta `marca` propia: úsala para "… · EJEMPLO ILUSTRATIVO"
en las láminas con datos inventados (regla del canal).
