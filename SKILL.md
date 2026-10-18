---
name: edwin-motion
description: Lenguaje de animación y fábrica de videos de motion graphics con voz IA (HyperFrames), creado para el canal Edwin IA — se invoca con un modo, `/edwin-motion <modo> [slug|tema] [opciones]`, que cubre todo el ciclo de un tema — producción completa sin intervención desde una idea (`auto`), ideas, noticia del día desde una URL, guion, voz, largo 16:9, Short 9:16, carrusel, miniatura del largo, portadas del Short, publicación, auditoría de lo entregado (videos y carruseles), medios reales (foto, video, pantallazo, documento por scraping) e imágenes IA con autorización. Movimiento fijo (tipografía editorial que golpea, tableros con contadores, presentador con boca sincronizada, todo clavado a la voz palabra por palabra); fondos y gráficos libres por tema. Usar en cada video, Short, portada o pieza nueva del canal.
argument-hint: "<modo> [slug|tema] [opciones] — sin modo muestra el menú"
---

# edwin-motion

Pedido: `$ARGUMENTS`

## 0. Enrutador (hacer esto primero)

1. Tomar la **primera palabra** de los argumentos como `modo`; la segunda, como `slug` (carpeta en
   `guiones/<slug>/`) o el tema en texto libre; el resto, opciones (`--personaje`, `--n 3`…).
2. Sin modo, o modo desconocido → mostrar la tabla de §1 y preguntar qué modo correr. Si el modo
   se parece a uno de la tabla (`miniatura` → `cover-large`, `portadas` → `cover-short`,
   `video`/`long` → `largo`), usar ese y decirlo en una línea.
3. Falta el slug y el modo lo necesita → buscar el último tema activo (`TEMAS.md` marcado `[x]`
   sin `out/<slug>/publicacion.md`) y proponerlo; no inventar slugs.
4. Leer **solo** la referencia que pide el modo (columna "Lee"). Los principios de §2 aplican a
   todo lo que se mueve.
5. **Biblioteca primero.** `medios`, `imagen` y `sonidos` buscan antes en la biblioteca
   (`biblioteca.mjs buscar <texto>`); solo se descarga o genera lo que no esté.
6. **Plata = aprobación.** Los modos con costo (💲) muestran qué se va a gastar y esperan el sí de
   el creador antes de llamar a ElevenLabs, fal.ai o créditos de sfx. Todo gasto real va a `costos/costos.csv`.

## 1. Modos

