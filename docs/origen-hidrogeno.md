# Origen del hidrógeno

Presentación en `/origen/hidrogeno`, enlazada únicamente desde el hidrógeno en
el museo. El regreso usa `/tabla-periodica?elemento=H` para reabrir su ficha.

## Fuente y alcance

Guion original basado en Enrique Nácher González y Sergio Pastor Carpi,
*La formación de los elementos químicos: la física del origen de la materia*
(CSIC / Los Libros de la Catarata, 2025), capítulo 3, «Creación primordial de
los elementos», páginas 51–66 del PDF aportado por el autor del proyecto.
Se leyó el capítulo completo y se inspeccionó la figura 16, cuyas ecuaciones
están integradas como imagen en el PDF.

- «Breve historia del universo»: expansión, enfriamiento, confinamiento de quarks
  y recombinación; figura 14 como referencia temporal.
- «La primera nucleosíntesis» y figura 16: captura de neutrinos y positrones,
  desintegración beta, congelación aproximada de las conversiones, deuterio y
  fotodesintegración, balance final de hidrógeno y helio.
- [CERN](https://home.cern/science/physics/heavy-ions-and-quark-gluon-plasma/):
  contraste del plasma inicial y su transición a partículas compuestas.
- [NASA](https://science.nasa.gov/mission/webb/early-universe/): contraste de
  la formación de átomos neutros hacia 380 000 años tras el Big Bang.

El PDF y su contraseña no forman parte del repositorio ni del sitio. No se
reproducen ilustraciones ni párrafos del libro.

## Decisiones científicas

Se distinguen tres conceptos: protio (¹H), cuyo núcleo es un solo protón;
deuterio (²H), cuyo núcleo tiene además un neutrón; y átomo neutro, con un
electrón ligado. No se afirma que todo el hidrógeno naciera por fusión ni que
los átomos neutros existieran a los tres minutos.

Las dos capturas débiles ilustran procesos simultáneos del equilibrio temprano;
el orden de las escenas es didáctico. Tiempos y temperaturas son órdenes de
magnitud, no instantes exactos. No se muestran inflación, bariogénesis ni una
teoría del instante cero. No se representa una explosión desde un centro.

El cuello de botella muestra primero `p + n → ²H + γ` y después
`²H + γ → p + n`. Al enfriarse el medio, el segundo proceso deja de impedir
la acumulación de deuterio. Las partículas salientes no aparecen antes del
encuentro. Las reacciones preservan carga, número bariónico y número leptónico;
las pruebas revisan esas cantidades.

El balance de 14 protones y 2 neutrones termina en 12 núcleos de ¹H y uno de
⁴He. Es un inventario final, no una reacción de cuatro cuerpos ni una simulación
cinética. Los porcentajes aproximados 75/25 corresponden a masa nuclear ordinaria
y omiten trazas isotópicas y defectos de masa. No se desarrollan las redes de
helio, litio ni berilio: el objetivo es explicar por qué queda hidrógeno.

La captura electrónica se representa como proceso neto, sin pretender modelar
el transporte radiativo o las cascadas reales de recombinación. La nube final
es una representación de probabilidad de un único electrón, sin órbitas clásicas.
La visita termina antes de formar moléculas o estrellas.

## Implementación

- `src/content/hydrogen.ts`: guion, cronología, reacciones y bibliografía.
- `src/experience/hydrogen/sequence.ts`: hitos, encuentros intermedios e
  interpolación determinista de partículas persistentes.
- `src/experience/hydrogen/renderer.ts`: Canvas 2D sin recursos externos.
- `src/experience/useMilestonePresentation.ts`: navegación y ciclo de vida GSAP,
  compartidos con la presentación de la estrella.
- `src/components/HydrogenOrigin.tsx`: composición, fuentes y controles.

Solo se dibuja durante transiciones y cambios de tamaño. Cada hito queda quieto.
Retroceder recorre los mismos fotogramas en orden inverso como recurso narrativo.
Movimiento reducido salta directamente al estado final. Sin Canvas, los textos,
descripciones visuales y controles siguen disponibles.
