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

## Lo que cambió en el motor para esta pieza

Es la primera pieza exenta del proyecto, así que hubo que tocar dos cosas
menores, sin efecto sobre los muebles ya cargados:

- `opening.label`: el hueco pasa a poder nombrarse. Un mueble empotrado sigue
  diciendo "Hueco"; esta mesita dice "Tablero", que es lo que esa medida es.
  Sin paredes: `walls: { left: false, right: false, back: false }`.
- El módulo `board` ahora espeja el `explode` que se le escribe, igual que
  espeja la posición. Sin eso, el despiece de una pieza espejada se separaba
  para un solo lado.

Las cuatro patas se colocan una por una en vez de con `mirrored`, porque el
sufijo automático de lado es masculino ("izquierdo") y "pata" es femenino.