| Modo | Objetivo | Entrada → salida | Lee |
|---|---|---|---|
| `ideas [nicho\|tema]` | Proponer temas con potencial viral y material real que los sostenga | → 5 temas nuevos al final de `TEMAS.md` (gancho, formato, duración, fuentes), sin marcar | §3.1 |
| `auto <idea\|slug> [--presupuesto 2] [--solo-short] [--sin-carrusel] [--imagenes]` 💲 | Producción completa sin intervención: de una idea a largo + Short + carrusel + paquete de publicación + auditoría, decidiendo solo y con tope de gasto | idea → `out/<slug>/` completo + `out/<slug>/AUTO.md` (decisiones, costos, qué revisar antes de publicar) | §3.8 |
| `noticia <url> [--carrusel]` 💲 | De un anuncio de IA a un Short publicado el mismo día (velocidad en noticias) | URL → guion corto, Short 9:16, portadas, textos por red en `out/<slug>/` | §3.7 |
| `guion <slug\|tema>` | Guion largo por bloques con cifras verificadas + gancho del Short + plan de sonidos y de medios | → `guiones/<slug>/guion.md`, `sonidos.md`, `medios.md` | §3.2, `flujo-video.md` paso 1 |
| `voz <slug>` 💲 | Locución con tu voz o tu clon en ElevenLabs (`with-timestamps`; con un clon, probar `eleven_v4` vs `eleven_v3`) | guion → `assets/audio/NN.mp3` + `NN.words.json` | `flujo-video.md` paso 2 |
| `largo <slug>` | Video principal 16:9 (8-14 min) | guion + voz → `out/<slug>/largo/<slug>.mp4` | `flujo-video.md` pasos 3-10, `recetas.md` |
| `short <slug>` | Short 9:16 nativo (< 60 s) con el gancho del largo | → `out/<slug>/short/<slug>-short.mp4` | `flujo-video.md` paso 11, `recetas.md` |
| `carrusel <slug> [--personaje]` | Carrusel 4:5 para IG/LinkedIn/Facebook | → `out/<slug>/carrusel/slide-*.png` | `carrusel.md` |
| `cover-large <slug>` | Miniatura del largo 1280×720 | título elegido → `out/<slug>/largo/miniatura.png` | `publicacion.md`, §3.3 |
| `cover-short <slug>` | Portadas del Short por red (YT Shorts, TikTok, Reels, cuadrícula IG) | → `out/<slug>/short/portada-*.png` | `publicacion.md`, §3.3 |
| `titulos <slug>` | 3 opciones de título (≤ 60 car.) y esperar elección | → título elegido en `out/<slug>/publicacion.md` | `publicacion.md` (Títulos) |
| `publicacion <slug>` | Paquete completo: SRT, capítulos, textos por red, miniatura y portadas | → `out/<slug>/publicacion.md` + archivos | `publicacion.md` |
| `biblioteca [buscar <texto>\|usar <archivo> <slug>]` | Índice de todo lo ya descargado o generado (medios, imágenes IA, sonidos, camas) para reutilizarlo en vez de bajarlo o pagarlo de nuevo | → `guiones/BIBLIOTECA.md`; `usar` copia al tema con su fuente/licencia | §3.6 |
| `medios <slug> <url\|búsqueda>` | Traer material real (foto, logo, clip, pantallazo, documento) para combinar con la animación | → `guiones/<slug>/assets/medios/` + `medios.json` | `medios.md` |
| `imagen <slug> "<qué>"` 💲 | Imagen IA cuando no hay material real ni se puede dibujar | → `assets/medios/ia-*.png` (solo con sí del creador) | `medios.md` §5 |
| `sonidos <slug>` | Efectos temáticos (Pixabay primero) + sonidos automáticos de movimiento | → `assets/sfx/`, `*.sfx-auto.json` | `flujo-video.md` pasos 1 y 7 |
| `musica <slug>` | Cama musical nueva para el tema (MusicGen local, gratis) | → `assets/bgm/cama.wav` | `flujo-video.md` paso 3 |
| `presentador <slug>` | Poses del personaje + bocas para sincronizar | → `guiones/<slug>/assets/img/pj-*.png` | `flujo-video.md` paso 4 |
| `revisar <slug> [largo\|short]` | Control de calidad antes de entregar | → lista de fallas con segundo y escena | §3.4 |
| `auditar <slug> [largo\|short\|carrusel\|todo]` | Auditoría de lo entregado (mp4 y láminas, no el proyecto): parpadeos, textos que no se alcanzan a leer, sonidos que tapan la voz, cifras contra mediciones independientes, láminas con texto encogido o cortado | → `out/<slug>/AUDITORIA.md` con dónde, falla, gravedad y corrección | `auditoria.md` |
| `estado <slug>` | Qué hay hecho y qué falta del tema | → tabla de piezas con ✔/✘ y el siguiente modo a correr | §3.5 |

Referencias: `references/flujo-video.md` (producción), `references/publicacion.md` (paquete y
títulos), `references/medios.md` (scraping e imágenes IA), `references/recetas.md` (código de cada
movimiento), `references/auditoria.md` (auditoría de lo entregado). Rutas relativas a la carpeta del skill (`<skill>` = `~/.claude/skills/edwin-motion/` o
`.claude/skills/edwin-motion/` del proyecto); los comandos se corren desde la raíz del proyecto.

## 2. Principios de movimiento (no negociables, todos los modos que animan)

Lo que se fija es el **movimiento y el ritmo**, no la decoración. Cada video elige su paleta,
fondos, objetos y gráficos; lo que no cambia es que todo entra rápido, golpea, rebota, sigue vivo
y está clavado a las palabras de la voz.

Creado por Edwin Trujillo para el canal Edwin IA (youtube.com/@EdwinT_IA). Estilo inspirado en los
videos de IAdeGuardia, Dresk y Andy Caseres (tres técnicas de abajo).

**Referencias del proyecto:** si el `CLAUDE.md` del proyecto nombra videos aprobados como
referencia de estilo, abrirlos antes de diseñar el primer video; si no hay, el primer video que el
creador apruebe pasa a ser la referencia. Este skill se apoya en los skills oficiales de HyperFrames
(`npx skills add heygen-com/hyperframes`): leer `/hyperframes` y `/hyperframes-core` antes de
escribir la primera escena. Requisitos completos en `README.md`.

