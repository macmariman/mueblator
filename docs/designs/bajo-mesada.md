# Decisiones · Bajo mesada de mármol

Mueble para el hueco bajo la mesada de mármol del baño, donde hoy hay cajas y
el tacho de basura. El diseño vive en `src/designs/bajo-mesada.ts`; este
archivo es el registro del proyecto y el spec es sólo su estado actual.

## Confirmado por el usuario

- **Se conserva la mesada de mármol** con la bacha de apoyo. El mueble va
  debajo y no carga la mesada. En el modelo se dibuja como artefacto
  (`existing-top`), fuera de la lista de corte.
- Hueco entre la **pared izquierda** (donde está el marco de la puerta del
  baño), la **columna derecha** (del lado de la ducha) y la **pared del
  fondo**, revestida de azulejo.
- **Ancho A (sin contar el taco): 1260 mm adelante, arriba, a la altura del
  frentín, y 1265 mm atrás, abajo.** Según el usuario, a distintas alturas la
  medida se mantiene. El hueco se abre 5 mm hacia el fondo, así que manda la
  medida de adelante.
- **Fondo (E), desde el azulejo del fondo: 340 mm hasta la cara de afuera del
  frentín y 320 mm hasta la cara de adentro.** De ahí sale que el frentín
  tiene 20 mm de espesor.
- **Del piso a la cara inferior de la losa de mármol (C2): 755 mm.**
- **Del piso a la cara inferior del frentín (C): 690 mm.** De ahí sale que el
  frentín baja 65 mm por debajo de la losa.
- **Marco de la puerta (izquierda):** está alineado con el frente del mármol y
  sobresale **45 mm** por delante de la cara de afuera del frentín. Adentro del
  hueco no quita ancho, pero **por delante del mármol se mete unos 10 mm**
  hacia el hueco (foto desde adentro, 2026-09-13). Antes estaba anotado, por
  error, que quedaba al ras.
- **Taco del marco** (al pie, contra el piso): **110 mm de alto**, entra
  **30 mm hacia el fondo** desde el plano del frente y le quita **20 mm de
  ancho** al hueco, contra la pared izquierda. Según el usuario, se podría
  cortar. Con el mueble a 150 mm del piso no hace falta.
- **Columna derecha:** sobresale **30 mm** por delante de la cara de afuera del
  frentín.
- **Sifón:** eje a **630 mm de la pared izquierda (F1)**, justo en el centro
  del hueco, y a **230 mm de la pared del fondo (F2)**. Su punto más bajo está
  a **550 mm del piso (F)** y su parte más adelantada a **240 mm de la pared
  del fondo**.
- **El mueble ocupa todo el ancho del hueco.** El tacho va afuera del hueco
  (2026-09-12).
- **Elevado para que pase la aspiradora robot**, que mide **120 mm**. **Cara
  inferior del mueble a 150 mm del piso** (2026-09-12).
- **Sin fondo:** el fondo del mueble es la pared de azulejo (2026-09-12).
- **Distribución:** **nichos abiertos de 280 mm de luz libre a cada lado**, con
  un estante al medio, y **dos puertas de abrir en el centro** (2026-09-12).
  Primero fueron 300 mm; el usuario los achicó y pidió medidas más redondas
  para las puertas.
- **Diámetro del sifón: unos 100 mm** (aproximado, 2026-09-12).
- **Manijas de barra, negras**, una por puerta (2026-09-13). Falta el modelo,
  el largo y la distancia entre agujeros.
- **Paredes del hueco revestidas de cerámica** (2026-09-13). No se sabe qué hay
  debajo.
- **Sin tornillos a la pared** (2026-09-13). Se arma afuera, se entra derecho
  de frente, se nivela con las patas y se calza arriba con cuñas contra la
  cerámica. Si queda flojo, silicona en dos puntos por lateral, que se saca con
  un cúter. No vuelca porque es bajo y ancho, y porque al inclinarse pega en
  el mármol. El riesgo que queda es que alguien se cuelgue de una puerta
  abierta.
- **Cómo entra:** derecho, de frente. Entre el marco y la columna quedan unos
  1250 mm, y la caja de 1240 mm pasa con unos 10 mm, arrimada a la columna. Al
  entrar, la cara inferior tiene que ir entre 110 mm (taco del marco) y 160 mm
  (frentín a 690 menos los 530 de la caja). A 150 mm pasa con 40 mm sobre el
  taco y 10 mm bajo el frentín.
- **Bacha de apoyo: 610 mm de largo, 380 mm de fondo y 120 mm de alto**
  (2026-09-12). Tiene más fondo que el mármol, así que sobresale. Se dibuja
  contra la pared de atrás, sobre el sifón; ninguna medida del mueble depende
  de ella.
- **Sobre patas**, para simplificar el armado (2026-09-12). Se dibujan en el
  modelo sólo para verlo parado; son herrajes y no entran en la lista de corte.
