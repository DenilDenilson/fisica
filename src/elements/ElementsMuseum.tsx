import { useEffect, useMemo, useRef, useState } from 'react';
import { elements, families, matches, type Element } from './catalogue';
import type { Museum } from './museum';

const evidenceLabels: Record<string, string> = { documentada: 'Apariencia documentada', aproximada: 'Apariencia aproximada', conceptual: 'Representación conceptual' };
const format = (value: number | null, suffix = '') => value === null ? 'No establecido' : new Intl.NumberFormat('es', { maximumFractionDigits: 6 }).format(value) + suffix;

export default function ElementsMuseum() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<Museum | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const notes = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('');
  const [state, setState] = useState('');
  const [selected, setSelected] = useState<Element | null>(null);
  const [quality, setQuality] = useState('auto');
  const visible = useMemo(() => elements.filter(e => matches(e, query, family, state)), [query, family, state]);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  function select(element: Element | null) {
    if (element && !selected) previousFocus.current = document.activeElement as HTMLElement;
    setSelected(element); api.current?.select(element);
    if (!element) requestAnimationFrame(() => previousFocus.current?.focus());
  }
  useEffect(() => {
    if (selected) closeButton.current?.focus();
  }, [selected]);
  useEffect(() => {
    let cancelled = false;
    let instance: Museum | null = null;
    import('./museum').then(({ createMuseum }) => {
      if (cancelled || !canvas.current) return null;
      return createMuseum(canvas.current, element => {
      previousFocus.current = canvas.current;
      setSelected(element); api.current?.select(element);
      });
    }).then(museum => {
      if (!museum) return;
      if (cancelled) { museum.dispose(); return; }
      instance = museum; api.current = museum;
      museum.filter(new Set(visibleRef.current.map(e => e.number)));
      setReady(true);
    }).catch(() => {
      if (!cancelled) setError('No se pudo iniciar la vista 3D en este dispositivo. Puedes explorar los 118 elementos en el índice y consultar sus propiedades.');
    });
    const lost = () => setError('Se interrumpió la vista 3D. El índice y las fichas siguen disponibles. Recarga la página para volver a intentar.');
    const node = canvas.current;
    node?.addEventListener('museum-error', lost);
    return () => { cancelled = true; instance?.dispose(); api.current = null; node?.removeEventListener('museum-error', lost); };
  }, []);
  useEffect(() => { api.current?.filter(new Set(visible.map(e => e.number))); }, [visible]);
  useEffect(() => { api.current?.quality(quality); }, [quality, ready]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (notes.current?.open || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') { select(null); return; }
      if ((event.target as HTMLElement).closest('input,select,button,a,summary')) return;
      if (event.key === '+' || event.key === '=') { event.preventDefault(); api.current?.zoom(0.85); }
      if (event.key === '-') { event.preventDefault(); api.current?.zoom(1.18); }
      if (event.key.toLowerCase() === 'r' && !selected) api.current?.reset();
      if (selected && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const next = selected.number + (event.key === 'ArrowRight' ? 1 : -1);
        const element = elements.find(e => e.number === next);
        if (element) select(element);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [selected]);

  return <main className={'museum ' + (selected ? 'has-selection' : '')}>
    <header className="museum-header">
      <a className="museum-brand" href="/" aria-label="Fisica, volver al inicio">FISICA <span> / COLECCIÓN 002</span></a>
      <button className="science-link" onClick={() => notes.current?.showModal()}>Criterio científico →</button>
      <div className="museum-heading"><div><p className="eyebrow">UN MUSEO DE LA MATERIA</p><h1>Los elementos<span>.</span></h1></div><p className="conditions">118 elementos · 25 °C · 1 atm<br/><span>Una colección de lo que conocemos. Y de lo que aún no.</span></p></div>
      <div className="museum-tools" aria-label="Buscar y filtrar elementos">
        <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Buscar elemento" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, símbolo o número" type="search" /></label>
        <label><span className="sr-only">Familia química</span><select value={family} onChange={e => setFamily(e.target.value)} aria-label="Familia química"><option value="">Todas las familias</option>{families.map(f => <option key={f}>{f}</option>)}</select></label>
        <label><span className="sr-only">Estado físico</span><select value={state} onChange={e => setState(e.target.value)} aria-label="Estado físico"><option value="">Todos los estados</option>{['sólido', 'líquido', 'gas', 'desconocido'].map(s => <option key={s}>{s}</option>)}</select></label>
        {(query || family || state) && <button onClick={() => { setQuery(''); setFamily(''); setState(''); }}>Limpiar ×</button>}
        <span className="result-count" role="status">{visible.length} / 118</span>
      </div>
    </header>
    <div className="museum-space">
      <section className="museum-stage" aria-label={selected ? 'Muestra de ' + selected.name : 'Tabla periódica tridimensional'}>
        <canvas ref={canvas} tabIndex={0} aria-label="Vista 3D. Arrastra para orbitar, usa dos dedos o botón derecho para desplazar y pellizca o usa la rueda para acercar. Usa el índice para seleccionar con teclado." />
        {!ready && !error && <div className="museum-loading" role="status"><span className="loading-mark">◇</span> Preparando las vitrinas…</div>}
        {error && <p className="museum-error" role="alert">{error}</p>}
        <div className="camera-controls" aria-label="Controles de cámara">
          <button onClick={() => api.current?.zoom(0.8)} disabled={!ready} aria-label="Acercar">+</button>
          <button onClick={() => api.current?.zoom(1.25)} disabled={!ready} aria-label="Alejar">−</button>
          {!selected && <button onClick={() => api.current?.reset()} disabled={!ready} aria-label="Restablecer cámara">↺</button>}
        </div>
        <p className="scene-caption">{selected ? (selected.state === 'gas' ? 'VOLUMEN ILUSTRATIVO · NO ES LUZ DE EMISIÓN' : selected.evidence === 'conceptual' ? 'SIN MUESTRA MACROSCÓPICA OBSERVADA' : 'GEOMETRÍA PROCEDURAL · NO ESTÁ A ESCALA') : 'ARRASTRA PARA ORBITAR · RUEDA O PELLIZCO PARA ACERCAR'}</p>
      </section>
      {selected && <aside className="element-inspector" aria-labelledby="element-title">
        <button ref={closeButton} className="close-inspector" onClick={() => select(null)}>← Volver a la tabla <span>Esc</span></button>
        <div className={'evidence evidence-' + selected.evidence}>{evidenceLabels[selected.evidence]}</div>
        <div className="element-identity"><span className="atomic-number">{String(selected.number).padStart(3, '0')}</span><span className="element-symbol">{selected.symbol}</span><span className="element-family">{selected.family}</span></div>
        <h2 id="element-title">{selected.name}</h2>
        <p className="selected-form">{selected.form}</p>
        <p className="element-description">{selected.appearance}</p>
        <dl className="element-properties">
          <div><dt>Estado a 25 °C y 1 atm</dt><dd>{selected.state === 'desconocido' ? 'No establecido experimentalmente' : selected.state}</dd></div>
          <div><dt>Masa de referencia · u</dt><dd>{selected.mass}</dd></div>
          <div><dt>Densidad · g/cm³</dt><dd>{format(selected.density)}</dd></div>
          <div><dt>{[6,33].includes(selected.number) ? 'Fusión a 1 atm' : 'Punto de fusión · °C'}</dt><dd>{[6,33].includes(selected.number) ? 'Sublima; sin fase líquida estable' : format(selected.meltingK === null ? null : selected.meltingK - 273.15)}</dd></div>
          <div><dt>{[6,33].includes(selected.number) ? 'Ebullición a 1 atm' : 'Punto de ebullición · °C'}</dt><dd>{[6,33].includes(selected.number) ? 'No aplica a 1 atm' : format(selected.boilingK === null ? null : selected.boilingK - 273.15)}</dd></div>
        </dl>
        <p className="property-note">{selected.densityNote} {selected.propertyNote}</p>
        <p className="property-note">Los tamaños y formas son interpretaciones visuales; no representan átomos individuales. La masa indicada es el valor de referencia de PubChem, también para elementos sin peso atómico estándar.</p>
        <div className="element-sources"><h3>Fuentes</h3>{selected.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} →</a>)}</div>
        <p className="inspector-hint">Arrastra para explorar la muestra · ← → para cambiar de elemento con el lienzo enfocado.</p>
      </aside>}
    </div>
    <footer className="museum-footer">
      <div className="sample-shortcuts"><span>OBSERVA DE CERCA</span>{[79,29,16,80,35,8].map(z => { const e = elements[z - 1]; return <button key={z} onClick={() => select(e)} aria-label={'Explorar ' + e.name}>{e.symbol}<span>{e.name}</span></button>; })}</div>
      <label className="quality-control">Detalle <select aria-label="Calidad visual" value={quality} onChange={e => setQuality(e.target.value)}><option value="auto">Auto</option><option value="baja">Bajo</option><option value="alta">Alto</option></select></label>
      <details className="accessible-index" open={Boolean(error || query || family || state)}><summary>Índice de elementos <span>{visible.length}</span></summary><div className="element-index-list">{visible.map(e => <button key={e.number} onClick={() => select(e)}><span>{e.number}</span><strong>{e.symbol}</strong>{e.name}<small>{e.state}</small></button>)}{visible.length === 0 && <p>No hay elementos que coincidan con los filtros.</p>}</div></details>
    </footer>
    <dialog ref={notes} className="museum-notes" aria-labelledby="museum-notes-title">
      <button className="notes-close" onClick={() => notes.current?.close()}>Cerrar ×</button>
      <p className="eyebrow">CIENCIA ANTES QUE ESPECTÁCULO</p><h2 id="museum-notes-title">Materia, con contexto.</h2>
      <p>Las muestras ilustran materiales a 25 °C y 1 atm. Los tamaños, formas y vitrinas son recursos expositivos, no reproducciones de objetos reales. Se indica el alótropo cuando resulta relevante.</p>
      <h3>Qué sabemos de su aspecto</h3><p><strong>Documentada:</strong> apariencia descrita por fuentes científicas; geometría aproximada. <strong>Aproximada:</strong> elementos producidos en cantidades muy pequeñas. <strong>Conceptual:</strong> sin muestra macroscópica observada; los aros señalan una ausencia de evidencia visual, no una forma del material.</p>
      <p>Los gases incoloros no se verían a simple vista. Su volumen se marca de forma tenue e ilustrativa. Los colores de flúor y cloro corresponden al gas, no a emisión, plasma ni tubos de descarga.</p>
      <p>En astato, francio y elementos de número 99 o superior se omite una supuesta muestra y se retienen como desconocidas las propiedades macroscópicas no establecidas. Las predicciones no se muestran como medidas.</p>
      <p>Las densidades de gases se calculan con la aproximación de gas ideal a 25 °C y 1 atm. Las de sólidos y líquidos son valores de referencia de PubChem y no están corregidas a 25 °C. Carbono y arsénico subliman a presión atmosférica.</p>
      <h3>Procedencia</h3><p>Catálogo de 118 elementos de <a href="https://pubchem.ncbi.nlm.nih.gov/periodic-table/" target="_blank" rel="noreferrer">PubChem</a>, contrastado con las 118 fichas de la <a href="https://periodic-table.rsc.org/" target="_blank" rel="noreferrer">Royal Society of Chemistry</a>. Consulta los enlaces individuales en cada ficha. Revisión: 7 de noviembre de 2026.</p>
    </dialog>
  </main>;
}
