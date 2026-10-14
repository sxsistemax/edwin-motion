---
name: edwin-motion
description: Lenguaje de animación para videos de motion graphics con voz IA, largos (16:9) y Shorts (9:16), hechos con HyperFrames — tipografía editorial que golpea, objetos que interactúan con el texto, tableros/recibos con contadores y presentador con etiquetas, todo sincronizado palabra por palabra con la voz, con sonido en cada movimiento, más el paquete de publicación por red (subtítulos, miniatura, portada por red y video 1:1 para Instagram). Usar en cada video nuevo (o al rehacer uno) para mantener la consistencia del movimiento, aunque cambien fondos, colores y gráficos.
---

# edwin-motion — cómo se mueven los videos

Lo que se fija es el **movimiento y el ritmo**, no la decoración. Cada video elige su propia
paleta, fondos, objetos y gráficos según el tema; lo que no cambia es que todo entra rápido,
golpea, rebota, sigue vivo y está clavado a las palabras de la voz.

Creado por Edwin Trujillo para el canal Edwin IA (youtube.com/@EdwinT_IA). Estilo inspirado en
los videos de IAdeGuardia, Dresk y Andy Caseres (una técnica de cada uno, ver §2).

**Antes de empezar:** este skill se apoya en los skills oficiales de HyperFrames
(`npx skills add heygen-com/hyperframes`): leer `/hyperframes` y `/hyperframes-core` antes de
escribir la primera escena. Requisitos completos en `README.md`.

## 1. Principios (no negociables)

1. **Clavado a la voz.** Cada aparición importante cae en el `start` de una palabra real de
   `assets/audio/NN.words.json` (ElevenLabs `with-timestamps`, `scripts/voz.ts`). Nada "más o menos a tiempo".
2. **Beat nuevo cada 3-7 s.** Nunca más de ~8 s con la pantalla igual. Escena larga = varios
   paneles con **cortes duros** (cambiar fondo/técnica en el corte da energía).
3. **Entra rápido, se asienta con rebote, queda vivo.** Entradas de 0,2-0,5 s con
   `power3.out`/`back.out`; luego algo respira, gira o flota. Sin fundidos lentos.
4. **Los impactos se sienten.** Sello/cifra fuerte = escala 2,4→1 en 0,18 s + temblor del
   escenario + sonido "golpe" (o "grieta" en rupturas). 2-6 por escena, no más.
5. **Texto = palabras clave y cifras**, en grande. No se escribe el guion en pantalla y no hay
   subtítulos quemados (los subtítulos van como SRT en YouTube).
6. **Un objeto protagonista interactúa con el texto** (pasa entre letras, cuelga sobre él, lo
   rompe). Lo elige el tema: burbuja, tren, cohete, chip, billete, cerebro, robot…
7. **Cifras solo verificadas**: las del guion, con fuente en mono pequeña cuando el guion la
   nombra. Gráficas sin datos reales se marcan "ilustrativo".

## 2. Las tres técnicas (caja de herramientas; alternarlas dentro de cada escena)

| Técnica | Qué la define (movimiento) | Libre por video |
|---|---|---|
| **Editorial** (inspirada en Dresk) | Condensada gigante (Anton) que cae letra por letra o golpea palabra por palabra; objeto que pasa entre las letras o cuelga de un hilo; letras que se parten | Color de papel/fondo, color de la tipografía, el objeto |
| **Tablero / recibo** (inspirada en Andy Caseres) | Tarjetas brutalistas (borde negro, sombra dura) que suben; contadores que corren; barras que se llenan; casillas que aparecen y se marcan; gráfica que se dibuja con punto en la punta; paquetes que viajan por líneas punteadas; título que se teclea | Fondo (trama, color), tipo de tarjeta, datos |
| **Presentador + tarjetas** (inspirada en IAdeGuardia) | Tu personaje (arte a color, 5 poses) que entra con rebote, respira y cambia de pose en palabras fuertes; etiqueta de palabra clave que salta junto a él; contador de niveles 1-2-3; tarjetas tipo repositorio; objetos isométricos que caen | Fondo, color de acento, qué tarjetas |

Recetas de código de cada movimiento: `references/recetas.md` (curvas, duraciones, snippets).

**Tipografía base** (se puede sumar una display por tema): Anton (titulares), Poppins 800/900
(texto), JetBrains Mono (etiquetas de UI), Source Serif itálica (citas). Todas gratis en Google
Fonts; copiar los .ttf a `assets/fonts/` de cada video.

## 3. Flujo para un video nuevo

Convención de carpetas: `guiones/<slug>/` (guion + proyecto) y `out/<slug>/` (entregables).