- **Las puertas vienen perforadas del taller** (2026-09-12). El usuario podría
  conseguir la mecha copa de 35 mm, pero prefiere que perfore el taller. La
  mecha sale de la lista de herramientas.
- **Melamínico blanco mate de 18 mm** (2026-09-12).

## Propuesto, editable en src/designs/bajo-mesada.ts

Nada de lo que sigue está confirmado. Son los números de la primera versión,
derivados de las medidas de arriba.

- **Holguras:** 10 mm por lado contra las paredes (caja de 1240 mm), para que
  pase por el marco de la puerta. Con 5 mm, la caja medía 1250 mm y no pasaba
  por los 1250 mm que deja el marco. 10 mm
  contra el azulejo del fondo y 10 mm bajo el frentín. La caja llega a 680 mm
  del piso para poder entrar por debajo del frentín.
- **Caja:** dos laterales de 530 mm de alto, piso de 1204 mm entre ellos, dos
  divisores que también llegan arriba, y un travesaño delantero **parado** de
  60 mm entre los divisores, detrás de las puertas. No hay tapa: la tapa es el
  mármol. Cada nicho lleva un travesaño trasero de 80 mm arriba. En el centro
  no hay travesaño trasero arriba porque pasa el caño del sifón. Sí lleva uno
  **abajo**, de 608 × 80 mm, parado sobre el piso de la caja entre los
  divisores, a 302 mm por debajo del sifón (confirmado el 2026-09-13). Es lo
  que mantiene a escuadra el centro al trasladar el mueble, porque ahí el
  estante va suelto.
- **El sifón deja de condicionar el diseño** (2026-09-12, a pedido del
  usuario). Antes el travesaño iba acostado, de 262 a 322 mm desde la pared,
  y dependía de dónde estuviera el frente del sifón. Parado ocupa de 304 a
  322 mm: el sifón puede llegar hasta 304 mm sin tocarlo. Sólo importa su
  punto más bajo (550 mm), que define la altura del estante central.
- **Fondo de la caja:** 312 mm (de 10 a 322 mm desde la pared). Las puertas van
  delante, al ras de la cara de afuera del frentín.
- **Nichos:** abiertos hasta el mármol, con un estante fijo a media altura
  (cara inferior a 415 mm). Van
  atornillados porque, sin fondo, son los que mantienen la caja a escuadra.
- **Centro:** 608 mm de luz libre. Estante suelto sobre cuatro soportes,
  **alineado con los estantes de nicho** (confirmado el 2026-09-12): cara
  superior a 433 mm, 117 mm por debajo del sifón. La primera versión lo ponía a
  540 mm, con 10 mm de luz: demasiado justo para sacarlo. Debajo quedan 247 mm
  libres. Arriba queda espacio alrededor del sifón, tapado por las puertas.
- **Alturas útiles de los nichos:** 247 mm debajo del estante. Arriba, 257 mm
  hasta el borde de abajo del frentín, que es lo que entra derecho, y 322 mm
  hasta la cara de abajo del mármol, detrás del frentín.
- **Puertas:** dos de **530 × 320 mm**, de 150 a 680 mm del piso, tapando el
  canto del piso y del travesaño, con junta central de 2 mm. El ancho de 320 mm
  se eligió redondo (antes 325, hasta que la caja se achicó para pasar el
  marco); de ahí sale que cada una recubre 17 mm del divisor. Abren
  hacia su nicho, lejos del marco y de la columna, así que **no hacen falta
  rellenos**.
- **Patas:** seis regulables, cuatro en las esquinas y dos al centro,
  retiradas unos 50 mm del frente y de los costados. Las del lado izquierdo
  pasan al lado del taco del marco, que sólo entra 20 mm. Cuatro cuñas, dos
  por lateral, en la luz de 10 mm.
- **Tapacantos:** canto delantero en laterales, piso, divisores, travesaño
  delantero y estantes; los cuatro cantos en las puertas; el inferior en los
  travesaños traseros. Espesor pendiente.

### Alternativas que quedaron atrás

- **Puertas de abrir a todo el ancho:** hacían falta rellenos de unos 25–30 mm
  por lado para que no chocaran con el marco y la columna. Los nichos
  abiertos lo resuelven.
- **Puertas corredizas:** no necesitaban rellenos y el frentín tapaba el riel,
  pero se comían unos 40–50 mm de fondo y abrían la mitad por vez.
- **Colgado de las paredes, sin patas:** el usuario prefirió patas para
  simplificar el armado.

## Antes de fabricar

1. Espesor del tapacanto: la lista expresa medidas terminadas.
1. **Tornillos:** propuesta de confirmat de 7 × 50 mm en vez de tornillos
   comunes de 4 × 50 (2026-09-13), porque en el canto del melamínico agarran
   mucho más. El usuario averigua si el taller entrega las piezas perforadas
   para confirmat. Si no, hace falta una mecha escalonada para confirmat, o
   volver al 4 × 50 con pretaladro.
