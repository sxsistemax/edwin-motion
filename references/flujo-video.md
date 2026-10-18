# Flujo de producción de un video (modos `largo`, `short`, `sonidos`, `musica`, `voz`, `revisar`)

Pasos 1-11 del flujo. Lo invocan los modos de `SKILL.md`. `<skill>` = carpeta del skill
(`~/.claude/skills/edwin-motion/` o `.claude/skills/edwin-motion/` del proyecto).

1. **Guion** aprobado en `guiones/<slug>/guion.md` (bloques con cifras y fuentes).
   **Plan de sonidos**: leer el guion y anotar en `guiones/<slug>/sonidos.md` cada
   momento que pide un efecto temático además de los de movimiento (el objeto protagonista: tren → silbato,
   burbuja → reventón; dinero, alarma, notificación, aplausos, caja registradora…). Cruzarlo con lo que ya hay:
   biblioteca del canal (`assets/sfx/` del skill, incluye golpe y grieta; golpe y grieta se arman una vez con `scripts/sfx-base.mjs` porque salen de Pixabay y su licencia no permite redistribuirlos; si versionas el skill, lo bajado de Pixabay va en su `.gitignore`) y la de
   HyperFrames (`~/.claude/skills/media-use/audio/assets/sfx/`, 19 efectos de Pixabay ya descargados: chime, click,
   click-soft, error, glitch-1/2/3, impact-bass-1/2, key-press, notification, ping, pop, riser, sparkle, typing,
   whoosh, whoosh-cinematic, whoosh-short).
   **Los que falten se BUSCAN y DESCARGAN de Pixabay antes de pensar en generarlos** (generar es el último paso). Gratis, licencia de Pixabay (uso comercial/monetizado, sin atribución). `curl` da 403
   (Cloudflare): usar el navegador local de Playwright (MCP `mcp__playwright__*`), sin iniciar sesión:
   1. `browser_navigate` → `https://pixabay.com/sound-effects/search/<término en inglés>/`.
   2. `browser_snapshot` (o captura) para leer títulos, autor, duración y etiquetas; elegir 2-3 candidatos cortos.
   3. `browser_click` con target `internal:role=button[name="Download"i] >> nth=N` (N = posición en la lista, desde 0).
      El mp3 cae en `.playwright-mcp/` de la raíz (nombre `autor-titulo-id.mp3`). Cerrar el diálogo "Nice one!"
      (o volver a navegar) antes del siguiente. `browser_close` al terminar.
   4. Renombrar al nombre del efecto, recortar silencio inicial y normalizar pico a −3 dB:
      `ffmpeg -i in.mp3 -af "silenceremove=start_periods=1:start_threshold=-45dB,volume=<ganancia>dB" out.mp3`
      (ganancia = −3 − pico medido con `volumedetect`). Guardar en `assets/sfx/` del skill (biblioteca del canal) y
      anotar en `sonidos.md` la fuente: "Pixabay · <autor> · <id>".
   5. No se pueden escuchar desde aquí: dejar los candidatos en `guiones/<slug>/sfx-candidatos/` y pedir al creador que
      elija antes de usarlos en el video.
   **Solo si en Pixabay no hay nada que sirva**: presentar al creador la lista (nombre, momento del guion, descripción en
   inglés, costo ≈ 5-10 créditos c/u) y, con su aprobación, agregarlos a `scripts/generar-sfx.ts`, correrlo,
   recortar silencio inicial, normalizar pico a −3 dB y anotar el costo. Los
   temáticos los pone cada escena en su `NN-slug.sfx.json` (paso 7, con el .mp3 copiado a `<proyecto>/assets/sfx/`);
   los de movimiento los pone `sonidos.mjs`.
2. **Voz**: ElevenLabs `eleven_v4` (conserva el acento colombiano; v3 no) con `with-timestamps`, un mp3 + `NN.words.json` por bloque
   (`npx tsx <skill>/scripts/voz.ts guiones/<slug> --contar`, luego sin `--contar`). **Cuesta plata: pedir aprobación al creador antes** y
   anotar el costo en `costos/costos.csv`.
3. **Proyecto HyperFrames** en `guiones/<slug>/` (o `largo/` y `short/`): `npx hyperframes init`,
   copiar fuentes, sfx `golpe.mp3` y `grieta.mp3` (`<skill>/assets/sfx/`).
   **Música: una cama NUEVA por video, según el tema** (no reutilizar la de otro
   video). MusicGen local (`facebook/musicgen-small`, gratis) vía el motor de `media-use`: escribir
   `audio_request.json` con `{"provider":"auto","lang":"es","lines":[],"bgm":{"mode":"generate","prompt":"…"}}` y correr
   `node ~/.claude/skills/media-use/audio/scripts/audio.mjs --request ./audio_request.json --hyperframes . --out ./audio_meta.json --only bgm`
   + `node ~/.claude/skills/media-use/audio/scripts/wait-bgm.mjs` → `assets/bgm/track.wav`. Sin líneas de voz en el request la cama sale de 30 s: para el largo llamar directo `generateBgmDetached({prompt, durationS: <total+15>, hyperframesDir, lyriaRecipe: null, hasVoice: true, anomalies: []})` de `media-use/audio/scripts/lib/bgm.mjs`. Medir con `ebur128` y llevarla a ~−25 LUFS (`volume=…dB`) para que valga el nivel del paso 8; guardar como `cama.wav`.
   El prompt (inglés) sale del tema y del tono del guion: género, instrumentos, bpm, tonalidad, y siempre
   "no vocals, no melody lead, steady and unobtrusive under narration". Ej. (video sobre una burbuja financiera): "tense minimal documentary
   underscore about a financial bubble, deep pulsing synth bass, soft ticking percussion, dark ambient pads, slow
   88 bpm, minor key, …". Anotar el prompt en `ESTILO.md` del video. El Short usa la misma cama de su largo.