1. **Clavado a la voz.** Cada aparición importante cae en el `start` de una palabra real de
   `assets/audio/NN.words.json` (ElevenLabs `with-timestamps`). Nada "más o menos a tiempo".
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
7. **Cifras solo verificadas** (regla del canal): las del guion, con fuente en mono pequeña cuando
   el guion la nombra. Gráficas sin datos reales se marcan "ilustrativo".
8. **Medios reales como prueba, no como relleno** (`medios.md`): entran como objeto del lenguaje
   (tarjeta, marco de navegador, página que cae) y siempre con crédito visible.

| Técnica | Qué la define (movimiento) | Libre por video |
|---|---|---|
| **Editorial** (Dresk) | Condensada gigante (Anton) que cae letra por letra o golpea palabra por palabra; objeto que pasa entre las letras o cuelga de un hilo; letras que se parten | Color de papel/fondo, color de la tipografía, el objeto |
| **Tablero / recibo** (Andy Caseres) | Tarjetas brutalistas (borde negro, sombra dura) que suben; contadores que corren; barras que se llenan; casillas que aparecen y se marcan; gráfica que se dibuja con punto en la punta; paquetes que viajan por líneas punteadas; título que se teclea | Fondo (trama, color), tipo de tarjeta, datos |
| **Presentador + tarjetas** (IAdeGuardia) | Personaje (arte original a color) que entra con rebote, respira y cambia de pose en palabras fuertes; etiqueta de palabra clave que salta junto a él; contador de niveles 1-2-3; tarjetas tipo repositorio; objetos isométricos que caen | Fondo, color de acento (gafas), qué tarjetas |

**Tipografía base del canal** (se puede sumar una display por tema): Anton (titulares), Poppins
800/900 (texto), JetBrains Mono (etiquetas de UI), Source Serif itálica (citas). Copiar los .ttf
a `assets/fonts/` del video desde `plantillas/carrusel/fuentes/` del skill.

## 3. Detalle de los modos que no tienen referencia propia

### 3.1 `ideas`
1. Leer `TEMAS.md` (qué hay, qué se aprobó) y `out/*/publicacion.md` (qué ya salió) para no repetir.
2. Buscar qué funciona: skill `youtube-agent:yt-viral` en el nicho (o el tema dado) + `WebSearch`
   de noticias de IA de las últimas 2 semanas.
3. Proponer **5** temas, cada uno con: gancho en una frase, formato (motion comic / graphics /
   images), duración objetivo, 2-3 fuentes primarias que lo sostienen, qué medios reales hay
   (demo, paper, tuit) y el momento fuerte que sería el Short.
4. Agregarlos al final de `TEMAS.md` **sin** `[x]`: aprobar es del creador.

### 3.2 `guion`
1. Tema aprobado en `TEMAS.md` (si no lo está, preguntar). Slug en kebab-case.
2. Investigar con fuentes primarias; cada cifra con su fuente al lado. Sin fuente, no entra.
3. `guion.md` por bloques numerados (uno por escena): texto de voz (tono del canal, tú, frases
   cortas), cifras y fuentes, objeto protagonista y técnica sugerida. Bloque 1 = gancho de ≤ 8 s.
   Marcar con `[SHORT]` el tramo que se recorta para el Short. Cierre con CTA = acción + para qué.
4. `sonidos.md` (plan de sfx, `flujo-video.md` paso 1) y `medios.md` del tema: por bloque, qué
   material real hace falta (foto, clip, pantallazo, documento) con la URL si ya se sabe.
5. Mostrar el guion al creador; la voz (💲) no se genera hasta que lo apruebe.

### 3.3 `cover-large` / `cover-short`
Sin título elegido → correr primero `titulos`. Plantillas `plantillas/publicacion/portadas.html` +
`capturar.mjs` (copiar a `guiones/<slug>/publicacion/`, cambiar rutas/slug/textos). Miniatura: cara
del presentador con expresión fuerte + ≤ 4 palabras en Anton + un objeto del tema; legible a 168 px
de ancho (revisar con una copia reducida). Un medio real (logo, pantallazo) puede entrar si
refuerza el gancho. Capturar, **mirar** el PNG y copiarlo a `out/<slug>/`.

