import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { hydrogenMilestones, hydrogenReactions, hydrogenSources } from '../content/hydrogen';
import { useMilestonePresentation } from '../experience/useMilestonePresentation';
import { createHydrogenRenderer } from '../experience/hydrogen/renderer';
import { hydrogenSequence } from '../experience/hydrogen/sequence';

const config = {
  states: hydrogenSequence, renderer: createHydrogenRenderer,
  ease: 'none',
  duration: (next: number) => [2, 3, 5, 6, 7, 10].includes(next) ? 4 : 2.8,
};
const returnUrl = '/tabla-periodica?elemento=H';

export default function HydrogenOrigin() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const notes = useRef<HTMLDialogElement>(null);
  const [awake, setAwake] = useState(true);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { index, targetIndex, busy, reducedMotion, canvasUnavailable, navigate } = useMilestonePresentation(canvas, config);
  // Describe the mechanism while it happens, and announce its resting state when complete.
  const step = hydrogenMilestones[targetIndex];
  const reaction = step.reaction ? hydrogenReactions[step.reaction] : null;
  const last = index === hydrogenMilestones.length - 1 && !busy;

  function wake() {
    setAwake(true);
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
    wakeTimer.current = setTimeout(() => setAwake(false), 4200);
  }
  useEffect(() => {
    wake();
    return () => { if (wakeTimer.current) clearTimeout(wakeTimer.current); };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (notes.current?.open || event.altKey || event.ctrlKey || event.metaKey) return;
      const element = event.target as HTMLElement;
      if (element.closest('a, input, textarea, select, summary, [contenteditable="true"]')) return;
      if (element.closest('button') && [' ', 'Enter'].includes(event.key)) return;
      if (['ArrowRight', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); wake();
        if (!event.repeat) navigate(['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  function advance(event: MouseEvent<HTMLElement>) {
    if (notes.current?.open || (event.target as HTMLElement).closest('a, button, dialog, details')) return;
    // Selecting a sentence to read it should not change the scene.
    if (window.getSelection()?.toString()) return;
    wake(); navigate(1);
  }

  return <main className="origin-presentation" onClick={advance} onPointerMove={wake} onFocusCapture={wake}
    data-milestone={targetIndex} data-resting-milestone={index} data-busy={busy} data-awake={awake} data-reduced={reducedMotion}>
    <header className="origin-header">
      <a className="origin-brand" href="/" aria-label="Fisica, ir al inicio">FISICA</a>
      <span>ORIGEN DE LOS ELEMENTOS / 001</span>
      <a className="origin-return" href={returnUrl}>← <span>Volver al hidrógeno</span><span aria-hidden="true">¹H</span></a>
    </header>

    <div className="origin-epoch" aria-label="Época aproximada de la escena">
      <div><span className="origin-eyebrow">TIEMPO DESDE EL BIG BANG · APROXIMADO</span><p>{step.time}</p></div>
      <div className="origin-temperature"><span className="origin-eyebrow">TEMPERATURA DEL MEDIO</span><p>{step.temperature}</p></div>
    </div>

    <section className="origin-narrative" aria-labelledby="origin-title" aria-busy={busy}>
      <p className="origin-eyebrow origin-chapter">EL ORIGEN DEL HIDRÓGENO</p>
      <div key={targetIndex} className="copy">
        <p className="origin-step"><span>{String(targetIndex + 1).padStart(2, '0')} / {hydrogenMilestones.length}</span>{step.label}</p>
        <h1 id="origin-title">{step.title}</h1>
        <p className="origin-description">{step.description}</p>
        <p className="origin-detail">{step.detail}</p>
        <details className="origin-compact-detail"><summary>Un poco más de contexto <span aria-hidden="true">+</span></summary><p>{step.detail}</p></details>
      </div>
    </section>

    <figure className="origin-visual" aria-label="Explicación visual de la escena">
      <canvas ref={canvas} aria-hidden="true" />
      <div className="origin-legend" aria-hidden="true">
        {targetIndex < 2 ? <><span className="legend-p">u · quark arriba</span><span className="legend-n">d · quark abajo</span></> : <>
          <span className="legend-p">p · protón</span><span className="legend-n">n · neutrón</span>
          {targetIndex >= 9 && <span className="legend-e">e⁻ · electrón</span>}
        </>}
      </div>
      {canvasUnavailable && <p className="origin-canvas-fallback">{step.visualDescription}</p>}
      {reaction && <div className="origin-reaction" key={step.reaction}>
        <p aria-label={reaction.accessible}>{reaction.equation}</p><span>{reaction.note}</span>
      </div>}
      <figcaption className="origin-annotation">{step.annotation}</figcaption>
      <p className="sr-only">{step.visualDescription}</p>
    </figure>

    <div className="origin-context"><span>{step.era}</span><span>ESQUEMA · TIEMPOS Y ESCALAS NO PROPORCIONALES</span></div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {!busy && `Hito ${index + 1} de ${hydrogenMilestones.length}. ${hydrogenMilestones[index].title.replaceAll('\n', ' ')} ${hydrogenMilestones[index].visualDescription}`}
    </p>
    <p id="origin-instructions" className="sr-only">Clic o toque en el espacio, flecha derecha o espacio: avanzar. Flecha izquierda: retroceder. Cada animación se detiene hasta tu próxima acción. Puedes volver a la ficha del hidrógeno con el enlace superior.</p>

    <nav className="origin-navigation" aria-label="Navegación por hitos" aria-describedby="origin-instructions">
      <button disabled={index === 0 || busy} onClick={() => { wake(); navigate(-1); }} aria-label="Hito anterior">← <span>Anterior</span></button>
      <div className="origin-progress" role="progressbar" aria-label="Recorrido del hidrógeno" aria-valuemin={1} aria-valuemax={hydrogenMilestones.length} aria-valuenow={index + 1}>
        {hydrogenMilestones.map((item, i) => <span key={item.id} className={i <= index ? 'filled' : ''} />)}
      </div>
      {last ? <a className="origin-next" href={returnUrl}>Volver a la ficha <span aria-hidden="true">↗</span></a> : <button className="origin-next" disabled={busy} onClick={() => { wake(); navigate(1); }}>{busy ? 'Observa' : index === 0 ? 'Comenzar' : 'Continuar'} <span aria-hidden="true">→</span></button>}
      <button className="origin-sources" onClick={() => notes.current?.showModal()}>Fuentes y notas</button>
    </nav>
    <p className="origin-idle-hint" aria-hidden="true">{last ? 'UN ÁTOMO. UNA HISTORIA DE 380 000 AÑOS.' : busy ? 'OBSERVA LA TRANSFORMACIÓN' : 'CLIC, TOQUE O ESPACIO PARA CONTINUAR'}</p>

    <dialog ref={notes} className="source-dialog origin-notes" aria-labelledby="origin-notes-title" onClick={event => event.stopPropagation()}>
      <button className="close-dialog" onClick={() => notes.current?.close()} aria-label="Cerrar fuentes y notas">Cerrar ×</button>
      <p className="chapter">DETRÁS DE LA ESCENA</p><h2 id="origin-notes-title">Dos nacimientos distintos.</h2>
      <p>Un protón es ya el núcleo de ¹H. No lo crea la captura posterior de un electrón ni hace falta una fusión para obtenerlo. El deuterio, ²H, tiene además un neutrón. Un átomo neutro necesita un electrón ligado: esa etapa se alcanza mucho después de la nucleosíntesis.</p>
      <h3>Cómo leer esta representación</h3>
      <p>El Big Bang no se representa como una explosión en un espacio vacío. La cuadrícula muestra una región del espacio que se expande; no tiene un centro cósmico. La cronología empieza en los primeros microsegundos y termina con la recombinación, sin abordar la física desconocida del instante inicial.</p>
      <p>Los tiempos y temperaturas son aproximados y algunas etapas se solapan. Los dos encuentros de interacción débil son ejemplos del mismo periodo, no fases que ocurrieran una después de la otra. El enfriamiento reduce la eficacia de esas conversiones; la desintegración de neutrones libres continúa.</p>
      <p>Las esferas y sus colores son símbolos, no fotografías ni tamaños reales. Los encuentros se amplían para explicar el mecanismo; no seguimos a un mismo conjunto de partículas durante toda la historia. La longitud de las ondas sugiere enfriamiento, sin representar una distribución térmica calculada.</p>
      <p>El balance de 16 nucleones omite trazas isotópicas y diferencias de masa por ligadura: muestra aproximadamente 75 % de hidrógeno y 25 % de helio en masa nuclear, no del contenido total de energía del universo. La reunión de cuatro nucleones es un balance final, no una reacción elemental de cuatro cuerpos. No desarrollamos las rutas del helio, litio o berilio.</p>
      <p>La captura electrónica se resume en un proceso neto. La recombinación real ocurre durante un intervalo e incluye capturas, estados excitados, cascadas y transporte de radiación. La nube final simboliza la probabilidad de encontrar un único electrón, no muchos electrones ni una órbita planetaria.</p>
      <p>Retroceder rebobina la explicación. No afirma que todos los procesos físicos se inviertan espontáneamente. {reducedMotion ? 'Tu preferencia de movimiento reducido está activa: mostramos directamente los estados en reposo.' : 'Con movimiento reducido, se muestran directamente los estados en reposo.'}</p>
      <h3>Bibliografía y procedencia</h3>
      <ul>{hydrogenSources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.detail}</p></li>)}</ul>
      <p className="dialog-small">Guion y dibujos originales a partir del capítulo indicado. El libro completo no se distribuye con esta aplicación. No representamos la posterior formación de H₂ ni la historia de las estrellas.</p>
    </dialog>
  </main>;
}