4. **Presentador**: `python <skill>/scripts/presentador.py guiones/<slug>/assets/img` — el
   personaje **tal como es** (arte original a color, sin halftone ni filtros), 5 poses +
   `pj-apunta-espejo` (señala a la derecha: usarla cuando la lista/tarjeta está a la derecha) y su `pj-*-boca.png`
   para mover la boca (receta 15). `scripts/halftone.py` queda solo como estilo alternativo si el creador lo pide.
5. **Diseño del video** en `guiones/<slug>/ESTILO.md`: paleta, fondos, objeto protagonista,
   qué técnica domina en cada bloque (usar el `ESTILO.md` de un video ya aprobado como modelo, si lo hay,
   cambiando colores/objetos, NO las reglas de movimiento).
6. **Escenas**: una por bloque, desde `plantillas/escena.html` (contrato abajo). Más de ~6
   escenas → repartir entre agentes, 3 escenas por agente, todos en una sola tanda, cada uno
   con `ESTILO.md` + este skill + el bloque del guion + su `words.json` + la tabla de tiempos.
7. **Sonido**: cada escena deja `NN-slug.sfx.json` = `[[segundo, "golpe"|"grieta", volumen]]`
   (golpe 0,22-0,3 a +0,18 s del inicio del sello; grieta 0,2).
   **Además, sonido en los movimientos**: `node <skill>/scripts/sonidos.mjs
   guiones/<slug>[/largo]` escribe `NN-slug.sfx-auto.json` (deslizamiento, papel, caída, llenado, cifras que se acumulan (monedas si es dinero), trazo,
   check, pop suave, tecleo, click según el movimiento; ≥ 0,3 s entre efectos, respeta los golpes) y
   `armar.mjs` los mezcla. En Shorts: `… sonidos.mjs guiones/<slug>/short --index` (inserta `<audio id="sfxa-N">`).
   Correrlo después de terminar las escenas (y de nuevo si cambian). Receta 17.
8. **Armar**: copiar `plantillas/armar.mjs` (largo 16:9: escenas = voz + 0,8 s, título tras el
   gancho, destello en cada corte, sfx desde los sidecars) → `node armar.mjs` → carve de la
   música bajo las voces (`hyperframes-audio/scripts/carve.mjs --bed musica --voice voz-01 … --strength 0.3`).
   **Nivel de la música** ("no se escucha ni cuando habla ni cuando se calla"): la cama
   MusicGen sale a ~−25 LUFS; con `data-volume` 0,35 + carve por defecto (0,8, baja hasta −19 dB) queda
   inaudible. Usar `data-volume` ~0,7 y `--strength 0.3` (baja máx. ~7 dB). Medir con `volumedetect` en una
   pausa del render antes de dar por buena la mezcla.
9. **Revisar**: `npx hyperframes check` + capturas cada ~12 s
   (`npx hyperframes snapshot --at … --no-end --describe false`) y **mirarlas**. Corregir texto
   cortado, solapes no intencionales y paneles vacíos más de ~2 s.
10. **Render** (`npx hyperframes render -o out/<slug>/largo/<slug>.mp4`), verificar duración/volumen/cuadros.
    **Carpeta de entrega**: `out/<slug>/publicacion.md` en la raíz y una carpeta por
    pieza con su video y su miniatura/portada: `largo/` (mp4, miniatura, SRT, capítulos), `short/` (mp4 + portadas
    por red); varios Shorts → `short-1-<tema>/`, `short-2-…`. Las
    imágenes se generan en `guiones/<slug>/publicacion/` y se copian aquí; rutas del .md relativas a `out/<slug>/`.
11. **Short**: 9:16 nativo (no recorte), mismo lenguaje, con la voz del gancho + cierre "Sígueme
    para más, y mira el video completo en el enlace de mi perfil". Zonas seguras: nada crítico
    en el 15 % superior, el 22 % inferior ni los 140 px de la derecha.
    **CTA en pantalla = acción + para qué**: nunca un chip solo con
    "Comenta SKILL" o "Sígueme"; siempre lo que recibe la persona ("Comenta SKILL y te envío gratis el
    skill para hacer tus videos"). Aplica a Shorts, cierres y pantalla final del largo.

## Contrato técnico de cada escena

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

## Lista de chequeo antes de entregar una escena

- [ ] Cada beat cae en una palabra real (anotada en un comentario con sus tiempos).
- [ ] Ningún tramo de más de ~8 s sin cambio visible.
- [ ] Al menos un objeto vivo (respira/gira/flota) en cada panel.
- [ ] Si sale el presentador mientras habla la voz, mueve la boca (receta 15).
- [ ] Impactos con golpe + temblor + sidecar de sonido.
- [ ] Alternó al menos dos técnicas o hizo un corte duro de fondo.
- [ ] Cifras del guion; fuente visible cuando aplica.
- [ ] Capturas revisadas: sin texto cortado ni solapes accidentales.
