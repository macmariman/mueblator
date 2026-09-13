# Inventario · herramientas, vocabulario y plaza

Lo que hay de este lado: qué herramientas tenés, cómo le llamás a cada cosa y
qué se consigue en Uruguay. Es un archivo **general**, no uno por diseño, y se
llena **de a poco**: una línea cada vez que aparezca el dato, no de memoria.

**Lo que este archivo no es.** No es una fuente de medidas. Nada de acá se
copia a un diseño como confirmado: que tengas tornillos de un largo no
confirma que este mueble los lleve. La regla de siempre — las medidas las da
el usuario — no se ablanda porque el dato esté escrito acá.

## Cómo se usa

La sección 1 (**herramientas**) se lee **antes** de diseñar: si no tenés la
mecha, no tiene sentido proponer el herraje que la necesita.

Las secciones 2 y 3 se usan **después**, al escribir `docs/designs/<id>.md`.
Se contrasta la lista de herrajes y herramientas del diseño contra lo que hay
acá, y sale en tres montones:

- **lo tenés** → nota, no cambia nada;
- **falta** → va a la lista de compras del diseño;
- **tenés algo parecido pero no igual** → propuesta explícita, con la
  diferencia dicha en voz alta. La decisión es tuya, nunca un reemplazo
  silencioso.

El resultado de ese contraste va en el doc del diseño, no acá: es un dato con
fecha, lo comprás y deja de ser cierto. **Este archivo dice qué existe; el doc
del diseño dice qué faltó para esa pieza.**

## 1. Herramientas

Lo que hay en casa, y lo que sabés que no hay. Lo que falta importa tanto como
lo que está: es lo que evita que te propongan un herraje imposible. Anotá la
capacidad cuando cambie una decisión — el diámetro de las mechas, si el
taladro tiene percutor, si la lijadora es orbital.

_(vacío — se llena a medida que aparezca)_

### No tengo

_(vacío)_

## 2. Vocabulario

Cómo le decís vos, cómo le dice el carpintero y qué nombre lleva en el código.
Sirve para que la lista de corte llegue al taller con las palabras que se usan
acá, y para que la copy en pantalla no suene traducida.

| Cómo le digo | Cómo le dice el carpintero | En el código | Nota |
| --- | --- | --- | --- |
| Frentín | — | `apron` (fixture `existing-top`) | El borde grueso que baja del frente de la mesada de mármol. |
| Taco (del marco) | — | — | El pie del marco de la puerta, más ancho y más profundo que el marco. |
| Manija | Tirador | `handles`, rol `door-handles` | «Tirador» no le resultó conocido al usuario (2026-09-13); en la copy, «manija». |

Anotá también la palabra que **no** funcionó: si dijiste una cosa y en la
carpintería te miraron raro, esa es la línea que más vale.

## 3. Plaza uruguaya

Qué se consigue, en qué medidas y dónde. Es lo que ningún modelo sabe y no
puede adivinar: espesores reales de placa, largos de tabla estándar, marcas de
herrajes que existen acá, mínimos de venta.

### Placas y maderas

_(vacío)_

### Herrajes

- **Patas para muebles, Sodimac Uruguay** (web, 2026-09-13). Marca Fixser, se venden por unidad.
  - Regulables de 150–175 mm: ABS negra o blanca a $149, aluminio a $179.
  - Fijas de 150 mm: ABS de $99 a $149, aluminio Curve a $349.
  - Hay además fijas de 100, 120 y 200 mm.
  - La web no muestra stock, carga máxima, forma de fijación ni largo de tornillo. Hay que verlo en el local.
- **Cuñas plásticas, Sodimac Uruguay** (web, 2026-09-13).
  - La única cuña con punta es «Cuñas para nivelación 100 unidades» (Cortag, $299), pensada para nivelar cerámica. La web no dice qué grosor alcanza.
  - No venden calzas planas en U para patas. Lo más parecido son espaciadores de juntas de 1 a 10 mm, en cruz o en T.
  - En MercadoLibre aparece una cuña niveladora de pisos de 9 × 1,6 cm (100 unidades), sin verificar.

### Proveedores

- **Sodimac Uruguay** (sodimac.com.uy): categoría «Patas para muebles», con 68 productos en la web (2026-09-13).