2. Placa hidrófuga en blanco: preguntar en la barraca. El lado derecho linda
   con la ducha.
3. Manijas de barra negras: modelo, largo y distancia entre agujeros. Si el
   taller perfora las puertas, necesita ese dato.
4. Bisagra: como las puertas vienen perforadas del taller, pedirles también
   las bisagras con las que perforan, para 17 mm de recubrimiento sobre el
   divisor de 18 mm.
5. ~~Taco de pared~~: ya no hace falta, el mueble no se atornilla.
6. **Pendiente del piso:** el usuario la mide el 2026-09-14. Define si van
   patas fijas de 150 mm, con un suplemento si hace falta, o regulables. Las
   regulables obligan a bajar la caja si la pendiente pasa de 10 mm, porque
   bajo el frentín sólo hay 10 mm de luz.
7. Sifón: con 100 mm de diámetro, el eje a 230 mm y el frente a 240 mm no
   pueden ser ciertos a la vez. No hace falta volver a medir: con el travesaño
   parado, cualquiera de las dos lecturas deja el sifón a menos de 304 mm de la
   pared. El dibujo usa el frente a 240 mm.

## Patas: lo que hay en Sodimac Uruguay (web, 2026-09-13)

Todavía no hay nada elegido. Las que dan justo 150 mm y además regulan:

| Producto | Precio c/u | Altura | Material |
| --- | --- | --- | --- |
| Pata ABS regulable 150-175 mm negra | $149 | 150–175 | ABS negro |
| Pata para muebles regulable ABS blanca 150-175 mm | $149 | 150–175 | ABS blanco |
| Pata para muebles regulable aluminio 150-175 mm | $179 | 150–175 | Aluminio gris; la rosca podría ser de acero |

Fija, de metal y a 150 mm, sólo está la Pata Curve de aluminio anodizado a
$349, pero no permite nivelar. La web no muestra stock, carga máxima, forma de
fijación ni largo de tornillo, y el tornillo tiene que ser de menos de 18 mm.

**Condicionante:** las regulables arrancan en 150 mm y sólo suben. Para
nivelar un piso con pendiente, el mueble queda por encima de 150 mm en algún
punto, y bajo el frentín sólo hay 10 mm de margen. Si el piso baja más de
10 mm a lo ancho, la caja no entra. Hay dos salidas: medir la pendiente, o
bajar la caja (por ejemplo, a 520 mm de alto).

## Planos de perforación (2026-09-13)

El manual trae un plano por pieza, derivado del modelo. Todo es propuesta.

- **Confirmat:** 28, en las uniones de canto contra cara. En Uruguay se venden
  como «tornillo para mueble 7 × 50» (Sodimac, 20 unidades a $219) o
  «tornillo estructural». La mecha escalonada no apareció en ninguna tienda
  uruguaya que se pudo revisar (2026-09-13): lo más simple es que perfore el
  taller. Quién perfora está
  **por definir**: el usuario lo averigua en el taller. El manual dice «si no
  vienen perforadas» y deja la mecha escalonada en la lista de herramientas.
- **Cazoletas:** 4, dos por puerta. Las perfora el **taller**, como ya estaba
  decidido.
- **Bases de bisagra** (8 guías de 3 mm) y **soportes del estante central**
  (4 de 5 mm): en los divisores, **en casa**, antes de armar la caja.
- **Manijas:** sin plano, falta la distancia entre agujeros.
- Como los estantes están alineados, en la cara de cada divisor que da al
  centro los soportes del estante central quedan 15 mm por debajo de los
  confirmat del estante de nicho. Entran igual, pero es un lugar apretado si
  se cambia una altura.

## Ferretería y herramientas

Todo está como propuesta, marcado «a confirmar», en el archivo del diseño.

- **Herrajes:** 6 patas regulables, 4 soportes de estante, 4 bisagras de
  cazoleta (dos por hoja, por la altura) y 2 tiradores.
- **Ensamble:** unos 30 tornillos confirmat de 7 × 50 mm (propuesta, ver
  «Antes de fabricar») y 4 cuñas de ajuste.
- **Herramientas propias de esta pieza:** sólo la mecha de 5 mm con tope para
  los soportes. No hacen falta percutor, mecha para cerámica ni detector,
  porque no se perfora la pared. Tampoco la mecha copa de 35 mm, porque el
  taller perfora las puertas.

**Contraste con `docs/INVENTARIO.md` (2026-09-12):** la sección de
herramientas del inventario está vacía. El usuario dice que puede conseguir el
percutor y la mecha copa, pero no que los tenga. Falta saber qué hay en casa
para separar lo que hay de lo que hay que comprar.
