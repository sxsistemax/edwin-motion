# Medios reales e imágenes IA (modos `medios` e `imagen`)

El lenguaje edwin-motion es gráfico (tipografía, tarjetas, objetos dibujados). El material real
entra como **prueba**: la foto del anuncio, el tuit, la página del paper, el clip de la demo. Nunca
como relleno de fondo.

## 1. Qué buscar y dónde

**Antes de buscar afuera**: `node .claude/skills/edwin-motion/scripts/biblioteca.mjs buscar <texto>`
(logo, demo, paper… que ya trajo otro tema) y, si está, `… biblioteca.mjs usar <archivo> <slug>`.

| Necesito | Dónde buscar primero | Tipo en `medios.mjs` |
|---|---|---|
| Foto de prensa / producto / persona pública | Sala de prensa oficial (openai.com/news, blog.google, anthropic.com/news…), Wikimedia Commons, Unsplash/Pexels (genéricas) | `foto` |
| Logo de empresa | Kit de prensa oficial, Wikimedia Commons (SVG) | `foto` |
| Clip de una demo / keynote / entrevista | Canal oficial en YouTube o X de la empresa | `video` con `--desde/--hasta` |
| Pantallazo de una web, un tuit, un post, un repo | La URL misma | `captura` |
| Página de un paper, informe, contrato, demanda | arXiv, sitio oficial, PDF del juzgado | `documento` |
| Interfaz de una herramienta (para tutorial) | Abrirla con Playwright y capturar | `captura` o MCP Playwright |

Búsqueda: `WebSearch` para encontrar la URL; si la página bloquea `fetch`/`curl` (Cloudflare,
login, cookies), usar el navegador de Playwright (`mcp__playwright__browser_navigate` →
`browser_take_screenshot` con `fullPage` si hace falta la página entera, o clic en descargar),
igual que con los sonidos de Pixabay.

## 2. Comando

```bash
node .claude/skills/edwin-motion/scripts/medios.mjs <slug> foto <url> --nombre logo-openai --fuente "OpenAI" --licencia "kit de prensa"
node .claude/skills/edwin-motion/scripts/medios.mjs <slug> video <url> --desde 12:03 --hasta 12:18 --nombre demo-sora --fuente "OpenAI / YouTube"
node .claude/skills/edwin-motion/scripts/medios.mjs <slug> captura <url> --ancho 1280 --alto 1600 --escala 2 --nombre tuit-altman --fuente "X / @sama"
node .claude/skills/edwin-motion/scripts/medios.mjs <slug> documento https://arxiv.org/pdf/1706.03762 --paginas 1-2 --nombre paper-attention --fuente "Vaswani et al. 2017"
```

Todo queda en `guiones/<slug>/assets/medios/` + `medios.json` (archivo, origen, fuente, licencia,
fecha). **Sin `--fuente` el archivo no se usa en el video**: completarlo antes de animarlo.
`assets/medios/` **no se versiona** (decisión de Edwin 18-oct-2026: el único git es el del skill): queda solo en
este equipo, junto con su `medios.json` (que guarda el origen para volver a bajarlo). En git solo va la biblioteca de
sonidos del skill (`assets/sfx/`).

## 3. Reglas de uso (canal)

- **Crédito visible** en mono pequeña (`JetBrains Mono`, esquina inferior) cada vez que sale un
  medio de terceros: "Fuente: OpenAI · YouTube". Mismo trato que las cifras con fuente.
- **Clips de terceros: ≤ 10 s seguidos**, con comentario/análisis encima (uso informativo), nunca
  el clip como protagonista. Sin música de terceros: se silencia el audio del clip salvo que la frase
  dicha sea el dato (y entonces se subtitula).
- **Nada con marca de agua de banco de imágenes** (Getty, Shutterstock, Alamy): se descarta.
- Si la licencia no está clara → `"licencia": "por confirmar"` y se le pregunta a Edwin antes de render.
- No se descargan cosas tras login ni de cuentas privadas.

## 4. Cómo combinar el medio con el movimiento

Los medios nunca entran planos: entran como un objeto más del lenguaje edwin-motion.

- **Foto / logo** → tarjeta brutalista (borde negro + sombra dura) que sube con `back.out` y
  respira (receta 12); o recortada en círculo junto al presentador como etiqueta (receta 11).
  Ken Burns lento (scale 1→1,06 en toda la escena) si ocupa media pantalla o más.
- **Pantallazo de web / tuit** → marco de navegador o de teléfono dibujado en CSS; la frase clave
  se subraya con un trazo que se dibuja (receta 9) en la palabra exacta de la voz; zoom a ese
  renglón (`hyperframes-keyframes` punch-in).
- **Documento** → página que cae girada (rotación −4°→0) sobre el escritorio + resaltador
  amarillo que barre la línea citada + sello encima ("DEMANDADO", "PUBLICADO 2017").
- **Video** → `<video>` dentro de una tarjeta o de un monitor dibujado, `muted`, recorte de
  ≤ 10 s; contador o etiqueta animada encima que explica lo que se ve.
- Toda imagen de fondo con texto encima lleva oscurecido/degradado para que el texto se lea.

## 5. Imágenes generadas con IA (modo `imagen`) — solo con autorización

Último recurso, cuando no hay material real ni se puede dibujar en HTML/SVG (escena ilustrada,
metáfora visual compleja, viñeta de motion comic).

1. Primero intentar: dibujo en HTML/SVG → medio real → **recién ahí** imagen IA.
2. Correr sin `--autorizado` para ver el precio:
   `node .claude/skills/edwin-motion/scripts/imagen.mjs <slug> "<prompt en inglés>" [--ref "personaje/02 Sin fondo.png"] [--aspecto 9:16] [--n 2]`
3. Mostrarle a Edwin: qué imagen, para qué momento del guion, prompt, modelo y costo. **Esperar su sí.**
4. Con el sí: repetir con `--autorizado`. El script guarda la imagen en `assets/medios/ia-*.png`,
   la anota en `medios.json` y agrega el renglón en `costos/costos.csv`.
5. Reglas: nunca una imagen IA que parezca foto de un hecho o de una persona real (si se usa
   para algo así, rótulo "Imagen generada con IA"); sin texto dentro de la imagen (el texto lo pone
   la animación); el carrusel sigue **sin** imágenes IA (regla de `references/carrusel.md`).
