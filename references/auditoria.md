# Auditoría (modo `auditar <slug> [largo|short|carrusel|todo]`)

`revisar` mira el **proyecto** antes del render. `auditar` mira **lo que se entrega**: los mp4 de
`out/<slug>/` y las láminas del carrusel, como los va a ver la gente. Cada chequeo de abajo viene de
una falla real que se escapó a `revisar`. Sin pieza indicada se audita `todo` lo que exista.

Salida: `out/<slug>/AUDITORIA.md` con una tabla por pieza: **dónde** (segundo y escena, o número
de lámina), **falla**, **gravedad** (bloquea / corregir / mirar) y **corrección** propuesta o
aplicada. Si todo pasa, se dice qué se auditó y con qué medición. En el modo suelto se entrega la
lista y se corrige solo con el sí del creador; en `auto` se corrige solo (ver §3.8 del SKILL).

Herramientas: hojas de cuadros (`ffmpeg -ss <s> -t <d> -i <mp4> -vf "fps=4,scale=480:-1,tile=4x4"`),
`npx hyperframes snapshot --at …` para el proyecto, `ffmpeg` (`ebur128`, `volumedetect`,
`blackdetect`) y los `*.words.json` de la voz. **Mirar** cada hoja; no se audita sin ver.

## 1. Video (largo y Short)

1. **Parpadeos.** Un elemento que aparece, se va y vuelve (o se va antes de tiempo) casi siempre
   son dos animaciones peleando por la misma propiedad: la entrada (`fromTo` desde fuera de
   cuadro) y un flotado o `stagger` sobre el mismo grupo que arranca antes de que el último
   elemento haya entrado. Buscarlo en el código: misma propiedad (`y`, `x`, `opacity`, `scale`)
   del mismo selector con intervalos que se cruzan. Confirmarlo con una hoja a 4-5 fps alrededor de
   cada entrada de tarjeta. Corrección: el efecto de grupo empieza cuando ya entró el último.
2. **Texto que no se alcanza a leer.** Todo texto en pantalla queda visible al menos
   `max(1 s, 0,3 s × palabras)`. Revisar los cortes de panel (`CORTES`, `tl.set(... opacity: 0)`)
   y paneles de "destello" que duran fracciones de segundo. Si el corte va clavado a una palabra,
   moverlo a la siguiente palabra que deje el tiempo (y mover con él el sonido y el corte de música
   que dependan de ese instante).
3. **Sonidos que tapan la voz.** Por cada `<audio>` de efecto: su intervalo
   `[data-start, data-start + data-duration]` contra las palabras de la voz. Falla si se cruza con
   voz y además dura > 1,2 s, o si el tramo con efecto suena ≥ 3 dB más fuerte que la voz sola
   alrededor (`ebur128` del render en ese segundo vs. 2 s antes). Ojo con `data-duration`: un
   efecto largo (glitch, riser) suena entero aunque el movimiento dure 0,2 s. Corrección: cortar
   `data-duration`, bajar `data-volume` o cambiar por un efecto corto de la biblioteca (o de
   Pixabay); anotar el cambio en `sonidos.md`.
4. **Cifras.** Cada cifra en pantalla está en el guion con su fuente. Las cifras de rendimiento
   que una empresa da sobre su propio modelo (benchmarks del anuncio) se cruzan con **mediciones
   independientes** (laboratorios y tablas públicas de terceros): si existe una, se muestra en
   pantalla con su fuente en mono pequeña y se agrega a las fuentes de la descripción; si dice
   otra cosa, se marca "mirar" para el creador. Si no existe, la pantalla dice "según <empresa>".
5. **Técnica.** Duración esperada, sonoridad integrada (`ebur128`, objetivo del proyecto), pico
   ≤ −1 dBTP, música audible en una pausa, cuadros negros (`blackdetect`; un panel de fondo negro
   intencional no es falla: confirmarlo mirando el cuadro).
6. **Medios.** Ningún medio sin crédito visible ni con licencia "por confirmar".
7. **Elementos que asoman antes de entrar.** Por cada entrada de lado o de abajo (`fromTo` con
   `x`/`y` grande), calcular dónde queda el elemento mientras espera (posición CSS + desplazamiento +
   ancho + sombra): si alguna parte cae dentro de 1920×1080 con el panel visible, falla (se ve la
   tarjeta quieta en el borde antes del golpe). Corrección: desplazamiento a ±2000 (`recetas.md`,
   entradas de lado).
8. **Tachones y marcas sobre otro elemento.** Una raya, tachón o círculo se posiciona en px sobre
   lo que marca (fila, palabra), no en % del contenedor; mirar el cuadro para confirmar que cruza
   el elemento y no el espacio vacío.
9. **Adornos sin función.** Objeto que se mueve (péndulo, alfiler, hilo, flecha) sin conectar ni
   señalar nada: se quita, con su sonido.
10. **Short por red.** Short a −14 LUFS ±1 (pico ≤ −1,5 dBTP). La variante TikTok no manda fuera de
    TikTok (YouTube, "enlace en el perfil", "video completo") ni en la voz, ni en pantalla, ni en su
    texto de `publicacion.md`, y no deja legibles teléfonos, correos ni direcciones en las capturas
    (`flujo-video.md` paso 11). Si falta la variante, es falla grave: TikTok elimina esos videos.

## 2. Carrusel

Hoja de contacto de todas las láminas (`ffmpeg … hstack`) y cada lámina a ⅓ de tamaño.

1. **Texto encogido.** El renderizador encoge toda la lámina si un renglón no cabe: título o
   cifras diminutos con mucho espacio vacío = falla. Típico: `stats` con 3 valores largos en fila
   (dejar 2, o valores más cortos sin espacio antes del %).
2. **Cortes feos.** Palabra sola en el último renglón, cifra partida ("99,2" / "%"), palabras con
   guion partidas ("ARC-" / "AGI-3"). Corrección: `\n` propios, reformular o sacar la palabra
   con guion al título.
3. **Visuales.** Nada se sale del lienzo ni tapa texto, `handle` o sello; el presentador mira o
   señala hacia el texto, no hacia afuera.
4. **Glifos.** Caracteres que Anton no tiene (`≠`, `«»`, flechas) salen como otra cosa: cambiarlos.
5. **Copy.** Reglas de `carrusel.md`: `highlight` literal, CTA = acción + para qué, variedad de
   tipos, una idea por lámina, cifras solo verificadas (las mismas del §1.4), texto del post propio
   (no copiado del video).

## 3. Cierre

`AUDITORIA.md` termina con: qué se corrigió (con antes → después), qué quedó para el creador y
qué se volvió a renderizar. Tras corregir un video se re-renderiza y se vuelve a auditar solo lo
tocado (máximo 2 vueltas); lo que siga fallando queda en "mirar".
