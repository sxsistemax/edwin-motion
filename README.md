# edwin-motion

**Skill de Claude Code (y de Codex, Gemini CLI, Hermes y cualquier agente con skills) para hacer videos de motion graphics con IA**, sin cámara y sin animar a
mano: guion → voz con tiempos por palabra → escenas en HTML animadas con GSAP → sonido automático
→ render → paquete de publicación para cada red.

Es el skill con el que hago los videos del canal **Edwin IA**
([youtube.com/@EdwinT_IA](https://www.youtube.com/@EdwinT_IA)). En el video "Así hago mis videos"
explico todo el proceso paso a paso.

**Videos del canal sobre el skill:**
- [Cómo hacer videos animados con IA, sin cámara y sin saber animar (tutorial paso a paso)](https://youtu.be/q9Az9hoG1VA)
- [Un comando y el video se hace SOLO: tutorial edwin-motion](https://youtu.be/om439wOFZIc)

Lo que fija el skill es el **movimiento y el ritmo**, no la decoración: todo entra rápido, golpea,
rebota, sigue vivo y cae justo en la palabra que dice la voz. Los colores, fondos y gráficos los
eliges en cada video.

---

## Cómo funciona

```
guion.md ──► voz.ts ──► NN.mp3 + NN.words.json (segundo exacto de cada palabra)
                              │
                              ▼
          Claude Code + este skill escribe una escena HTML por bloque
          (GSAP, cada animación clavada a una palabra)
                              │
          sonidos.mjs ──► efecto en cada movimiento
                              │
          armar.mjs ──► index.html ──► npx hyperframes check / snapshot (revisión)
                              │
                              ▼
          npx hyperframes render ──► video.mp4
                              │
          subtitulos.mjs + portadas.html ──► SRT, capítulos, miniatura, portada por red
```

Tú escribes o apruebas el guion, revisas las capturas y decides. El agente programa las escenas.

## Comandos

Todo se pide con un modo: **`/edwin-motion <modo> [slug|tema] [opciones]`**. El `slug` es el nombre
de la carpeta del tema en `guiones/<slug>/`. Sin modo, el skill muestra el menú. Los modos con 💲
gastan plata: antes de gastar te muestran el costo y esperan tu sí.

### Planear

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-motion ideas [nicho]` | Busca qué está funcionando en tu nicho y noticias de IA de las últimas 2 semanas, y propone 5 temas, cada uno con gancho, formato, duración, 2-3 fuentes, medios reales disponibles y el momento fuerte para el Short. No los aprueba: eso lo decides tú. | 5 temas nuevos al final de `TEMAS.md` |
| `/edwin-motion auto <idea> [--presupuesto 2] [--solo-short] [--sin-carrusel] [--imagenes]` 💲 | Producción completa **sin intervención**: investiga, escribe y verifica el guion, elige título, narra, anima, mezcla, revisa en ciclo (hasta 3 vueltas) y renderiza largo + Short con su paquete de publicación. Invocarlo es tu aprobación, con tope de gasto (USD 2 por defecto). No publica nada, no se pasa del presupuesto, no toca temas sensibles ni pone en tu voz pruebas que no hizo. | `out/<slug>/` completo + `AUTO.md` con decisiones, costos y qué revisar antes de publicar |
| `/edwin-motion noticia <url> [--carrusel]` 💲 | De un anuncio de IA a un Short el mismo día. Lee la noticia, busca la fuente primaria y una segunda que la confirme (rumor = "según…"), escribe un guion de 40-55 s y te pide **una sola aprobación** (guion + 3 títulos + medios + costo de voz). Luego produce voz, música, Short, portadas y textos por red. | `guiones/noticia-<tema>-<aaaammdd>/`, `out/<slug>/short/`, `publicacion.md` |
| `/edwin-motion guion <slug\|tema>` | Guion largo por bloques (uno por escena), cada cifra con su fuente, gancho de ≤ 8 s, tramo del Short marcado con `[SHORT]` y cierre con CTA. Además, el plan de sonidos y el plan de medios reales por bloque. | `guion.md`, `sonidos.md`, `medios.md` |

### Producir

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-motion voz <slug>` 💲 | Narra cada bloque con ElevenLabs (`with-timestamps`) y guarda el segundo exacto de cada palabra, que es lo que sincroniza la animación. | `assets/audio/NN.mp3` + `NN.words.json` |
| `/edwin-motion musica <slug>` | Cama musical nueva para el tema con MusicGen local (gratis), nivelada para que se oiga bajo la voz. | `assets/bgm/cama.wav` |
| `/edwin-motion presentador <slug>` | Poses de tu personaje y sus bocas para moverlas con la voz. | `assets/img/pj-*.png` |
| `/edwin-motion sonidos <slug>` | Efectos temáticos del guion (Pixabay primero, generarlos es lo último) y sonido automático en cada movimiento de las escenas. | `assets/sfx/`, `*.sfx-auto.json` |
| `/edwin-motion largo <slug>` | Video principal 16:9: proyecto HyperFrames, estilo del video, una escena por bloque, sonido, montaje, revisión y render. | `out/NNN-<slug>/largo/<slug>.mp4` |
| `/edwin-motion short <slug>` | Short 9:16 nativo (no un recorte), con el gancho del largo y zonas seguras para cada red. | `out/NNN-<slug>/short/<slug>-short.mp4` (`NNN` = consecutivo de la carpeta del tema) |

### Material real e imágenes

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-motion medios <slug> <url\|búsqueda>` | Trae material real para combinar con la animación: **foto** (o la imagen de vista previa de una página), **clip de video** (solo el tramo que pidas), **pantallazo** de una web o un tuit, **páginas de un documento** PDF. Anota origen, fuente y licencia de cada archivo; sin fuente no se usa. | `assets/medios/` + `medios.json` |
| `/edwin-motion imagen <slug> "<qué>"` 💲 | Imagen generada con IA (fal.ai), solo cuando no hay material real ni se puede dibujar. Primero muestra el precio; genera solo con tu autorización y anota el gasto. Con una imagen de referencia mantiene igual al personaje. | `assets/medios/ia-*.png`, renglón en `costos/costos.csv` |
| `/edwin-motion ui-kit [slug\|pieza]` | Estándar de colores del canal por roles (fondos, texto, resaltador, sello, marca y ranuras que llena cada tema), sacado de una pieza aprobada o, si no le pasas ninguna, de una entrevista corta. Verifica contraste (`scripts/contraste.mjs`) y te muestra una lámina para aprobar. | `identidad/ui-kit.css`, `ui-kit.md`, `ui-kit.html` |
| `/edwin-motion biblioteca` | Índice de todo lo ya descargado o generado (sonidos, medios, imágenes IA, camas) para no bajarlo ni pagarlo otra vez. `biblioteca buscar <texto>` busca; `biblioteca usar <archivo> <slug>` lo copia a otro tema con su fuente y licencia. | `guiones/BIBLIOTECA.md` |

Los mismos scripts se pueden correr a mano desde la raíz del proyecto:

```bash
node ~/.claude/skills/edwin-motion/scripts/medios.mjs <slug> foto <url> --fuente "OpenAI" --licencia "kit de prensa"
node ~/.claude/skills/edwin-motion/scripts/medios.mjs <slug> video <url> --desde 12:03 --hasta 12:18 --fuente "OpenAI / YouTube"
node ~/.claude/skills/edwin-motion/scripts/medios.mjs <slug> captura <url> --ancho 1280 --alto 1600 --escala 2
node ~/.claude/skills/edwin-motion/scripts/medios.mjs <slug> documento <pdf|url> --paginas 1-2
node ~/.claude/skills/edwin-motion/scripts/imagen.mjs <slug> "<prompt en inglés>" [--ref pose.png] [--aspecto 9:16]   # sin --autorizado solo muestra el precio
node ~/.claude/skills/edwin-motion/scripts/biblioteca.mjs [buscar <texto> | usar <archivo> <slug>]
```

### Publicar

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-motion titulos <slug>` | 3 opciones de título (≤ 60 caracteres, con gancho pero sin mentir) y espera a que elijas. El elegido manda en el largo, el Short, los textos, la miniatura y las portadas. | título en `out/<slug>/publicacion.md` |
| `/edwin-motion cover-large <slug>` | Miniatura del largo 1280×720, legible en pequeño. | `out/<slug>/largo/miniatura.png` |
| `/edwin-motion cover-short <slug>` | Portadas del Short por red: YouTube Shorts, TikTok, Reels/Facebook y la cuadrícula de Instagram (3:4). | `out/<slug>/short/portada-*.png` |
| `/edwin-motion carrusel <slug> [--personaje]` | Carrusel 4:5 para Instagram/LinkedIn/Facebook, con su propia portada y su propio texto (reglas en `references/carrusel.md`). | `out/<slug>/carrusel/slide-*.png` |
| `/edwin-motion publicacion <slug>` | Paquete completo: subtítulos SRT, capítulos, textos por red, miniatura y portadas. | `out/<slug>/publicacion.md` + archivos |

### Controlar

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-motion revisar <slug> [largo\|short]` | Chequeo de HyperFrames, capturas cada ~12 s, auditoría de que la voz diga lo que dice el guion, volumen de la música, cuadros negros y licencias de los medios. | lista de fallas con segundo y escena |
| `/edwin-motion auditar <slug> [largo\|short\|carrusel\|todo]` | Audita lo que se entrega (los mp4 y las láminas, no el proyecto): elementos que parpadean, textos que duran muy poco para leerlos, efectos que tapan la voz, cifras del anuncio contra mediciones independientes, láminas con texto encogido o palabras partidas. En `auto` corre siempre y corrige solo. | `out/<slug>/AUDITORIA.md` |
| `/edwin-motion estado <slug>` | Qué piezas del tema están hechas y cuáles faltan. | tabla ✔/✘ y el siguiente comando a correr |

### Tutoriales de software (skill hermano `edwin-tutorial`)

En la carpeta `edwin-tutorial/` de este repositorio hay un segundo skill para **tutoriales de una
aplicación web**: Playwright entra al sitio (login con cuenta de prueba incluido), recorre el menú o
el flujo y lo graba; el agente escribe la narración mirando la captura de cada paso; la voz sale gratis
con Kokoro (local) o con tu voz de ElevenLabs; y HyperFrames monta encima portada, ficha "PASO NN",
aro y etiqueta en cada clic, zoom a lo importante, tapas de datos privados y cierre. Cada paso se
congela en su último cuadro hasta que la voz termina, así nunca se desfasa.

| Comando | Qué hace | Deja |
|---|---|---|
| `/edwin-tutorial <url> [slug]` | Explora el sitio, arma `tutorial.json` con los pasos, graba, narra, monta, revisa y renderiza. Las credenciales van solo en variables de entorno (`TUT_USER`, `TUT_PASS`), nunca en archivos. | `render/<slug>.mp4` + `tutorial.json` para regenerarlo |

Instalación: viene con el repositorio; **enlaza** (no copies sola) la carpeta `edwin-tutorial/` como
skill propio (`~/.claude/skills/edwin-tutorial`), porque usa las fuentes, sonidos y voz de esta carpeta;
corre `npm i` dentro de ella y, para la voz local, `pip install kokoro-onnx soundfile`. Guía completa,
formato de `tutorial.json` y comandos en [`edwin-tutorial/README.md`](edwin-tutorial/README.md).

## Qué necesitas

| Herramienta | Para qué | Costo |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) u otro agente con skills (Codex, Gemini CLI, Hermes…) | El agente que escribe las escenas siguiendo este skill | Suscripción del agente |
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen) y sus skills | Escenas en HTML, revisión y render | Gratis |
| [ElevenLabs](https://elevenlabs.io) | Voz con tiempos por palabra, clon de tu voz, efectos de sonido | Desde el plan Starter |
| [GSAP](https://gsap.com) | Animación (lo carga cada escena) | Gratis |
| [Node.js](https://nodejs.org) 20+ | Correr los scripts (`npx tsx` para los .ts) | Gratis |
| [ffmpeg](https://ffmpeg.org) | Audio, recortes | Gratis |
| [Playwright](https://playwright.dev) + [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (opcional) | Solo para `edwin-tutorial`: grabar el navegador y voz local | Gratis |
| [Google Chrome](https://www.google.com/chrome/) | Sonido automático y capturas de portadas | Gratis |
| [Python](https://www.python.org) + [Pillow](https://python-pillow.org) | Solo si usas presentador con personaje | Gratis |
| [MusicGen](https://huggingface.co/facebook/musicgen-small) (opcional) | Música de fondo local, vía el skill `media-use` de HyperFrames | Gratis |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Clips de video para `medios` | Gratis |
| [PyMuPDF](https://pymupdf.readthedocs.io) | Páginas de documentos para `medios` | Gratis |
| [fal.ai](https://fal.ai) (opcional) | Imágenes IA del modo `imagen` | Por imagen (≈ USD 0,04) |
| Fuentes [Anton](https://fonts.google.com/specimen/Anton), [Poppins](https://fonts.google.com/specimen/Poppins), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) | Tipografía base | Gratis |

## Funciona con otros agentes

El skill sigue el formato estándar de skills (`SKILL.md` + carpetas), así que no es solo para
Claude Code: sirve en cualquier agente que lea skills, como **Codex**, **Gemini CLI**, **Hermes
Agent**, Cursor, OpenCode o GitHub Copilot. La forma más fácil de instalarlo en el que uses es la
CLI [`skills`](https://www.npmjs.com/package/skills), que lo copia a la carpeta de cada agente:

```bash
npx skills add sxsistemax/edwin-motion -g                     # pregunta en qué agentes instalarlo
npx skills add sxsistemax/edwin-motion -g -a codex             # solo Codex       (~/.agents/skills/)
npx skills add sxsistemax/edwin-motion -g -a gemini-cli        # solo Gemini CLI  (~/.gemini/skills/)
npx skills add sxsistemax/edwin-motion -g -a hermes-agent      # solo Hermes      (~/.hermes/skills/)
npx skills add sxsistemax/edwin-motion -g -a '*'               # todos los agentes que tengas
```

Haz lo mismo con los skills de HyperFrames (`npx skills add heygen-com/hyperframes -g -a <agente>`).
En los agentes sin comandos con barra, pídelo por su nombre: *"usa el skill edwin-motion en modo
guion para el tema …"*. Los comandos de este README usan la ruta de Claude Code
(`~/.claude/skills/edwin-motion/`); en otro agente, cámbiala por la carpeta donde quedó instalado.

## Pídele al agente que lo instale

No hace falta correr los comandos tú mismo: el agente puede instalar y configurar todo, y te pide
solo lo que es tuyo (las llaves de ElevenLabs y tu voz). Por ejemplo, en Claude Code:

```text
> Instala y configura el skill https://github.com/sxsistemax/edwin-motion siguiendo su README:
  revisa qué tengo de la base (Node.js 20+, git, ffmpeg, Chrome, Python) e instala lo que falte,
  agrega los skills de HyperFrames y edwin-motion, ayúdame a dejar ELEVENLABS_API_KEY y
  ELEVENLABS_VOICE como variables de entorno, y al final corre npx hyperframes doctor y dime
  qué quedó listo y qué falta.
```

Según los permisos de tu agente, te pide aprobar cada comando antes de correrlo, y al final te dice qué se instaló.
El mismo pedido sirve en Codex, Gemini CLI o Hermes cambiando "skills de Claude Code" por los de
ese agente.

## Instalación manual

```bash
# 1. Skills oficiales de HyperFrames (este skill se apoya en ellos)
npx skills add heygen-com/hyperframes

# 2. Este skill: clónalo dentro de tus skills de Claude Code
git clone https://github.com/sxsistemax/edwin-motion ~/.claude/skills/edwin-motion
#    (o dentro de .claude/skills/ de un proyecto, si solo lo quieres ahí)

# 3. Variables de entorno para la voz
export ELEVENLABS_API_KEY=...        # tu llave de ElevenLabs
export ELEVENLABS_VOICE=...          # voice_id de tu voz (clon o de la biblioteca)
# 4. (Opcional) imágenes IA: FALIA_API_KEY=... en el archivo .env de la raíz del proyecto
```

En Windows (PowerShell): `$env:ELEVENLABS_API_KEY="..."`. Si Chrome no está en la ruta por defecto
de Windows, define `CHROME_PATH`.

## Primer video, rápido

1. Abre Claude Code en una carpeta de proyecto y escribe `/edwin-motion guion <tu tema>`.
   El agente te propone el guion en `guiones/<slug>/guion.md` (bloques `## Bloque N`, líneas de
   voz con `>`). Ajústalo y apruébalo.
2. `/edwin-motion voz <slug>`: te muestra cuántos créditos gasta y, con tu sí, narra. A mano:
   ```bash
   npx tsx ~/.claude/skills/edwin-motion/scripts/voz.ts guiones/<slug> --contar
   npx tsx ~/.claude/skills/edwin-motion/scripts/voz.ts guiones/<slug>
   ```
3. `/edwin-motion largo <slug>` (o `short <slug>`): arma escenas, sonido y video. Revisa las
   capturas que te muestra y corrige lo que no te guste, como se lo dirías a un editor.
4. `/edwin-motion publicacion <slug>`: títulos, miniatura, portadas y textos por red.
5. `/edwin-motion estado <slug>` en cualquier momento te dice qué falta.

¿Hay una noticia de IA que quieres sacar hoy? `/edwin-motion noticia <url>`.

El detalle de cada modo está en [`SKILL.md`](SKILL.md) y en `references/`.

## Qué trae

```
edwin-motion/
├── SKILL.md                    enrutador de modos y reglas de movimiento
├── references/
│   ├── flujo-video.md          producción paso a paso (voz, música, sonidos, escenas, montaje, render)
│   ├── publicacion.md          títulos, miniatura, portadas por red, SRT y textos
│   ├── medios.md               dónde buscar material real, reglas de crédito y cómo animarlo; imágenes IA
│   ├── auditoria.md            qué se audita en los mp4 y las láminas ya entregados
│   ├── carrusel.md             reglas de copy, tipos de lámina y formato de carrusel.json
│   └── recetas.md              18 recetas GSAP (entradas, golpes, contadores, boca del presentador…)
├── plantillas/
│   ├── escena.html             plantilla de una escena (HyperFrames + GSAP)
│   ├── armar.mjs               monta el video largo: escenas, voces, música, efectos, destellos
│   ├── publicacion/            subtítulos SRT + capítulos, miniatura y portadas por red
│   │                           (los títulos siguen las reglas de references/publicacion.md)
│   └── carrusel/               renderizador de láminas 4:5, captura con Chrome y fuentes del canal
├── scripts/
│   ├── voz.ts                  narración por bloques con ElevenLabs + tiempos por palabra
│   ├── medios.mjs              scraping: foto, clip de video, pantallazo, páginas de PDF
│   ├── imagen.mjs              imagen IA con fal.ai (solo con --autorizado)
│   ├── biblioteca.mjs          índice, búsqueda y reutilización de lo ya descargado o generado
│   ├── sonidos.mjs             pone sonido solo a cada movimiento de las escenas
│   ├── sfx-base.mjs            arma golpe.mp3 y grieta.mp3 desde los efectos de HyperFrames
│   ├── generar-sfx.ts          genera efectos nuevos con ElevenLabs describiéndolos en texto
│   ├── presentador.py          poses de tu personaje con boca animable
│   └── halftone.py             variante del presentador en puntos (halftone)
├── assets/sfx/                 20 efectos propios (ElevenLabs Sound Effects)
└── edwin-tutorial/             skill hermano: tutoriales de software grabados con Playwright
    ├── SKILL.md                flujo, reglas de credenciales y privacidad, formato de tutorial.json
    ├── scripts/                grabar.mjs (Playwright), voz.mjs (Kokoro/ElevenLabs), armar.mjs (HyperFrames)
    └── ejemplo/tutorial.json   punto de partida
```

## Las tres técnicas

| Técnica | Qué se ve | Inspirada en |
|---|---|---|
| Editorial | Tipografía condensada gigante que cae o golpea; un objeto que pasa entre las letras | Dresk |
| Tablero / recibo | Tarjetas brutalistas, contadores que corren, barras que se llenan, casillas que se marcan | [Andy Caseres · IA + Tech](https://www.tiktok.com/@andycaseresdev) |
| Presentador | Tu personaje que entra con rebote, cambia de pose y mueve la boca con la voz | [IAdeGuardia](https://www.tiktok.com/@iadeguardia) |

## Costos de referencia

Un video largo de ~8 minutos: la voz del video "Así hago mis videos" (7.579 caracteres) consumió
2.915 créditos de ElevenLabs, unos USD 0,44 en el plan Starter. Los efectos se generan una vez y se reutilizan. La música (MusicGen local) y el render
(local) no cuestan. Aparte va la suscripción de Claude.

## Antes de usarlo

- **Tu personaje y tu voz.** El skill no trae personaje ni voz. Usa tu propio arte (5 poses en PNG
  transparente, ver `scripts/presentador.py`; hay que medir la caja de la boca de cada pose) y tu
  propia voz. **No clones la voz de otra persona sin su permiso.**
- **Revisa siempre.** La IA deja textos cortados o cosas encimadas: revisar las capturas no es
  opcional.
- **Prueba el modelo de voz.** Con un clon, `eleven_v4` y `eleven_v3` pueden sonar con acentos
  distintos: prueba 2-3 frases antes de narrar el video completo
  (`ELEVENLABS_MODEL=eleven_v3`).
- **Créditos.** La voz y los efectos nuevos consumen créditos de ElevenLabs: usa `--contar` antes.
- **Material de terceros.** Lo que bajes con `medios` es de sus dueños: crédito visible siempre,
  clips de 10 s como máximo con tu comentario encima, nada con marca de agua ni tras un login. No
  subas `assets/medios/` a un repositorio público.
- `golpe.mp3` y `grieta.mp3` no vienen en el repo porque salen de efectos de Pixabay que trae
  HyperFrames; `scripts/sfx-base.mjs` los arma desde tu propia instalación.

## Versiones

Cada cambio del skill sale como versión en [Releases](https://github.com/sxsistemax/edwin-motion/releases),
con sus notas de cambios. Descarga directa de la última:
[`edwin-motion.zip`](https://github.com/sxsistemax/edwin-motion/releases/latest/download/edwin-motion.zip)
(descomprímelo en `~/.claude/skills/`). Si lo instalaste con `git clone`, actualízalo con `git pull`.

## Créditos y licencia

Hecho por Edwin Trujillo · [Edwin IA](https://www.youtube.com/@EdwinT_IA). Estilo inspirado en
IAdeGuardia, Dresk y Andy Caseres. Código y efectos de `assets/sfx/` bajo licencia MIT (ver
[`LICENSE`](LICENSE)). Las fuentes de `plantillas/carrusel/fuentes/` (Anton, Poppins, JetBrains
Mono, Source Serif 4) van bajo SIL Open Font License 1.1 (`OFL-*.txt` junto a cada una).
HyperFrames, GSAP y ElevenLabs tienen sus propias licencias.
