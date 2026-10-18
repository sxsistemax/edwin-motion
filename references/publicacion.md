# Paquete de publicación (modos `publicacion`, `titulos`, `cover-large`, `cover-short`)

Paso 12 del flujo.

12. **Publicación** (`guiones/<slug>/publicacion/` + `out/<slug>/publicacion.md`,
    plantillas en `plantillas/publicacion/`: `portadas.html` (vistas mini / short / centro / grid),
    `capturar.mjs` (Chrome headless con reintento; cambiar `SLUG`) y `subtitulos.mjs` (cambiar `SLUG`) — copiarlas a
    `guiones/<slug>/publicacion/` y cambiar los textos):
    SRT y capítulos desde los `words.json` (`subtitulos.mjs`; escribir en el texto lo que va en pantalla,
    no la pronunciación forzada de la voz), miniatura 1280×720 y **una portada del Short por red**
    (`portadas.html` + `capturar.mjs`):
    - YouTube Shorts: 1080×1920, 9:16 completa.
    - TikTok: 1080×1920 con todo lo importante en la franja central (y 285–1635), porque el perfil la recorta a 3:4.
    - Instagram / Facebook Reels: 1080×1920 con todo dentro de la franja central 4:5 (y 285–1635) y
      además `portada-instagram-cuadricula.png` 1080×1440 (3:4) para la vista del perfil.
    - **Solo dos videos por tema: largo (16:9) y Short (9:16).** El mismo Short 9:16 va a YouTube Shorts,
      TikTok, Instagram Reels y Facebook. **No** se hace versión 1:1 ni 4:5 para Instagram ni carpeta
      `short-instagram/` (el 1:1 sale de subir mal el video, no de una necesidad de la red).
    Textos por red (YouTube, LinkedIn, Shorts, TikTok, Reels, Facebook) sin afirmar que algo se probó si
    fue ilustrativo y sin prometer cosas a nombre del creador.
    **Títulos** (ejemplo: "Olvida ChatGPT: esta IA
    no escribe, DECIDE (tutorial JEV)"):
    - Sensacionalistas, de curiosidad: contraste con algo conocido ("Olvida ChatGPT"), negación + giro
      ("no escribe… DECIDE"), una palabra clave en MAYÚSCULAS. Si el video enseña, que se note
      ("tutorial", "aprende a usar…").
    - Cortos: ≤ 60 caracteres para que YouTube no los corte.
    - Gancho, no mentira: nada que el video desmienta sin aclararlo; cifras no confirmadas van
      atribuidas en la descripción; no prometer resultados.
    - **Proponer 3 opciones y esperar que el creador elija** antes de escribirlas en los archivos.
    - El título elegido manda en el paquete de los videos: título del largo y del Short, primera
      línea de cada texto por red, miniatura y portadas por red. Si cambia el título, se regeneran
      esas imágenes (`capturar.mjs`) y se copian a `out/<slug>/`.
    - **El carrusel NO usa este título**: lleva su propia portada y su propio texto, para que no se
      confunda con el video (reglas en `references/carrusel.md`).
