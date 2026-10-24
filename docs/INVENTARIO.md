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

- **Taladro percutor Gladiator Brushless 13 mm 20 V** (KB, 2026-10-24; comprado
  el 2026-09-10).
  - Inalámbrico, batería de 20 V, motor brushless, **mandril de 13 mm**: toma
    vástagos gruesos, como la avellanadora de 7 mm para confirmat.
  - Tiene percusión y se puede apagar. En melamínico se perfora **sin**
    percusión: percutiendo se astilla la boca del agujero.
  - Par de sobra para el pasante de 7 mm en placa de 18 mm. El cuidado es el
    contrario, pasarse de rosca: el apriete final del confirmat, con la llave
    Allen en L.
  - Ficha, garantía y mails de la compra: `Casa/Inventario/Taladro Gladiator`
    en la KB.
- **Mecha de widia de 8 mm** (KB, 2026-10-24). Para pared de material. Es la
  única mecha anotada hasta ahora.

### No tengo

- **Mecha de 5 mm para madera, con tope.** La piden el canto del confirmat y
  los soportes del estante de 5 mm.
- **Avellanador o mecha escalonada para confirmat.** Conseguirla es el problema
  abierto: ver la sección 3.
- **Mecha de widia de 10 mm.** Está en la lista de compras de la KB, pero para
  colgar las teles, no para un mueble.
- No hay **ninguna mecha de madera** anotada, ni **mecha copa de 35 mm** para
  cazoletas. Las cazoletas las perfora el taller, así que la copa no hace falta.

## 2. Vocabulario

Cómo le decís vos, cómo le dice el carpintero y qué nombre lleva en el código.
Sirve para que la lista de corte llegue al taller con las palabras que se usan
acá, y para que la copy en pantalla no suene traducida.

| Cómo le digo | Cómo le dice el carpintero | En el código | Nota |
| --- | --- | --- | --- |
| Frentín | — | `apron` (fixture `existing-top`) | El borde grueso que baja del frente de la mesada de mármol. |
| Taco (del marco) | — | — | El pie del marco de la puerta, más ancho y más profundo que el marco. |
| Tornillo para mueble · tornillo estructural | Confirmat | `Tornillo para mueble (confirmat)` en la ferretería del diseño | En Uruguay no se vende con el nombre «confirmat» (2026-09-13). |
| — | Avellanado | `holeSize` en `drilling.ts` | La boca del agujero rebajada en cono para que la cabeza quede al ras. No le resultó conocida al usuario (2026-09-13): se explica en la sección de perforaciones. |
| — | Pasante | `depth: null` | Agujero que atraviesa la pieza. |
| Mecha paleta | Mecha paleta, mecha chata | — | **No** es la avellanadora (2026-10-24). Es una pala plana con punta de centrado, para agujeros grandes y pasantes en madera: en Sodimac van de 8 mm para arriba y miden 152 mm de largo. No hace el cono del avellanado ni tiene guía de 5 mm. |
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
- **Tornillo confirmat 7 × 50** (páginas cargadas, 2026-10-24). Acá no se vende con el nombre «confirmat»: se pide como «tornillo para mueble» o «tornillo estructural».
  - **Sodimac**: «Tornillo para mueble 7 x 50 mm x 20 unidades», Fixser, código **1981706**, **$219** las 20 unidades. `https://www.sodimac.com.uy/sodimac-uy/product/1981706/tornillo-para-mueble-7-x-50-mm-x-20-unidades/1981706/` La categoría de la propia página es «Tornillos allen», así que la **cabeza Allen** queda confirmada por la web, no sólo por el usuario. Las especificaciones sólo dicen acero, maderas, 7 × 50 mm, origen Uruguay: no dan el paso de rosca.
  - **Barraca Paraná**: «TORNILLOS ESTRUCTURAL NEGRO 7 x 50», código **TEST750**, **US$ 9,02** las 100 unidades. `https://www.barracaparana.com/producto/tornillo-estructural-7-x-50-bolsa-100-unid/` El dominio es `.com`; `barracaparana.com.uy` redirige ahí. Las 100 unidades salen del listado y de la URL, no del cuerpo de la página, y la cabeza no está dicha. Tienen también el 5 × 50 negro por 100.
  - **Montecuir** (Häfele): sigue habiendo **sólo 7 × 70**, referencia **264.43.211**, US$ 12 el ciento. `https://www.montecuir.com/catalogo/tornillo-estructural-7x70-264-43-211-ciento_1162700054_1162700054` Buscar «confirmat» o «7x50» en su catálogo no devuelve nada. El dominio es `.com`; `montecuir.com.uy` no resuelve. También tienen minifix y Rafix, y un puntero hexagonal SW4 (006.37.651, US$ 5) en la misma categoría, lo que sugiere que su estructural es Allen — pero la página no lo dice.
  - **MercadoLibre Uruguay: no se pudo revisar** (2026-10-24). Pide iniciar sesión: 403 a la lectura directa y pantalla de verificación de cuenta en el navegador. Los buscadores muestran «Tornillo Estructural Para Muebles 7mm X 50mm X 100 Unidades» a unos $319, **sin verificar y sin link al artículo**. Buscar «confirmat» ahí no devuelve nada uruguayo: el término es argentino. Para revisar a mano, con sesión abierta: `https://listado.mercadolibre.com.uy/tornillo-estructural-para-muebles`
  - Ninguna página muestra stock. Para los 28 del plano alcanza con 2 paquetes de Sodimac ($438).
