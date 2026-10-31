# Fisica — Instrucciones para agentes

## Visión
Fisica es una obra personal de aprendizaje para toda la vida: una síntesis visual, científica y animada de la historia del universo, desde sus orígenes hasta la actualidad. El autor estudia libros y otras fuentes; el software transforma lo aprendido en experiencias narrativas inmersivas. Sitio previsto: `fisica.denil.org`.

## Experiencia
- **Presentación a pantalla completa**, estilo slides cinematográficas. La animación es protagonista; evitar dashboards, paneles permanentes y páginas convencionales.
- **Cronología como recorrido principal**: acontecimientos naturales, evolución de la vida, historia humana y descubrimientos científicos. Distinguir cuándo ocurrió un fenómeno de cuándo fue comprendido.
- Una **idea puede contener múltiples escenas**. Las transiciones deben mostrar cómo sucede un fenómeno, no limitarse a cambiar imágenes.
- Navegación inicial **por hitos**: clic, toque o teclado desencadenan la siguiente animación; al llegar a un punto importante, se pausa hasta la próxima acción. Permitir retroceder. Experimentar con otros controles solo si aportan valor.
- Textos breves, integrados en la composición; diseño sobrio, inmersivo, responsive y accesible. Priorizar claridad visual sobre efectos decorativos.

## Stack propuesto
- Astro, React y TypeScript.
- Tailwind CSS 4 para interfaz y sistema de estilos; CSS nativo para efectos específicos.
- GSAP para orquestar animaciones y transiciones.
- SVG o Canvas 2D para visualizaciones 2D; Three.js **solo cuando el 3D aporte valor**.
- `pnpm` como gestor de paquetes. Repositorio en GitHub; despliegue previsto en Vercel.

## Principios de implementación
- Construir incrementalmente: primero una experiencia breve y excelente, luego ampliar según lo aprendido. No intentar implementar toda la cronología de una vez.
- Separar **contenido científico, secuencias/hitos y renderizado** para facilitar correcciones y sustituir animaciones en el futuro.
- Crear escenas reutilizables y transiciones fluidas; evitar una arquitectura rígida de capítulos y abstracciones prematuras.
- Conservar fuentes bibliográficas cuando exista contenido factual. Diferenciar evidencia, hipótesis y simplificaciones didácticas; no sacrificar precisión científica por espectacularidad.
- Considerar dispositivos móviles, rendimiento y `prefers-reduced-motion`. Evitar dependencias pesadas si no son necesarias.
- Sin backend, autenticación ni base de datos inicialmente, salvo necesidad demostrada.
- Antes de cambiar código, inspeccionar el repositorio. Hacer cambios enfocados, ejecutar las verificaciones disponibles y explicar brevemente decisiones y limitaciones.

## Referencia inicial
La presentación previa «Historia general» en Figma Slides sirve como material de partida, no como plantilla visual obligatoria:
https://www.figma.com/slides/NQhl5smol5cMk99iJ71E0a/Historia-general

**Regla central:** usar la animación para explicar el conocimiento, no simplemente para decorar apuntes.
