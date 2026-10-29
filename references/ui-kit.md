# Modo `ui-kit` — estándar de colores del canal

Objetivo: dejar **una sola fuente de color** para todo el canal (largos, Shorts, portadas,
miniaturas, carruseles), con roles y no con una bolsa de muestras. Cada video sigue eligiendo sus
fondos y su objeto (§2 del skill), pero lo hace **desde estos roles**, no inventando hex.

Uso: `/edwin-motion ui-kit [<slug>|<ruta a pieza>] [--actualizar]`

- Con pieza: `<slug>` (lee `guiones/<slug>/ESTILO.md`, `compositions/*.html` y lo entregado en
  `out/<slug>/`) o una ruta a una imagen/HTML/carpeta. Se **extrae** el estándar de ahí.
- Sin pieza: si el `CLAUDE.md` del proyecto nombra una pieza de referencia de color, usar esa y
  decirlo en una línea; si no nombra ninguna, **entrevistar** al creador (paso 2).
- `--actualizar`: ya existe un `ui-kit.css` → se compara contra la pieza y se proponen cambios
  rol por rol; no se reescribe sin el sí del creador.

Salida, en la carpeta de identidad del proyecto (la que nombre su `CLAUDE.md`; si no, `identidad/`):
`ui-kit.css` (variables), `ui-kit.md` (roles y reglas de uso) y `ui-kit.html` (lámina de muestra
para aprobar). Este modo **no gasta** nada.

## 1. Extraer de una pieza

1. **Inventario.** Contar los hex de la pieza (`grep -ohE "#[0-9a-fA-F]{6}"` sobre sus HTML/CSS/MD,
   `sort | uniq -c | sort -rn`) y leer su `ESTILO.md`. Si la pieza es solo imagen/video, sacar
   cuadros (`ffmpeg -ss … -frames:v 1`) y **mirarlos**; muestrear los colores dominantes por zona,
   no por promedio.
2. **Separar lo del canal de lo del tema.** Para cada color, preguntarse: ¿aparecería igual en un
   video de otro tema?
   - Sí → **fijo del canal** (fondos neutros, tinta, resaltador, sello, color del presentador).
   - No → **del tema**: el color de marca de la empresa/producto de la noticia, el bando contrario
     de un choque, etc. No entra al estándar como valor; entra como **ranura** (`--acento-tema`,
     `--tension`) con un valor por defecto.
   - Los que salen 1-2 veces y no tienen rol claro se descartan (son ruido, no sistema).
3. **Asignar roles** (lista de §3). Un color sin rol no entra. Un rol sin color se completa
   derivándolo de los existentes (mismo matiz, otra luminosidad), nunca con un gris genérico.
4. Seguir en §4.

## 2. Entrevistar (sin pieza)

Una sola ronda con `AskUserQuestion` (máx. 4 preguntas, opciones concretas con hex de ejemplo en
la descripción; "Otro" queda para que el creador dé su hex):

1. **Temperatura** del canal: cálida editorial (papel/crema + tinta) · fría tecnológica (noche +
   neón contenido) · contraste de periódico (blanco/negro + un solo color).
2. **Fondo dominante**: claro (papel), oscuro (noche/negro) o alternado por escena.
3. **Color de marca** (el que se reconoce como "el canal"): proponer 3 sacados del personaje o del
   logo si existen (mirar `personaje/` o el avatar), más "Otro (hex)".
4. **Color de alerta/sello** para impactos: rojo sello · naranja · el mismo de marca.

Con las respuestas, armar los roles de §3 y seguir en §4. Si una respuesta deja un rol imposible
(p. ej. marca amarilla sobre papel claro como texto), decirlo y proponer el ajuste, no taparlo.

## 3. Roles obligatorios