### 3.4 `revisar`
1. `npx hyperframes check` en el proyecto.
2. Capturas cada ~12 s (`npx hyperframes snapshot --at … --no-end --describe false`) y **mirarlas**:
   texto cortado, solapes no intencionales, paneles vacíos > 2 s, zonas seguras del Short.
3. La voz dice lo que dice el guion: si el proyecto trae su propio auditor de narración (ver su
   `CLAUDE.md`), usarlo; si no, `npx hyperframes transcribe` del audio y comparar palabra por palabra.
4. Del render: duración, `volumedetect` en una pausa (música audible), cuadros negros
   (`ffmpeg -vf blackdetect`).
5. Cruzar `assets/medios/medios.json`: ningún medio sin `fuente` ni con licencia "por confirmar".
6. Entregar la lista de fallas con segundo y escena; no corregir sin decir qué se cambió.

### 3.5 `estado`
Revisar existencia de: `guion.md`, `assets/audio/*.words.json`, `ESTILO.md`, escenas, render del
largo, render del Short, `publicacion.md` con título elegido, miniatura, portadas por red,
carrusel, `AUDITORIA.md`, renglón en `costos.csv`. Responder con la tabla y el siguiente modo a correr.

### 3.6 `biblioteca`
Script: `scripts/biblioteca.mjs` (desde la raíz del repo).
- Sin argumentos → reconstruye `guiones/BIBLIOTECA.md`: sonidos (skill + media-use + copias de
  cada video), medios reales e imágenes IA (de cada `medios.json`), camas de música. Duplicados por
  contenido se cuentan una vez, con los temas donde se usaron. Correrlo al terminar cada tema.
- `buscar <texto> [--tipo sfx|foto|video|captura|documento|ia|musica]` → busca en nombre, fuente,
  origen, descripción y prompt.
- `usar <archivo> <slug>` → copia al tema (`assets/sfx/` o `assets/medios/`) y anota en su
  `medios.json` la misma fuente y licencia, más `reutilizado` con el archivo original.
- Reglas: las camas de música **no** se reutilizan (cama nueva por video; están solo de referencia
  de prompt) y un medio con "⚠ sin fuente" no se usa hasta completar su fuente en el `medios.json`
  original.

### 3.7 `noticia <url>`
Objetivo: llegar primero sin sacrificar la regla de cifras verificadas. Encadena modos existentes
con **un solo punto de aprobación** (paso 4) para no frenar.

1. **Leer la noticia**: `WebFetch` de la URL (si bloquea, Playwright). Sacar qué pasó, quién,
   fecha, cifras y la frase textual más fuerte. Si la URL no es la fuente primaria (blog oficial,
   paper, comunicado, post del fundador), buscarla con `WebSearch` y usar esa. Confirmar con una
   segunda fuente. Rumor o filtración → se dice así en la voz ("según The Information…"), nunca
   como hecho.
