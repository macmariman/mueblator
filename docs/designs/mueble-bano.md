# Decisiones · Mueble de baño

Registro del proyecto original, trasladado a Mueblator. El diseño vive en
`src/designs/mueble-bano.ts`; las medidas confirmadas de acá están fijadas por
`tests/mueble-bano.test.mjs`.

## Confirmado por el usuario

- Hueco entre paredes laterales y fondo. Frente abierto.
- Se conservan la bacha y la canilla.
- Tapa nueva apoyada y sellada alrededor. Verificar los apoyos existentes.
- Dos puertas; interior sencillo, sin paneles laterales completos ni fondo.
- Ancho real variable: alrededor de 800 mm, con sectores de 798 mm. Usar **798 mm** como ancho de referencia del hueco y ancho nominal del conjunto de melamínico.
- Tapa de **796 mm** de ancho: **2 mm de holgura total** respecto a 798 mm. Esta aclaración reemplaza la suposición anterior de 5 mm: NO volver a descontarlos.
- Profundidad de tapa: **510 mm**, según la medida indicada. No se hace ningún descuento adicional.
- Apoyo de tapa: **850 mm** sobre el piso. Tapa nueva confirmada: **fingerjoint de eucaliptus de 30 mm**. Conservando ese apoyo, la cara superior nueva queda a **880 mm**. La tapa anterior tenía 40 mm y llegaba a 890 mm.

## Materiales confirmados y propuesta de armado, editable en src/designs/mueble-bano.ts

- Melamínico **blanco mate de 18 mm confirmado** para todas las piezas del cuerpo. Tapa de **fingerjoint de eucaliptus de 30 mm confirmada**, sin tapacantos decorativos. Mantener protección de cantos y cortes según su acabado.
- Dos tiras laterales de 100 mm de fondo, desde la base hasta el travesaño superior. Se fijan a paredes.
- Base de 798 × 462 × 18 mm. Cara inferior a 100 mm sobre el piso; nominal, a presentar y ajustar.
- Estante de 798 × 350 × 18 mm. Cara inferior a 450 mm; desmontable y más corto que la base para librar soportes frontales. Confirmar interferencias con cañerías.
- Cuatro listones de apoyo de 50 mm de alto, fijados a paredes.
- Zócalo de 80 mm de alto, elevado 20 mm del piso, unido bajo la base mediante escuadras.
- Travesaño superior entre tiras laterales, 60 mm de alto.
- Puertas con juntas laterales y central de 3 mm; frente exterior 20 mm detrás del borde delantero de la tapa.
- No hay poste central. La bacha y cañería 3D son aproximadas y están excluidas de la lista de maderas.
- Corte de bacha: genérico en el modelo, por pedido del usuario. **El usuario saca un molde en cartón de la bacha actual y se lo lleva al carpintero**. Esa plantilla, no el modelo, define el recorte real.

## Antes de fabricar

1. Relevar ancho a distintas alturas y profundidades, comprobar escuadra, desplome y niveles. Confirmar interpretación de ancho nominal y ajuste en obra.
2. Mantener tapa de 796 × 510 × 30 mm. Definir terminación del fingerjoint y detalle de protección contra goteo; sellador compatible.
3. Comprobar apoyos de tapa: los listones del interior no sustituyen automáticamente los apoyos estructurales de la mesada.
4. Entregar el molde de cartón de la bacha actual. Medir ubicación real del desagüe y llaves para verificar posición y recorte del estante.
5. Se recomienda bisagra de cazoleta **recta de superposición total**, con base compatible. En este modelo cada puerta recubre 15 mm del soporte de 18 mm, dejando 3 mm de junta lateral. Elegir marca/modelo/base y número de bisagras antes de definir perforaciones.
6. Confirmar espesor de tapacantos. La lista expresa medidas TERMINADAS: el taller calcula las medidas brutas del tablero descontando los cantos que correspondan.
7. Comprobar apertura junto a marcos y paredes. Anclajes y tornillos según pared y cargas.

## Ferretería

Ninguna línea de la tabla de herrajes está confirmada todavía. Se listan como
propuestas, marcadas «a confirmar», y se editan en `src/designs/mueble-bano.ts`.

Las calcula el propio modelo:

- **Bisagras de cazoleta**: 4 en total, dos por hoja, por la altura de las
  puertas. El tipo recomendado (recta, de superposición total) ya está
  documentado más arriba; falta elegir marca, modelo y base.
- **Tiradores**: 2, uno por hoja. Modelo y entrecentros sin definir.
- **Taco de pared y tornillo**: 12 de cada uno, a razón de uno cada 400 mm y
  mínimo dos por pieza, sobre las 6 piezas que se fijan a pared (cuatro listones
  de apoyo y dos soportes de bisagras).

Escritas a mano en el archivo del diseño:

- **2 escuadras metálicas** para colgar el zócalo de la base, según la decisión
  ya registrada de que el zócalo no apoya en el piso.
- **12 tornillos de ensamble de 4 × 40 mm** para el travesaño superior contra los
  soportes laterales y para las escuadras del zócalo. Cantidad estimada.