| Rol | Variable | Para qué |
|---|---|---|
| Fondos | `--fondo-impacto`, `--fondo-documento`, `--fondo-tablero`, `--fondo-presentador`, `--fondo-tension` | Uno por técnica/escena; el corte duro alterna entre ellos |
| Trama | `--trama-tablero`, `--trama-presentador`, `--trama-tension` | Puntos/retícula del fondo (decorativo, sin mínimo de contraste) |
| Superficie | `--tarjeta` | Tarjetas brutalistas, hojas, marcos de medios |
| Texto | `--texto-claro` (sobre fondos claros), `--texto-oscuro` (sobre oscuros), `--texto-2-claro`, `--texto-2-oscuro` | Principal y secundario (créditos, chips mono, fechas) |
| Línea | `--borde`, `--sombra` | Borde 4-5 px y sombra dura de tarjeta |
| Énfasis | `--resaltador` (fondo detrás de la palabra clave), `--sello` (VETADO, ✕, cifras de choque), `--marca` (presentador, cierre, CTA) | Pocos y con dosis: el resaltador marca 1 palabra por panel |
| Institucional | `--oficial` | Documentos, gobiernos, fuentes formales |
| Estado | `--ok`, `--ok-claro` | Casillas marcadas ✔ sobre oscuro / sobre claro |
| Ranuras del tema | `--acento-tema`, `--tension` | Las llena cada `ESTILO.md`; el estándar trae un valor por defecto |

## 4. Verificar, mostrar, aprobar

1. Escribir `ui-kit.css` con primitivos (`--negro: #050505;`) y roles que apuntan a ellos
   (`--fondo-impacto: var(--negro);`). Solo hex de 6 dígitos (el render y el verificador no leen
   OKLCH ni alfa). Declarar en comentarios **cada par texto/fondo que se va a usar**:
   `/* @par texto-claro fondo-documento 4.5 */`.
   Mínimos en video (1080 px de ancho, se ve en celular): **4.5** para texto < 40 px (chips mono,
   créditos, fechas); **3** para titulares y cifras grandes (Anton, Poppins 800+ ≥ 40 px) y para
   bordes/íconos que dan información. Un color que no llega a 4.5 queda marcado en `ui-kit.md`
   como "solo grande".
2. `node <skill>/scripts/contraste.mjs <identidad>/ui-kit.css` — corregir hasta que todo pase
   (ajustar luminosidad del mismo matiz; no cambiar de color).
3. **El color nunca es el único código**: ✕/✔ con forma, sello con palabra, bandos con etiqueta.
   Revisar la lámina en escala de grises (filtro `grayscale(1)` en el navegador): si dos roles que
   deben distinguirse se confunden, separar su luminosidad.
4. `ui-kit.html`: una tarjeta por fondo con un titular Anton, un texto Poppins, un chip mono y los
   énfasis que se usan sobre él; importa `ui-kit.css` (nada de hex sueltos). Servir por HTTP,
   capturar y **mirar** la captura una vez; corregir en un solo lote.
5. `ui-kit.md`: tabla de roles (variable, hex, para qué, contraste contra sus fondos, "solo
   grande" si aplica), qué es fijo y qué es ranura del tema, dosis (cuánto de cada énfasis por
   panel) y prohibiciones: nada de degradados de texto, nada de alfa sobre texto, ningún hex fuera
   del kit en escenas nuevas (si hace falta uno, se agrega al kit primero).
6. Mostrar al creador la lámina y la tabla. **Aprobar es del creador**; hasta su sí, el estándar
   queda como "propuesto" en la cabecera de `ui-kit.md`.

## 5. Cómo lo usan los demás modos

- `ESTILO.md` de cada video: la sección de paleta se escribe con las variables del kit y solo
  llena las ranuras (`--acento-tema: #…` con el color de la marca de la noticia, `--tension` si hay
  un bando contrario). Las escenas copian `ui-kit.css` a `assets/` y usan `var(--…)`.
- `carrusel`: el bloque `tema` del JSON se llena desde el kit (`fondo`, `texto`, `tinta`,
  `acento` = `--acento-tema` o `--marca`, `rojo` = `--sello`, `amarillo` = `--resaltador`).
- `cover-large` / `cover-short`: mismos roles; la miniatura usa máximo 3 colores del kit.
- `auditar`: un hex que no esté en el kit, en una pieza nueva, se reporta como "mirar".