1. **Guion** aprobado en `guiones/<slug>/guion.md`, en bloques `## Bloque N — título`, con las
   líneas de voz empezando por `>` (formato que lee `scripts/voz.ts`), cifras con fuente, y por
   bloque "En pantalla" y "Sonido".
   **Plan de sonidos:** leer el guion y anotar en `guiones/<slug>/sonidos.md` cada momento que pide
   un efecto temático además de los de movimiento (el objeto protagonista: tren → silbato,
   burbuja → reventón; dinero, alarma, notificación, aplausos…). Cruzarlo con lo que ya hay:
   `assets/sfx/` del skill (desliza-1/2, caida, llenado, tick, acumula, disminuye, monedas,
   marcador, papel, check, pop-suave, rec-apagado, rebobinado, claqueta) y la de HyperFrames
   (`~/.claude/skills/media-use/audio/assets/sfx/`, 19 efectos de Pixabay: chime, click,
   click-soft, error, glitch-1/2/3, impact-bass-1/2, key-press, notification, ping, pop, riser,
   sparkle, typing, whoosh, whoosh-cinematic, whoosh-short). **Reutilizar antes de generar.**
   Los que de verdad falten: presentar la lista al usuario (nombre, momento, descripción en
   inglés, costo ≈ 5-10 créditos c/u) y, con su aprobación, sumarlos a `scripts/generar-sfx.ts`,
   correrlo, recortar silencio inicial y normalizar pico a −3 dB (ffmpeg).
2. **Voz**: `npx tsx scripts/voz.ts guiones/<slug> --contar` (caracteres = costo) y luego sin
   `--contar`: un mp3 + `NN.words.json` por bloque. **Cuesta plata: pedir aprobación al usuario
   antes.** Usar su propia voz (clon instantáneo de ElevenLabs con ~1 min de grabación) o una de la
   biblioteca; nunca clonar una voz ajena sin permiso. Probar `eleven_v4` y `eleven_v3` con 2-3
   frases: un modelo puede cambiarle el acento al clon.
3. **Proyecto HyperFrames** en `guiones/<slug>/` (o `largo/` y `short/`): `npx hyperframes init`,
   copiar fuentes, música (`assets/bgm/`, ej. MusicGen local con el skill `media-use`) y armar
   `golpe.mp3` y `grieta.mp3`: `node <skill>/scripts/sfx-base.mjs guiones/<slug>/assets/sfx`.
4. **Presentador** (opcional): `python <skill>/scripts/presentador.py guiones/<slug>/assets/img
   --personaje <carpeta con 01..05 Sin fondo.png>` — tu personaje a color, 5 poses +
   `pj-apunta-espejo` (señala a la derecha) y su `pj-*-boca.png` para mover la boca (receta 15).
   **Las cajas de boca de `POSES` hay que medirlas para tu arte.** `scripts/halftone.py` = estilo
   alternativo en puntos.
5. **Diseño del video** en `guiones/<slug>/ESTILO.md`: paleta, fondos, objeto protagonista, qué
   técnica domina en cada bloque. Cambian colores/objetos, NO las reglas de movimiento.
6. **Escenas**: una por bloque, desde `plantillas/escena.html` (contrato abajo). Más de ~6
   escenas → repartir entre agentes, 3 escenas por agente, todos en una sola tanda, cada uno
   con `ESTILO.md` + este skill + el bloque del guion + su `words.json` + la tabla de tiempos.
7. **Sonido**: cada escena deja `NN-slug.sfx.json` = `[[segundo, "golpe"|"grieta"|<efecto>, volumen]]`
   (golpe 0,22-0,3 a +0,18 s del inicio del sello; grieta 0,2; temáticos con su .mp3 copiado a
   `<proyecto>/assets/sfx/`). **Sonido en los movimientos:** desde la raíz del repo,
   `node <skill>/scripts/sonidos.mjs guiones/<slug>[/largo]` escribe `NN-slug.sfx-auto.json`
   (deslizamiento, papel, caída, llenado, cifras que se acumulan (monedas si es dinero), trazo,
   check, pop suave, tecleo, click según el movimiento; ≥ 0,3 s entre efectos, respeta los golpes)
   y `armar.mjs` los mezcla. En Shorts: `… sonidos.mjs guiones/<slug>/short --index` (inserta
   `<audio id="sfxa-N">`). Correrlo después de terminar las escenas (y de nuevo si cambian).
   Usa Chrome (`CHROME_PATH` si no está en la ruta de Windows). Receta 17.
8. **Armar**: copiar `plantillas/armar.mjs` (largo 16:9: escenas = voz + 0,8 s, título tras el
   gancho, destello en cada corte, sfx desde los sidecars) → `node armar.mjs` → carve de la
   música bajo las voces (`hyperframes-audio/scripts/carve.mjs --bed musica --voice voz-01 …`).
9. **Revisar**: `npx hyperframes check` + capturas cada ~12 s
   (`npx hyperframes snapshot --at … --no-end --describe false`) y **mirarlas**. Corregir texto
   cortado, solapes no intencionales y paneles vacíos más de ~2 s.