2. **Slug**: `noticia-<tema>-<aaaammdd>` (fecha del anuncio). Carpeta `guiones/<slug>/`.
3. **Guion corto** en `guion.md` (40-55 s, sin largo): gancho ≤ 3 s con la cifra o el giro →
   qué pasó → por qué importa → qué cambia para ti → CTA (acción + para qué; "mira el video
   completo" solo si existe uno relacionado). Cada cifra con su fuente. Fecha del anuncio visible
   en pantalla (mono pequeña), porque la noticia caduca.
4. **Aprobación única** del creador: guion + títulos (3 opciones, ≤ 60 car.) + medios elegidos +
   costo de la voz. Sin su sí no se gasta nada.
5. **Medios** (biblioteca primero): `captura` de la página del anuncio (zoom a la frase clave),
   `foto` (og:image o logo del kit de prensa), `video` de la demo oficial ≤ 10 s si la hay.
   Crédito visible de cada uno (`medios.md`).
6. **Producción** con los modos de siempre: `voz` → `musica` (cama nueva de ~60 s) → `presentador`
   → Short 9:16 (`flujo-video.md` paso 11; escenas = bloques del guion, mismas reglas de
   movimiento) → `sonidos --index` → `revisar short`.
7. **Entrega**: `out/<slug>/short/` (mp4 + `cover-short`) y `out/<slug>/publicacion.md` con el
   título elegido y los textos por red. Con `--carrusel`, además el modo `carrusel`.
8. **Cierre**: `biblioteca` (reindexar) y una línea en `TEMAS.md` § Noticias publicadas con slug,
   fecha y si da para un largo (si la noticia crece, proponerla como tema).

### 3.8 `auto <idea|slug>` — producción completa sin intervención

Invocar este modo **es** la aprobación del creador para todas las decisiones que normalmente se le
preguntan (guion, título, medios, sonidos, mezcla) y para gastar **hasta `--presupuesto` USD**
(por defecto 2, de sobra para la voz de un largo de ~10 min; las imágenes IA quedan fuera salvo
`--imagenes`). No se le pregunta nada en el camino: cada decisión se toma con la regla del modo
correspondiente y se anota en `out/<slug>/AUTO.md`. Si una regla obliga a frenar, se frena y se
explica en ese archivo; nunca se rellena para terminar.

**Límites que el modo no cruza** (si hacen falta, para y lo deja escrito en `AUTO.md`):
- Publicar o subir algo a cualquier red: la entrega queda lista en `out/<slug>/`, publica el creador.
- Pasarse del presupuesto: antes de cada gasto se estima (`voz.ts --contar`, precio de fal.ai);
  si no alcanza, se acorta el guion una vez; si aún no alcanza, para.
- Temas sensibles: salud, finanzas personales, política, acusaciones a personas o empresas con
  nombre propio. Eso necesita revisión humana del guion.
- Afirmar en primera persona algo que no pasó: con la voz del creador, "lo probé" solo si el
  agente hizo la prueba de verdad en esta corrida y guardó la evidencia (pantallazo, salida); si
  no, se narra como "según X" o se quita.
- Usar medios con licencia "por confirmar" o sin fuente: se descartan.

**Cadena** (los modos de siempre, en orden; trabajos largos —escenas, renders— en segundo plano o
repartidos entre agentes como dice `flujo-video.md`):
1. **Tema.** Idea libre → slug kebab-case, agregar a `TEMAS.md` marcado `[x]` con "(auto)". Si no
   aparecen al menos 2 fuentes primarias que sostengan el tema, parar: sin material no hay video.
2. **`guion`** (§3.2) con duración según el material (8-14 min). Después, **verificación
   independiente**: un agente aparte revisa cada cifra contra su fuente; la que no se confirma se
   quita del guion. Bloque `[SHORT]` marcado.
3. **`titulos`**: 3 opciones con las reglas de `publicacion.md`; se elige la que cumple todas y
   tiene el contraste más claro, y se anotan las otras dos en `AUTO.md`.
4. **`medios`** (biblioteca primero): solo material oficial o pantallazos de páginas públicas, con
   crédito.
5. **`voz`** 💲 (estimación → presupuesto → generar). Si el proyecto tiene auditor de narración,
   correrlo y regenerar una vez los bloques que fallen.
6. **`musica`**, **`presentador`**, `ESTILO.md`, escenas, **`sonidos`** (Pixabay: se toma el primer
   candidato que cumple duración y etiquetas, sin pedir que alguien lo escuche; si no hay, el
   efecto se omite — generar sfx solo si cabe en el presupuesto), armar y mezcla con el nivel de
   `flujo-video.md` paso 8.
7. **`revisar`** en ciclo: corregir y volver a revisar, máximo 3 vueltas; lo que siga fallando
   queda listado en `AUTO.md` con segundo y escena.
8. Render del **largo** y del **Short** (sin `--solo-short`; con él, solo el Short desde el guion
   corto), **`publicacion`** completa y **`carrusel`** (siempre, salvo `--sin-carrusel`; sin
   personaje, con su propio texto por red en `publicacion.md`).
9. **`auditar todo`** (siempre, `references/auditoria.md`) sobre los mp4 y las láminas ya
   renderizados: se corrige lo que falle, se re-renderiza lo tocado y se vuelve a auditar, máximo
   2 vueltas. `out/<slug>/AUDITORIA.md` queda en la entrega y lo que siga en "mirar" pasa a la
   lista de `AUTO.md`. No se da por terminada una corrida `auto` sin este paso.
10. **Cierre:** costos reales en `costos/costos.csv`, `biblioteca` reindexada y `AUTO.md` con:
   título elegido y alternativas, fuentes usadas, cifras descartadas, medios usados y descartados,
   gasto por proveedor vs. presupuesto, fallas que quedaron y **lista corta de qué mirar antes de
   publicar** (el gancho, las cifras, el CTA).
