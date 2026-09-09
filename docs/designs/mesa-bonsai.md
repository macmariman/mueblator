# Decisiones · Mesita para bonsái

Mesita de exterior para exhibir un bonsái. El diseño vive en
`src/designs/mesa-bonsai.ts`; este archivo es el registro del proyecto y el
spec es sólo su estado actual.

## Confirmado por el usuario

- Pieza **de exterior**, en **madera**, para exhibir bonsái.
- Tablero de **600 × 400 mm**, cara superior a **750 mm** del piso.
- Tablero **de listones separados**, no macizo: el riego escurre y la base de
  la maceta seca. Es lo que corresponde a la intemperie.
- **Pino tratado** (CCA/ACQ).
- **Sin estante inferior**.

## Propuesto, editable en src/designs/mesa-bonsai.ts

Nada de lo que sigue está confirmado: son escuadrías y repartos derivados de
las cuatro medidas de arriba.

- Seis listones de tablero de **400 × 90 × 25 mm**, con **12 mm de luz** entre
  sí. La luz no es un número elegido: sale de repartir 600 mm entre seis
  listones de 90 mm. Cambiar el ancho del listón y la luz se recalcula sola.
- Cuatro patas de **725 × 45 × 45 mm**, una por esquina, por dentro del marco.
  La cabeza llega a 725 mm y recibe el listón.
- Dos largueros de **600 × 70 × 25 mm**, delantero y trasero, cara exterior al
  ras del canto del tablero.
- Dos travesaños laterales de **350 × 70 × 25 mm**, entre los dos largueros.
- Los listones apoyan sobre los dos largueros y sobre la cabeza de las patas.
  Los dos de las puntas apoyan además sobre el travesaño de su lado. La luz
  libre entre largueros es de 350 mm: sobra para 25 mm de espesor.
- Herrajes y consumibles: ver la lista de herrajes del manual. Todo `proposed`.

## Antes de fabricar

1. **Confirmar escuadrías en el corralón.** Están dibujadas patas de 45 × 45 mm
   y el resto en 25 mm de espesor. Si lo que hay es 2" × 2" cepillado a
   38 × 38, se ajustan las constantes del archivo y todo lo demás se recalcula.
2. **Dejar estacionar la madera.** El pino tratado suele salir húmedo del
   corralón. Apilado a la sombra con separadores. Armado mojado, al secar se
   abren las juntas y se aflojan los tornillos.
3. **Tornillería inoxidable o galvanizada en caliente.** El CCA/ACQ ataca el
   acero común; la mancha negra que deja termina corriendo por la madera.
4. **Repasar cortes y perforaciones con preservador.** El tratamiento no llega
   al corazón de la pieza: cada corte deja madera sin proteger.
5. **Regatón o goma bajo cada pata.** La testa inferior chupa agua por
   capilaridad y es lo primero que se pudre.
6. **Definir terminación**, lasur o aceite. Se renueva cada temporada.
7. **Estabilidad.** A 750 mm de alto sobre una base de 600 × 400 mm, con estas
   escuadrías la mesita es liviana. Si el ejemplar pasa de unos 15 kg, o el
   lugar es ventoso, conviene anclarla o pasar las patas a 45 × 70 mm.

## El árbol

El bonsái del modelo es **ilustrativo**, igual que la bacha del mueble de baño:
es un `fixture`, no es madera, no aparece en la lista de corte y ninguna medida
de la mesita depende de él. Está para mostrar para qué es la pieza y cuánto
lugar ocupa el ejemplar a esa altura.

- Maceta dibujada de 300 × 200 × 65 mm, copa de 380 mm sobre el borde de la
  maceta y 260 mm de vuelo. Números de dibujo, no de compra.
- Se dibuja con una semilla (`seed`), así que el árbol es siempre el mismo entre
  recargas. Cambiando la semilla sale otro árbol con la misma silueta.
- Se apaga con el interruptor «Bonsái» del panel.
- Aparece en la foto impresa del manual, porque el manual siempre muestra la
  pieza armada con los artefactos visibles. Lo que el carpintero fabrica son las
  14 maderas de la lista y nada más.

## Orden de armado

Escrito a mano en el archivo, reemplazando al que el motor deduce solo. El
motor ordena por tipo de módulo y, dentro de eso, de abajo hacia arriba: para
esta mesita eso da patas, marco, tablero. El orden es correcto pero la maniobra
no: una mesa de cuatro patas no se arma parando las patas sueltas, se arman dos
laterales en el piso y recién ahí se levantan.

Los cinco pasos declarados (`assembly` en el archivo) son:

1. Antes de empezar — contar y medir las 14 piezas, estacionar el pino si vino
   húmedo, y pintar el preservador en cada corte a medida que se hace.
2. Armar los dos laterales en el piso — P01/P02 con L01, P03/P04 con L02.
3. Pararlos y cerrar el marco con C01 y C02, midiendo las dos diagonales.
4. Colocar los seis listones, repartidos con dos separadores de 12 mm.
5. Ajuste final: lija, preservador, lasur y regatones.

Nada de esto está confirmado: son cinco `'proposed'`. Es la secuencia que
proponemos, no una que alguien haya construido todavía.

Dos herramientas se declaran a mano porque no salen de ninguna medida: los dos
separadores de 12 mm (que es la luz entre listones) y el avellanador, para que
la cabeza del tornillo quede por debajo de la cara del tablero.

**Confirmado (2026-09-09):** las piezas se encargan cortadas a medida, así que
en casa no se corta nada; la lista de herramienta es sólo de armado. **Abierto:**
si el corralón las entrega además tratadas para exterior y con una mano de
terminación. De eso depende el último paso — con la madera cruda el preservador
va en las testas antes de armar, con la madera terminada sólo se retocan las
testas y los agujeros que hace el usuario — así que los dos casos están escritos
en los pasos 1 y 5 y la pregunta quedó en `pending`.

## Lo que cambió en el motor para esta pieza

Es la primera pieza exenta del proyecto, así que hubo que tocar dos cosas
menores, sin efecto sobre los muebles ya cargados:

- `opening.label`: el hueco pasa a poder nombrarse. Un mueble empotrado sigue
  diciendo "Hueco"; esta mesita dice "Tablero", que es lo que esa medida es.
  Sin paredes: `walls: { left: false, right: false, back: false }`.
- El módulo `board` ahora espeja el `explode` que se le escribe, igual que
  espeja la posición. Sin eso, el despiece de una pieza espejada se separaba
  para un solo lado.
- Nuevo `fixture` `bonsai`, con su geometría en
  `src/lib/fixtures/bonsai-geometry.ts`, al lado de la de la bacha.
- La cámara encuadra lo que se dibuja, no sólo el mueble: antes se calculaba
  sobre la altura de la pieza y le cortaba la copa al árbol. El mueble de baño
  se aleja un 1,7 % por los 15 mm que la bacha sobresale de la tapa.
- El interruptor de artefactos toma su nombre del diseño (`model.fixturesLabel`)
  en vez de decir siempre «Bacha y cañería».

Las cuatro patas se colocan una por una en vez de con `mirrored`, porque el
sufijo automático de lado es masculino ("izquierdo") y "pata" es femenino.