- **1 cartucho de silicona sanitaria** para el encuentro de la bacha con la tapa
  y el fondo de la tapa contra la pared.

Pendiente para cerrar la lista:

1. **De qué es la pared.** Ladrillo hueco, ladrillo macizo, hormigón y placa de
   yeso llevan tacos distintos, y el baño agrega humedad. Sin esa respuesta el
   taco no se puede elegir, y de él dependen el largo y el diámetro del tornillo.
2. Marca, modelo y base de bisagra, y si llevan freno.
3. Modelo de tirador y entrecentros.
4. Qué se consigue en Uruguay de cada cosa: el campo `sourcing` de cada línea
   queda para anotar marca y casa cuando lo vayamos viendo.

## Impresión

Se captura una vista completa, con puertas cerradas, artefactos y cotas generales, sin paredes ni separación de piezas, independientemente de la vista en pantalla. Debajo se agrupan piezas iguales con sus referencias y cantidades. Luego se incluye la lista de herrajes pendientes: a pedido del usuario, la web ya no muestra el orden de montaje ni las notas por pieza. La cámara vuelve a su estado anterior después de capturar.

## Tapacantos indicados por el usuario

Se registra cada canto por separado con la convención **L1/L2/A1/A2**: los L corresponden a la dimensión largo de la tabla; los A, a la dimensión ancho. Esta nomenclatura se documenta, por ejemplo, en la guía de producción de muebles de melamina de CITE madera: https://cdn.www.gob.pe/uploads/document/file/571560/2._Dise%C3%B1o_y_Desarrollo_de_Muebes_con_melamina.pdf . La orientación física de cada borde se explicita para evitar ambigüedades entre talleres.

- Puertas: cuatro cantos (L1 y L2 laterales, A1 superior, A2 inferior).
- Zócalo y travesaño superior: un canto largo, inferior (L1). Es la ubicación visible propuesta para ese único canto.
- Base y estante: un canto largo delantero (L1).
- Laterales de bisagras: un canto largo delantero (L1).
- Cuatro listones de apoyo: ningún tapacanto.
- Tapa: fingerjoint de eucaliptus de 30 mm confirmado; sin tapacantos de melamínico, con terminación de madera a definir.

El tipo y espesor de tapacanto siguen pendientes. Las dimensiones actuales son terminadas, no medidas brutas de tablero. La indicación de tapacantos decorativos no cambia la necesidad ya documentada de proteger los cortes frente a humedad.

## Corrección del encuentro bacha / tapa

El recorte elíptico se deriva del perfil de la bacha ilustrativa en toda la altura atravesada por la tapa y suma una pequeña luz de montaje. Comparte centro y proporción con la bacha; queda debajo del ala exterior sin invadir su cuenco. Esta geometría ilustra el montaje y no es una plantilla de fabricación.

## Elección de bisagras

- Recta / superposición total: recomendada para este frente, porque cada puerta cubre su propio soporte lateral.
- Acodada / media superposición: para dos puertas que comparten un tabique; no corresponde a este montaje.
- Superacodada / interior: para puertas que quedan dentro de los laterales; tampoco corresponde al frente dibujado.
- El retiro de 20 mm de todo el frente respecto de la tapa es independiente de esta clasificación.

Referencia del fabricante sobre las tres aplicaciones: https://publications.blum.com/2024/catalogue/es/74/ . La elección del tipo es una recomendación de diseño; el modelo y su base exactos permanecen pendientes.

La nota sobre medir las paredes significa comprobar si la separación cambia o si hay paredes torcidas antes de presentar los tableros de 798 mm. No implica volver a descontar la holgura ni reducir el fondo indicado de 510 mm.

## Fresado del canto delantero de la tapa

El usuario solicita que el canto delantero de la tapa de fingerjoint de 30 mm sea curvo mediante fresado. Se modela un **perfil semicircular convexo de radio 15 mm**, ocupando todo el espesor. **La intención de redondear está confirmada; el perfil exacto y el radio son una propuesta pendiente de validar.**

Se mantiene la pieza terminada de 796 × 510 × 30 mm. La curva se obtiene quitando material dentro de esas dimensiones, sin agregar un listón ni aumentar el fondo. El punto delantero máximo sigue a 510 mm del borde posterior y conserva el retiro de 20 mm del frente de puertas. Los cantos laterales y posterior permanecen rectos. El recorte de bacha sigue gobernado por el molde de cartón del usuario.

El inspector la muestra por separado de los tapacantos (la tapa no lleva cinta de canto). La columna **Notas** de la tabla no la repite: el usuario hace el fresado por su cuenta.

## Acabado del melamínico

Blanco mate confirmado por el usuario para **todas** las piezas del cuerpo: puertas, laterales de bisagras, travesaño, zócalo, base, estante y listones de apoyo. Los tapacantos previstos irán a juego en blanco mate; su material y espesor siguen pendientes. El modelo representa ese acabado con una superficie blanca de alta rugosidad.