10. **Render** (`npx hyperframes render -o out/<slug>/largo/<slug>.mp4`), verificar
    duración/volumen/cuadros. **Carpeta de entrega:** `out/<slug>/publicacion.md` en la raíz y una
    carpeta por pieza con su video y su miniatura/portada: `largo/` (mp4, miniatura, SRT,
    capítulos), `short/` (mp4 + portadas por red), `short-instagram/` (mp4 1:1 + portada 1:1);
    varios Shorts → `short-1-<tema>/`, `short-2-…`.
11. **Short**: 9:16 nativo (no recorte), mismo lenguaje, con la voz del gancho + un cierre propio
    ("Sígueme para más, y mira el video completo en el enlace de mi perfil"). Zonas seguras: nada
    crítico en el 15 % superior, el 22 % inferior ni los 140 px de la derecha.
12. **Publicación** (`guiones/<slug>/publicacion/` + `out/<slug>/publicacion.md`; plantillas en
    `plantillas/publicacion/`: `portadas.html` (vistas mini / short / centro / grid, es un ejemplo:
    cambiar textos, colores y personaje), `capturar.mjs` (Chrome headless con reintento) y
    `subtitulos.mjs` — cambiar `SLUG` y textos): SRT y capítulos desde los `words.json`
    (escribir en el texto lo que va en pantalla, no la pronunciación forzada de la voz), miniatura
    1280×720 y **una portada del Short por red**:
    - YouTube Shorts: 1080×1920, 9:16 completa.
    - TikTok: 1080×1920 con todo lo importante en la franja central (y 285–1635), porque el perfil la recorta a 3:4.
    - Instagram / Facebook Reels: 1080×1920 con todo dentro de la franja central 4:5 (y 285–1635) y
      además `portada-instagram-cuadricula.png` 1080×1440 (3:4) para la vista del perfil.
    - **Video para Instagram 1:1** (`out/<slug>/short-instagram/<slug>-short-instagram-1x1.mp4`):
      proyecto `guiones/<slug>/short-ig/` = copia del Short con root, hosts y composiciones en
      1080×1350 y el layout RE-COMPUESTO para 4:5 (contenido en x 64–1016, y 64–1286, centrado,
      mismos tiempos/textos/audio/animaciones; **no** recortar el 9:16) → render a un archivo
      temporal → 1:1 con el 4:5 entero al centro (864×1080) y los lados con el mismo video
      ampliado y desenfocado:
      `ffmpeg -i <temporal 4:5> -filter_complex "[0:v]split[a][b];[a]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,gblur=sigma=40,eq=brightness=-0.15[fondo];[b]scale=864:1080[fr];[fondo][fr]overlay=108:0" -c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 -crf 18 -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/<slug>/short-instagram/<slug>-short-instagram-1x1.mp4`
      (borrar el temporal). Portada `portada-instagram-1x1.png` (la 4:5 escalada al centro con
      fondo desenfocado). Revisar capturas cada 2 s del 4:5 antes de armar el 1:1.
      TikTok, YouTube Shorts y Facebook usan el 9:16.
    Textos por red (YouTube, LinkedIn, Shorts, TikTok, Reels, Facebook) sin afirmar que algo se
    probó si fue ilustrativo y sin prometer cosas a nombre del creador.

## 4. Contrato técnico de cada escena

- `<template>` con `#root[data-composition-id="fNN"]` 1920×1080 (o 1080×1920) y un
  `#fNN-stage.clip` con `data-start="0" data-duration="DUR"`. Todo CSS prefijado `#fNN`/`.fNN-`.
- Una `gsap.timeline({ paused: true })` registrada en `window.__timelines["fNN"]`.
- Determinista: nada de `Math.random`, `Date`, fetch, ni `@keyframes` que dependan del reloj.
  "Aleatorio" = fórmulas fijas (`(i * 137) % 300`).
- Varios `fromTo` sobre el mismo elemento → `immediateRender: false` en todos menos el primero.
- Contadores con `onUpdate` sobre un objeto; jamás `tl.set(el, {textContent})`.
- Líneas SVG: `getTotalLength()` al construir + `strokeDashoffset` (no `pathLength="1"`).
- Superposiciones intencionales: `data-layout-allow-overlap data-layout-allow-occlusion`;
  salidas de cuadro: `data-layout-allow-overflow`.
- Márgenes: contenido importante en x 80–1840, y 60–1020 (16:9).

## 5. Lista de chequeo antes de entregar una escena

- [ ] Cada beat cae en una palabra real (anotada en un comentario con sus tiempos).
- [ ] Ningún tramo de más de ~8 s sin cambio visible.
- [ ] Al menos un objeto vivo (respira/gira/flota) en cada panel.
- [ ] Si sale el presentador mientras habla la voz, mueve la boca (receta 15).
- [ ] Impactos con golpe + temblor + sidecar de sonido.
- [ ] Alternó al menos dos técnicas o hizo un corte duro de fondo.
- [ ] Cifras del guion; fuente visible cuando aplica.
- [ ] Capturas revisadas: sin texto cortado ni solapes accidentales.