- **Mecha para confirmat (5/7 mm con avellanado): no se consigue acá** (segunda búsqueda, 2026-10-24).
  - No aparece en Sodimac Uruguay, Uruimporta, Lockvak, Montecuir, Pablo Montans ni La Casa del Carpintero. Buscar «confirmat» en Lockvak y en Montecuir devuelve cero resultados.
  - En MercadoLibre Argentina sí figura (Einhell «Mecha con avellanador HSS p/Confirmat de 7mm»). **MercadoLibre Uruguay sigue sin revisar**, por el muro de sesión: es el único lugar donde podría aparecer y la pregunta queda abierta.
  - Lo que hay acá son avellanadores para tornillo común, con guía de 3 mm, que no sirven para confirmat. El kit Toyoki de 7 mechas tiene rebaje cilíndrico, no cónico.
  - La «mecha cónica 4-20 mm» es para chapa: es otra herramienta.
  - El «Set 7 Mechas Avellanadoras 3mm - 10mm P/ Madera Y Pvc» a $376 (captura del usuario, 2026-09-13) es de MercadoLibre y **no se pudo verificar**: sin link al artículo, y el mismo título aparece entre $365 y $890 según el vendedor, así que $376 no es un precio para confiar. Mecha de 3 a 10 mm con cono corredizo: la de 7 mm hace el pasante y el cono en una pasada, el canto se perfora aparte con 5 mm, y hacen falta unos 65 mm de mecha libre.
  - **Lockvak** tiene un kit parecido con página real: «Kit 7 Mechas Avellanadoras Cilíndricas Para Madera TOYOKI», SKU **4560**, **$450**, **1 unidad** en stock (2026-10-24). `https://lockvak.com.uy/producto/kit-7-mechas-avellanadoras-cilindricas-para-madera-toyoki/` Trae 3, 4, 5, 6, 7, 8 y 10 mm, o sea el par 5 y 7 que pide el confirmat, pero el rebaje es un avellanado de 14 mm para tornillo de cabeza plana y son dos mechas separadas, no una escalonada. Es un apaño, no un equivalente.
  - El «Set de 3 mechas fresadoras 8, 10 y 12» de Sodimac (Bauker, $329, código 9155082) **no sirve**: son fresas de router, no mechas de taladro — sin guía de 5 mm y sin resalto. Corrige lo anotado el 2026-09-13, que las daba por buenas para hacer el cono. `https://www.sodimac.com.uy/sodimac-uy/product/9155082/set-de-3-mechas-fresadoras-8-10-y-12/9155082/`
  - Sin revisar, por si hace falta seguir: **DIT Ferretería** (ditferreteria.com.uy, distribuidor INGCO, Acevedo Díaz 1751) bloqueó la lectura y vale una llamada; el surtido de mechas de Barraca Paraná quedó sin ver; y el «Set Juego Mechas Con Avellanador Fresadora X 7» de Milok a $290 dio 404.
- **Cuñas plásticas, Sodimac Uruguay** (web, 2026-09-13).
  - La única cuña con punta es «Cuñas para nivelación 100 unidades» (Cortag, $299), pensada para nivelar cerámica. La web no dice qué grosor alcanza.
  - No venden calzas planas en U para patas. Lo más parecido son espaciadores de juntas de 1 a 10 mm, en cruz o en T.
  - En MercadoLibre aparece una cuña niveladora de pisos de 9 × 1,6 cm (100 unidades), sin verificar.

### Proveedores

- **Sodimac Uruguay** (sodimac.com.uy): categoría «Patas para muebles», con 68 productos en la web (2026-09-13).
