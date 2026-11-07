# Catálogo de elementos: alcance y procedencia

Revisión: 7 de noviembre de 2026. Condiciones expositivas: 298,15 K y 101 325 Pa.

- **Propiedades numéricas**: [PubChem, Periodic Table](https://pubchem.ncbi.nlm.nih.gov/periodic-table/), [JSON oficial](https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON). Masa en u, temperaturas originales en K, densidad en g/cm³. La ficha enlaza cada elemento.
- **Aspecto**: [Royal Society of Chemistry](https://periodic-table.rsc.org/). Se recuperaron las 118 páginas y se extrajo su sección Appearance para el contraste. Las descripciones de la interfaz son propias y los materiales son interpretaciones procedurales. No se distribuyen los textos originales ni fotografías.
- **Renderizado**: [Three.js WebGPURenderer](https://threejs.org/docs/pages/WebGPURenderer.html) r187: WebGPU con fallback WebGL 2; materiales físicos, entorno generado localmente y densidad ilustrativa de gases con TSL. No se cargan recursos remotos durante la visita.

## Evidencia y límites

«Apariencia documentada» describe el conocimiento del material, no una digitalización exacta de una muestra. Tamaño, escala, fragmentación y cristales son aproximaciones geométricas.

Berkelio y californio se marcan como aproximaciones por sus cantidades pequeñas. Astato, francio y los elementos 99–118 llevan un marcador conceptual, no un espécimen inventado. No se presentan como observaciones las predicciones de fase o apariencia: por ejemplo, PubChem enumera una fase esperada de oganesón y la descripción resumida de RSC lo clasifica como metal. La aplicación conserva su estado macroscópico como no establecido y oculta densidad, fusión y ebullición de estos casos.

La selección de alótropos se indica en los datos: grafito, boro β-romboédrico, silicio cristalino, fósforo rojo, azufre α, arsénico gris, selenio gris, estaño β, entre otros. Oro y cobre se muestran sin óxido; bismuto sin pátina iridiscente.

Los gases incoloros son invisibles en condiciones normales: su volumen se localiza con una opacidad ilustrativa exagerada, sin partículas, emisión ni plasma. Flúor y cloro reciben el color del gas. Para la densidad gaseosa se calcula M/(RT), con R = 0,082057 L·atm/(mol·K), incluyendo moléculas diatómicas H₂, N₂, O₂, F₂ y Cl₂. No se confunde masa atómica con masa molecular.

Las densidades publicadas de sólidos y líquidos no se corrigen a 25 °C y conservan las condiciones de su fuente. La interfaz lo señala. Las temperaturas de referencia pueden depender del alótropo; carbono y arsénico no se presentan con una fase líquida estable a 1 atm. Las masas de PubChem son valores de referencia, no siempre pesos atómicos estándar de IUPAC.

## Actualización del catálogo

Con Python 3, curl y acceso de red:

```sh
python scripts/research-elements.py
python scripts/build-element-data.py
pnpm test
```

Los snapshots de consulta quedan en `/tmp/fisica-periodic.json` y `/tmp/fisica-rsc-audit.json`. Los scripts no deben sustituir la revisión científica: tras regenerar, revisar cambios de unidades, estados, alótropos y evidencia antes de hacer commit. Los colores CPK del catálogo no se utilizan como colores del material.
