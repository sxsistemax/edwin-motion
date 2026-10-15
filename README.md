# edwin-motion

**Skill de Claude Code para hacer videos de motion graphics con IA**, sin cámara y sin animar a
mano: guion → voz con tiempos por palabra → escenas en HTML animadas con GSAP → sonido automático
→ render → paquete de publicación para cada red.

Es el skill con el que hago los videos del canal **Edwin IA**
([youtube.com/@EdwinT_IA](https://www.youtube.com/@EdwinT_IA)). En el video "Así hago mis videos"
explico todo el proceso paso a paso.

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

## Qué necesitas

| Herramienta | Para qué | Costo |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | El agente que escribe las escenas siguiendo este skill | Suscripción de Claude |
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen) y sus skills | Escenas en HTML, revisión y render | Gratis |
| [ElevenLabs](https://elevenlabs.io) | Voz con tiempos por palabra, clon de tu voz, efectos de sonido | Desde el plan Starter |
| [GSAP](https://gsap.com) | Animación (lo carga cada escena) | Gratis |
| [Node.js](https://nodejs.org) 20+ | Correr los scripts (`npx tsx` para los .ts) | Gratis |
| [ffmpeg](https://ffmpeg.org) | Audio, recortes | Gratis |
| [Google Chrome](https://www.google.com/chrome/) | Sonido automático y capturas de portadas | Gratis |
| [Python](https://www.python.org) + [Pillow](https://python-pillow.org) | Solo si usas presentador con personaje | Gratis |
| [MusicGen](https://huggingface.co/facebook/musicgen-small) (opcional) | Música de fondo local, vía el skill `media-use` de HyperFrames | Gratis |
| Fuentes [Anton](https://fonts.google.com/specimen/Anton), [Poppins](https://fonts.google.com/specimen/Poppins), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) | Tipografía base | Gratis |

## Instalación

```bash
# 1. Skills oficiales de HyperFrames (este skill se apoya en ellos)
npx skills add heygen-com/hyperframes

# 2. Este skill: clónalo dentro de tus skills de Claude Code
git clone https://github.com/sxsistemax/edwin-motion ~/.claude/skills/edwin-motion
#    (o dentro de .claude/skills/ de un proyecto, si solo lo quieres ahí)

# 3. Variables de entorno para la voz
export ELEVENLABS_API_KEY=...        # tu llave de ElevenLabs
export ELEVENLABS_VOICE=...          # voice_id de tu voz (clon o de la biblioteca)
```

En Windows (PowerShell): `$env:ELEVENLABS_API_KEY="..."`. Si Chrome no está en la ruta por defecto
de Windows, define `CHROME_PATH`.

## Primer video, rápido

1. Abre Claude Code en una carpeta de proyecto y escribe:
   `/edwin-motion video de 1 minuto sobre <tu tema>`.
2. El agente te propone el guion en `guiones/<slug>/guion.md` (bloques `## Bloque N`, líneas de voz
   con `>`, y por bloque "En pantalla" y "Sonido"). Ajústalo y apruébalo.
3. Mira cuánto cuesta la voz y genérala:
   ```bash
   npx tsx ~/.claude/skills/edwin-motion/scripts/voz.ts guiones/<slug> --contar
   npx tsx ~/.claude/skills/edwin-motion/scripts/voz.ts guiones/<slug>
   ```
4. Pídele al agente que arme las escenas, el sonido y el video; revisa las capturas que te
   muestra y corrige lo que no te guste, como se lo dirías a un editor.
5. Render: `npx hyperframes render -o out/<slug>/largo/<slug>.mp4`.

El flujo completo, con todos los pasos y comandos, está en [`SKILL.md`](SKILL.md) §3.

## Qué trae

```
edwin-motion/
├── SKILL.md                    reglas de movimiento, flujo completo y contrato de cada escena
├── references/recetas.md       18 recetas GSAP (entradas, golpes, contadores, boca del presentador…)
├── plantillas/
│   ├── escena.html             plantilla de una escena (HyperFrames + GSAP)
│   ├── armar.mjs               monta el video largo: escenas, voces, música, efectos, destellos
│   └── publicacion/            subtítulos SRT + capítulos, miniatura y portadas por red
├── scripts/
│   ├── voz.ts                  narración por bloques con ElevenLabs + tiempos por palabra
│   ├── sonidos.mjs             pone sonido solo a cada movimiento de las escenas
│   ├── sfx-base.mjs            arma golpe.mp3 y grieta.mp3 desde los efectos de HyperFrames
│   ├── generar-sfx.ts          genera efectos nuevos con ElevenLabs describiéndolos en texto
│   ├── presentador.py          poses de tu personaje con boca animable
│   └── halftone.py             variante del presentador en puntos (halftone)
└── assets/sfx/                 15 efectos propios (ElevenLabs Sound Effects)
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
- `golpe.mp3` y `grieta.mp3` no vienen en el repo porque salen de efectos de Pixabay que trae
  HyperFrames; `scripts/sfx-base.mjs` los arma desde tu propia instalación.

## Créditos y licencia

Hecho por Edwin Trujillo · [Edwin IA](https://www.youtube.com/@EdwinT_IA). Estilo inspirado en
IAdeGuardia, Dresk y Andy Caseres. Código y efectos de `assets/sfx/` bajo licencia MIT (ver
[`LICENSE`](LICENSE)). HyperFrames, GSAP, ElevenLabs y las fuentes tienen sus propias licencias.
