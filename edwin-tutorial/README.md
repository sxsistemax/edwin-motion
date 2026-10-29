# edwin-tutorial

Tutoriales de software en video, hechos por el agente a partir de una **grabación real del navegador**.
Playwright entra al sitio (login con cuenta de prueba incluido), recorre el menú o el flujo que pidas y
lo graba. El agente mira la captura de cada paso y escribe la narración. La voz sale gratis con Kokoro
(local) o con tu voz clonada en ElevenLabs. HyperFrames monta encima portada, ficha "PASO NN", aro y
etiqueta en cada clic, zoom a lo importante, tapas de datos privados y cierre.

Cada paso se congela en su último cuadro hasta que la voz termina su frase, así la narración nunca
se desfasa de la pantalla aunque el sitio cargue lento.

Es un skill hermano de [`edwin-motion`](../README.md) y vive en el mismo repositorio: toma de ahí las
fuentes, los sonidos y el script de voz de ElevenLabs.

## Cómo se usa

En Claude Code:

```
/edwin-tutorial https://staging.mi-app.com menu-principal — graba el login y el menú lateral, cuenta de prueba en TUT_USER / TUT_PASS
```

El agente sigue el flujo de [`SKILL.md`](SKILL.md):

| # | Paso | Script | Deja |
|---|---|---|---|
| 1 | Explorar el sitio y encontrar los selectores del menú | `grabar.mjs --explorar` | `pasos/explorar.png` + lista de enlaces y botones |
| 2 | Escribir los pasos | — | `tutorial.json` |
| 3 | Grabar | `grabar.mjs` | `grabacion/*.webm`, `pasos/NN.png`, `grabacion.json` |
| 4 | Escribir la narración mirando cada captura | — | campo `voz` de cada paso |
| 5 | Voz | `voz.mjs --local` (o `voz.ts` de edwin-motion) | `guion.md`, `assets/audio/NN.wav` / `.mp3` |
| 6 | Armar el video | `armar.mjs` | `assets/recorrido.mp4`, `index.html`, `tiempos.json` |
| 7 | Revisar | `npx hyperframes check` + `snapshot` | capturas para mirar |
| 8 | Renderizar | `npx hyperframes render` | `render/<slug>.mp4` |

Para cambiar algo (un texto, un foco, un paso) se edita `tutorial.json` y se vuelve a armar; `index.html`
no se toca a mano. Si el sitio cambió, se vuelve a grabar y a armar.

A mano, desde la carpeta del tutorial (`<skill>` = esta carpeta):

```bash
cp <skill>/ejemplo/tutorial.json .            # y editar url, pasos y textos
TUT_USER=... TUT_PASS=... node <skill>/scripts/grabar.mjs --explorar
TUT_USER=... TUT_PASS=... node <skill>/scripts/grabar.mjs
node <skill>/scripts/voz.mjs --local          # voz gratis (Kokoro, voz ef_dora)
node <skill>/scripts/armar.mjs
npx hyperframes check
npx hyperframes render -o render/<slug>.mp4
```

Con tu voz de ElevenLabs (💲), en lugar de `voz.mjs --local`:

```bash
node <skill>/scripts/voz.mjs                  # solo escribe guion.md
npx tsx <skill>/../scripts/voz.ts . --contar  # cuenta caracteres y costo
npx tsx <skill>/../scripts/voz.ts .           # genera assets/audio/NN.mp3 (gana sobre los .wav)
```

## `tutorial.json`

```jsonc
{
  "slug": "mi-app-menu",
  "url": "https://dev.mi-app.test",             // base: "ir" acepta rutas relativas
  "titulo": "MI APLICACIÓN",                     // portada (Anton, mayúsculas)
  "subtitulo": "Cómo entrar y moverte por el menú",
  "marca": "MI APLICACIÓN · ENTORNO DE PRUEBAS",  // arriba a la derecha durante todo el video
  "cierre": { "titulo": "YA SABES MOVERTE", "subtitulo": "Entrar · Ventas · Ajustes" },
  "colores": { "fondo": "#0d2233", "acento": "#f39200", "texto2": "#8cbf3f", "tapa": "#e6ecf1" },
  "ancho": 1600, "alto": 900,                    // ventana grabada
  "pausa": 2500,                                 // espera tras cada clic (ms)
  "pasos": [ /* ver abajo */ ]
}
```

| Campo | Para qué | Por defecto |
|---|---|---|
| `url` | Sitio base. Solo entornos de desarrollo o de pruebas | — |
| `titulo`, `subtitulo` | Portada | — |
| `marca` | Rótulo fijo arriba a la derecha | — |
| `cierre` | Pantalla final "LISTO" | — |
| `colores` | `fondo`, `acento` (marco, aros, ficha), `texto2` (segundo color), `tapa` (rectángulos de privacidad) | azul noche, naranja, verde, gris claro |
| `ancho`, `alto` | Tamaño de la ventana grabada. 1600×900 deja el texto legible en 1080p | 1600×900 |
| `pausa` | Espera después de cada clic, para que la página cargue | 2500 ms |

Cada paso:

