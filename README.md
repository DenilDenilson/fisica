# Fisica

**La historia del universo, contada con animaciones.**

Fisica es un proyecto personal de aprendizaje y divulgación visual: una síntesis en constante evolución de la historia del universo, desde sus orígenes hasta la actualidad. Nace de estudiar libros, investigar y convertir lo aprendido en explicaciones animadas.

## La experiencia

Una presentación web **inmersiva y a pantalla completa**, organizada cronológicamente. Cada idea puede desarrollarse en varias escenas conectadas por transiciones que ayudan a comprender cómo ocurren los fenómenos.

La navegación avanza **por clic, toque o teclado**: la animación se reproduce hasta llegar a un hito importante y se detiene para permitir observar y comprender antes de continuar.

El recorrido abarca tanto los acontecimientos de la naturaleza como la historia de los descubrimientos con los que aprendimos a explicarlos.

## Tecnologías previstas

- **Astro + React + TypeScript** — aplicación y escenas interactivas.
- **Tailwind CSS + CSS** — diseño y estilos.
- **GSAP** — secuencias y transiciones.
- **SVG / Canvas / Three.js** — visualizaciones 2D y 3D según cada necesidad.
- **pnpm, GitHub y Vercel** — desarrollo, versionamiento y despliegue.

## Estado

Proyecto en construcción. El primer objetivo es crear una experiencia animada breve que establezca el lenguaje visual y la navegación.

- **Sitio previsto:** [fisica.denil.org](https://fisica.denil.org)
- **Referencia original:** [Historia general — Figma Slides](https://www.figma.com/slides/NQhl5smol5cMk99iJ71E0a/Historia-general)
- **Guía para agentes de código:** [AGENTS.md](./AGENTS.md)

> La animación no es un adorno: es la herramienta para explicar el conocimiento.

## Primera experiencia: nacimiento de una estrella

Demostración de cinco hitos: nube molecular, contracción gravitatoria, protoestrella,
fusión de hidrógeno y equilibrio hidrostático. Las mismas partículas de Canvas 2D
se transforman mediante GSAP; cada transición termina en una escena quieta.

### Desarrollo local

Requisitos: Node.js 22.12 o posterior y pnpm 11.25.0 (versión fijada en package.json).

```sh
pnpm install
pnpm dev
```

Abre http://localhost:4321. Para verificar y generar la versión estática:

```sh
pnpm check
pnpm test
pnpm build
pnpm preview
```

### Navegación

- Clic o toque en el espacio: siguiente hito.
- Flecha derecha, abajo o espacio: siguiente; izquierda o arriba: anterior.
- Los controles aparecen al mover el puntero o enfocarlos con Tab.
- Los clics durante una transición se ignoran para evitar saltos.
- Con movimiento reducido, los estados cambian sin interpolación.
- «Fuentes y notas» reúne bibliografía y simplificaciones didácticas.

### Organización

- `src/content/star.ts`: textos y referencias científicas.
- `src/experience/sequence.ts`: estados visuales y límites de navegación.
- `src/experience/renderer.ts`: nube, partículas, núcleo y fuerzas en Canvas.
- `src/experience/usePresentation.ts`: transiciones GSAP y ciclo de vida.
- `src/components/Presentation.tsx`: composición, navegación y accesibilidad.

Se usa una visualización esquemática, sin escala, de una estrella de masa solar.
No es una simulación hidrodinámica; las notas científicas explican sus límites.
No hay backend, autenticación, base de datos, imágenes externas ni Three.js.

### Vercel

`vercel.json` configura Astro, `pnpm build` y el directorio estático `dist`.
Si el proyecto conserva ajustes del antiguo HTML, elimina sus overrides de build
en Vercel o selecciona Astro. Cada rama puede generar una Preview Deployment
cuando la integración GitHub–Vercel está habilitada.
