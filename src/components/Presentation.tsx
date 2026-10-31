import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { milestones, sources } from '../content/star';
import { usePresentation } from '../experience/usePresentation';

export default function Presentation() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [awake, setAwake] = useState(true);
  const [wakeCount, setWakeCount] = useState(0);
  const { index, busy, reducedMotion, navigate } = usePresentation(canvas);
  const step = milestones[index];

  const wake = () => { setAwake(true); setWakeCount(value => value + 1); };
  useEffect(() => {
    const timer = window.setTimeout(() => setAwake(false), 4200);
    return () => window.clearTimeout(timer);
  }, [wakeCount]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (dialog.current?.open || event.altKey || event.ctrlKey || event.metaKey) return;
      const element = event.target as HTMLElement;
      if (element.closest('a, input, textarea, select')) return;
      if (element.closest('button') && event.key === ' ') return;
      if (['ArrowRight', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        wake();
        if (!event.repeat) navigate(['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  function advance(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button, a, dialog') || dialog.current?.open) return;
    wake();
    navigate(1);
  }
  function openSources() { dialog.current?.showModal(); }
  function onStageKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Tab') wake();
  }

  return (
    <main className="presentation relative isolate overflow-hidden bg-[#080c14] text-[#f2eee7]"
      onClick={advance} onPointerMove={wake} onKeyDown={onStageKey}
      data-milestone={index} data-busy={busy} data-awake={awake} data-reduced={reducedMotion}>
      <canvas ref={canvas} className="universe absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="vignette pointer-events-none absolute inset-0" />
      <div className="edition pointer-events-none"><span>FISICA</span><span>ESTUDIOS DEL COSMOS — 001</span></div>

      <div className="scene-label pointer-events-none" aria-hidden="true">
        <span className="crosshair">+</span>
        {index === 0 ? 'H₂ · GAS Y POLVO' : index === 1 ? 'COLAPSO LOCAL' : index === 2 ? 'NÚCLEO EN FORMACIÓN' : index === 3 ? 'H → He + ENERGÍA' : 'UNA ESTRELLA ESTABLE'}
      </div>
      {index === 4 && <div className="balance-key pointer-events-none" aria-hidden="true">
        <span>Presión</span><span>Gravedad</span>
      </div>}

      <section className="narrative pointer-events-none" aria-labelledby="scene-title" aria-busy={busy}>
        <div className="chapter"><span className="chapter-line" /> NACIMIENTO DE UNA ESTRELLA</div>
        <div key={index} className="copy" aria-live="polite" aria-atomic="true">
          <p className="milestone-label">{String(index + 1).padStart(2, '0')} / 05 <span>{step.label}</span></p>
          <h1 id="scene-title">{step.title}</h1>
          <p className="description">{step.description}</p>
          <p className="detail">{step.detail}</p>
        </div>
      </section>

      <div className="footnote pointer-events-none"><span>{step.note}</span><span>VISUALIZACIÓN ESQUEMÁTICA · SIN ESCALA</span></div>
      <p className="sr-only" id="instructions">Haz clic o toca el espacio para avanzar. Flecha derecha o espacio: siguiente. Flecha izquierda: anterior. Las animaciones se detienen en cada hito. Los controles aparecen al mover el puntero o al enfocarlos con Tab.</p>

      <nav className="navigation" aria-label="Navegación de la presentación" aria-describedby="instructions">
        <button className="back" disabled={index === 0 || busy} onClick={() => { wake(); navigate(-1); }} aria-label="Hito anterior">← <span>Anterior</span></button>
        <div className="progress" aria-label={'Hito ' + (index + 1) + ' de 5'}>
          {milestones.map((item, i) => <span key={item.label} className={i <= index ? 'filled' : ''} />)}
        </div>
        <button className="next" disabled={index === 4 || busy} onClick={() => { wake(); navigate(1); }}>
          {busy ? 'Transformando' : index === 4 ? 'Fin del estudio' : index === 0 ? 'Explorar' : 'Continuar'} <span aria-hidden="true">→</span>
        </button>
        <button className="sources" onClick={openSources} aria-label="Ver fuentes y notas científicas">Fuentes y notas</button>
      </nav>
      <div className="tap-hint pointer-events-none" aria-hidden="true">{busy ? 'OBSERVA LA TRANSFORMACIÓN' : index === 4 ? '← PARA VOLVER A EXPLORAR' : 'CLIC, TOQUE O ESPACIO PARA CONTINUAR'}</div>

      <dialog ref={dialog} className="source-dialog" aria-labelledby="sources-title" onClick={event => event.stopPropagation()}>
        <button className="close-dialog" onClick={() => dialog.current?.close()} aria-label="Cerrar fuentes">Cerrar ×</button>
        <p className="chapter">DETRÁS DE LA ESCENA</p>
        <h2 id="sources-title">Una mirada científica.</h2>
        <p>Representamos la formación de una estrella de masa similar al Sol. No todas las nubes forman estrellas: una región debe reunir condiciones adecuadas para colapsar.</p>
        <p>Las distancias, los tiempos y los colores son esquemáticos. Los puntos representan porciones de gas, no átomos individuales. Omitimos la rotación, discos, campos magnéticos y chorros para concentrarnos en el colapso y el soporte por presión.</p>
        <p>Las flechas finales representan fuerzas opuestas por unidad de volumen, no flujos de materia. La fusión sostiene una fuente de energía estable; no se representa como una explosión.</p>
        <h3>Para seguir aprendiendo</h3>
        <ul>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul>
        <p className="dialog-small">Los hitos condensan un proceso de cientos de miles a millones de años. Con movimiento reducido, las escenas cambian directamente y permanecen quietas.</p>
      </dialog>
    </main>
  );
}