| Campo | Para qué |
|---|---|
| `titulo` | Texto de la ficha "PASO NN" |
| `acciones` | Lo que hace Playwright (tabla siguiente), en orden |
| `voz` | Frase de la narración: solo lo que se ve en la captura, 12-25 palabras |
| `foco` | `[x, y, escala]` en píxeles de la grabación: zoom a esa zona (escala 1,25-1,6) |
| `desde` | `"inicio"`: el zoom empieza con el paso; sin él, 2 s después del último clic |
| `tapar` | Rectángulos `[x, y, ancho, alto, color?]` que tapan datos reales durante el paso |

Acciones (todas aceptan `pausa` en ms):

| Acción | Ejemplo | Qué hace |
|---|---|---|
| `ir` | `{ "ir": "/login" }` | Navega a la ruta y espera a que cargue |
| `clic` | `{ "clic": "a[href='/pedidos']", "etiqueta": "Pedidos" }` | Mueve el cursor, hace clic; con `etiqueta`, salta el cartel junto al elemento |
| `escribir` | `{ "escribir": "input[type=email]", "env": "TUT_USER" }` | Teclea el valor de una variable de entorno (`env`) o un texto fijo (`texto`) |
| `desplazar` | `{ "desplazar": 600 }` | Rueda del mouse, en píxeles |
| `esperarOculto` | `{ "esperarOculto": "Cargando" }` | Espera a que desaparezca ese texto |
| `esperar` | `{ "esperar": 1500 }` | Espera fija |

Los selectores son de Playwright: CSS, `:has-text('Ventas')`, `a[href='...']`. `--explorar` lista los
enlaces y botones visibles con su `href` para elegirlos.

## Reglas

- **Credenciales solo de prueba y solo en variables de entorno.** En `tutorial.json` va el nombre de
  la variable (`"env": "TUT_PASS"`), nunca el valor. No se graban sitios de producción ni cuentas reales.
- **La narración dice solo lo que se ve.** Nombres del menú tal cual, sin inventar funciones.
- **Privacidad.** Antes de renderizar se miran todas las capturas: correos, nombres, teléfonos,
  documentos o cifras de clientes reales se tapan con `tapar`.
- **Nada con efectos reales.** No se aceptan cookies ni términos, ni se envían formularios que creen,
  borren o paguen, salvo que el creador lo pida para ese entorno de pruebas.
- **Plata = aprobación.** La voz local es gratis; la de ElevenLabs se cuenta primero (`--contar`).

## Qué necesitas

- [`edwin-motion`](../README.md) instalado (este repositorio) y los skills de HyperFrames
  (`npx skills add heygen-com/hyperframes`).
- Node 20+, `ffmpeg` y `ffprobe` en el PATH, y Google Chrome instalado (Playwright lo usa con
  `channel: 'chrome'`, no descarga otro navegador).
- Para la voz local: Python 3.10+ y `pip install kokoro-onnx soundfile`. El modelo se descarga solo la
  primera vez.
- Para tu voz: `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE`, como en edwin-motion.

## Instalación

`edwin-tutorial` usa la carpeta de arriba (`edwin-motion`) para fuentes, sonidos y voz, así que se
instala **enlazado**, no copiado solo:

```bash
# con edwin-motion ya clonado en ~/.claude/skills/edwin-motion
cd ~/.claude/skills/edwin-motion/edwin-tutorial && npm i

# macOS / Linux
ln -s ~/.claude/skills/edwin-motion/edwin-tutorial ~/.claude/skills/edwin-tutorial
# Windows (PowerShell, sin permisos de administrador)
New-Item -ItemType Junction -Path "$HOME\.claude\skills\edwin-tutorial" -Target "$HOME\.claude\skills\edwin-motion\edwin-tutorial"
```

Igual dentro de `.claude/skills/` de un proyecto, si solo lo quieres ahí. Al reiniciar Claude Code
aparece `/edwin-tutorial`.

## Qué trae

```
edwin-tutorial/
├── SKILL.md              instrucciones para el agente (flujo, reglas, formato)
├── README.md             este archivo
├── package.json          Playwright 1.56.1
├── ejemplo/tutorial.json plantilla para empezar
└── scripts/
    ├── grabar.mjs        graba con Playwright (cursor visible) o explora con --explorar
    ├── voz.mjs           escribe guion.md y, con --local, la voz con Kokoro
    └── armar.mjs         corta y congela por paso y escribe index.html con las capas
```

## Límites conocidos

- Playwright graba a 25 cuadros por segundo y comprime: con texto muy pequeño, subir el `foco` o grabar
  en 1280×720.
- La etiqueta se ubica con la caja del elemento en el momento del clic; si la página se redibuja, puede
  quedar corrida un instante (dura 1,9 s).
- Sitios con detección de bots, CAPTCHA o doble factor no se automatizan: ese tramo lo graba el creador.

## Créditos y licencia

Hecho por Edwin Trujillo · [Edwin IA](https://www.youtube.com/@EdwinT_IA). Mismas licencias que
edwin-motion (ver [`LICENSE`](../LICENSE)). Playwright, HyperFrames, Kokoro y ElevenLabs tienen sus
propias licencias.
