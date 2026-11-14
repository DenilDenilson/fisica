/** An original adaptation of chapter 3, not a reproduction of the book. */
export const hydrogenSources = [
  {
    id: 'book',
    title: 'Enrique Nácher González y Sergio Pastor Carpi · La formación de los elementos químicos (2025)',
    detail: 'Capítulo 3, «Creación primordial de los elementos». Secciones «Breve historia del universo» y «La primera nucleosíntesis»; figura 16. Páginas 51–66 del PDF consultado.',
    url: 'https://books.denil.org/SC__2025__La-formacion-de-los-elentos-quimicos_protected.pdf',
  },
  {
    id: 'cern',
    title: 'CERN · Heavy ions and quark-gluon plasma',
    detail: 'Contraste sobre el plasma de quarks y gluones y la formación de protones y neutrones.',
    url: 'https://home.cern/science/physics/heavy-ions-and-quark-gluon-plasma/',
  },
  {
    id: 'nasa',
    title: 'NASA · Early Universe',
    detail: 'Contraste sobre la formación de átomos neutros hacia los 380 000 años.',
    url: 'https://science.nasa.gov/mission/webb/early-universe/',
  },
] as const;

// Charge is measured in elementary charges. Lepton number includes antineutrinos.
export const species = {
  p: { baryons: 1, charge: 1, leptons: 0 },
  n: { baryons: 1, charge: 0, leptons: 0 },
  electron: { baryons: 0, charge: -1, leptons: 1 },
  positron: { baryons: 0, charge: 1, leptons: -1 },
  neutrino: { baryons: 0, charge: 0, leptons: 1 },
  antineutrino: { baryons: 0, charge: 0, leptons: -1 },
  photon: { baryons: 0, charge: 0, leptons: 0 },
  deuteron: { baryons: 2, charge: 1, leptons: 0 },
  hydrogen: { baryons: 1, charge: 0, leptons: 1 },
} as const;

export const hydrogenReactions = {
  neutrino: {
    equation: 'νₑ + n ⇌ p + e⁻',
    accessible: 'Neutrino electrónico más neutrón, en equilibrio con protón más electrón.',
    input: ['neutrino', 'n'], output: ['p', 'electron'],
    note: 'Interacción débil · el proceso inverso también ocurre',
  },
  positron: {
    equation: 'e⁺ + n ⇌ p + ν̅ₑ',
    accessible: 'Positrón más neutrón, en equilibrio con protón más antineutrino electrónico.',
    input: ['positron', 'n'], output: ['p', 'antineutrino'],
    note: 'e⁺: positrón · ν̅ₑ: antineutrino electrónico',
  },
  decay: {
    equation: 'n → p + e⁻ + ν̅ₑ',
    accessible: 'Un neutrón libre se desintegra en un protón, un electrón y un antineutrino electrónico.',
    input: ['n'], output: ['p', 'electron', 'antineutrino'],
    note: 'Desintegración beta de un neutrón libre',
  },
  breakup: {
    equation: '²H + γ → p + n',
    accessible: 'Un fotón suficientemente energético rompe el deuterón en un protón y un neutrón.',
    input: ['deuteron', 'photon'], output: ['p', 'n'],
    note: 'γ: fotón · primero se forma ²H; después se rompe',
  },
  deuterium: {
    equation: 'p + n → ²H + γ',
    accessible: 'Un protón y un neutrón se unen en un núcleo de deuterio y emiten un fotón.',
    input: ['p', 'n'], output: ['deuteron', 'photon'],
    note: '²H: deuterio, un isótopo del hidrógeno · aún sin electrón',
  },
  capture: {
    equation: 'p + e⁻ → ¹H + fotones',
    accessible: 'Un protón captura un electrón y forma hidrógeno neutro, con emisión de radiación.',
    input: ['p', 'electron'], output: ['hydrogen', 'photon'],
    note: 'Esquema neto · la recombinación real incluye varias etapas',
  },
} as const satisfies Record<string, {
  equation: string; accessible: string; input: readonly (keyof typeof species)[];
  output: readonly (keyof typeof species)[]; note: string;
}>;

export interface HydrogenMilestone {
  id: string;
  label: string;
  title: string;
  description: string;
  detail: string;
  time: string;
  temperature: string;
  seconds: number;
  era: string;
  annotation: string;
  visualDescription: string;
  reaction?: keyof typeof hydrogenReactions;
  sourceIds: readonly (typeof hydrogenSources[number]['id'])[];
}

export const hydrogenMilestones: readonly HydrogenMilestone[] = [
  {
    id: 'hot-universe', label: 'Un universo sin átomos', title: 'Antes del primer\nátomo.',
    description: 'Tras el Big Bang, el universo es un medio extraordinariamente caliente y denso. No hay estrellas, moléculas ni átomos.',
    detail: 'En los primeros microsegundos, quarks y gluones aún no están confinados en protones y neutrones. Comenzamos aquí: el instante inicial sigue fuera de esta explicación.',
    time: 'Primeros microsegundos', temperature: 'Del orden de 10¹² K o más', seconds: 0.000001,
    era: 'EL UNIVERSO TEMPRANO', annotation: 'QUARKS Y GLUONES · TODAVÍA SIN ÁTOMOS',
    visualDescription: 'Quarks u y d separados, inmersos en un medio caliente. La cuadrícula representa una pequeña región del espacio, sin borde ni centro cósmico.', sourceIds: ['book', 'cern'],
  },
  {
    id: 'confinement', label: 'Expansión y enfriamiento', title: 'Más espacio.\nNuevas estructuras.',
    description: 'El espacio se expande y el universo se enfría. Los quarks quedan confinados en partículas compuestas: protones y neutrones.',
    detail: 'Un protón contiene dos quarks u y uno d; un neutrón, uno u y dos d. El protón ya es el núcleo del hidrógeno común, ¹H. Todavía no es un átomo neutro.',
    time: 'Orden de microsegundos', temperature: 'Del orden de 10¹² K', seconds: 0.00001,
    era: 'LOS PRIMEROS NUCLEONES', annotation: 'uud → PROTÓN     udd → NEUTRÓN',
    visualDescription: 'La cuadrícula se ensancha. Dos grupos de tres quarks se reúnen: uud dentro de un protón y udd dentro de un neutrón.', sourceIds: ['book', 'cern'],
  },
  {
    id: 'neutrino-capture', label: 'Primera conversión', title: 'Un neutrón puede\nvolverse protón.',
    description: 'En este medio, protones y neutrones intercambian su identidad mediante la interacción débil.',
    detail: 'Un neutrino electrónico puede ser absorbido por un neutrón: salen un protón y un electrón. La reacción inversa también transforma protones en neutrones.',
    time: 'Antes de 1 segundo', temperature: 'Del orden de 10¹⁰ K', seconds: 0.1,
    era: 'INTERACCIONES DÉBILES', annotation: 'OBSERVA LA ENTRADA DEL NEUTRINO', reaction: 'neutrino',
    visualDescription: 'Un neutrino llega a un neutrón. Tras la interacción, el nucleón es un protón y un electrón se aleja.', sourceIds: ['book'],
  },
  {
    id: 'positron-capture', label: 'Otra vía de conversión', title: 'Otro encuentro.\nEl mismo cambio.',
    description: 'También un positrón, la antipartícula del electrón, puede convertir un neutrón en un protón.',
    detail: 'Ahora la partícula emitida es un antineutrino electrónico. Estas conversiones mantienen un equilibrio que cambia a medida que baja la temperatura.',
    time: 'Antes de 1 segundo', temperature: 'Del orden de 10¹⁰ K', seconds: 0.3,
    era: 'INTERACCIONES DÉBILES', annotation: 'OBSERVA LA ENTRADA DEL POSITRÓN', reaction: 'positron',
    visualDescription: 'En otro encuentro representativo, un positrón llega a un neutrón y emerge un antineutrino, mientras el neutrón se convierte en protón.', sourceIds: ['book'],
  },
  {
    id: 'freeze-out', label: 'Las conversiones pierden ritmo', title: 'La expansión\ntoma ventaja.',
    description: 'Las conversiones débiles ya no siguen el ritmo de la expansión. La proporción entre neutrones y protones deja de seguir el equilibrio térmico.',
    detail: 'Cerca de 0,7 MeV hay aproximadamente un neutrón por cada seis protones. El neutrón es un poco más pesado: al enfriarse el medio, los protones resultan más abundantes.',
    time: 'Alrededor de 1 segundo', temperature: '≈ 8 000 millones K · 0,7 MeV', seconds: 1,
    era: 'DESACOPLAMIENTO DEL EQUILIBRIO', annotation: '1 NEUTRÓN POR CADA 6 PROTONES · APROXIMADAMENTE',
    visualDescription: 'Seis protones y un neutrón muestran la proporción aproximada al dejar de mantenerse el equilibrio de conversiones.', sourceIds: ['book'],
  },
  {
    id: 'neutron-decay', label: 'Neutrones libres', title: 'Algunos neutrones\nno llegan a unirse.',
    description: 'Mientras transcurren los primeros minutos, parte de los neutrones libres se desintegra. Cada uno deja un protón, un electrón y un antineutrino.',
    detail: 'Así disminuye aún más la proporción de neutrones, hasta cerca de uno por cada siete protones antes de la síntesis eficiente. Este encuentro ilustra el proceso, no su frecuencia real.',
    time: 'De segundos a minutos', temperature: 'En descenso', seconds: 60,
    era: 'ANTES DE LA NUCLEOSÍNTESIS EFICIENTE', annotation: 'UN NEUTRÓN LIBRE CAMBIA; LAS PARTÍCULAS SE SEPARAN', reaction: 'decay',
    visualDescription: 'Un neutrón de la muestra cambia a protón, y un electrón y un antineutrino salen en direcciones distintas.', sourceIds: ['book'],
  },
  {
    id: 'deuterium-bottleneck', label: 'El cuello de botella', title: 'Unirse todavía\nno basta.',
    description: 'Un protón y un neutrón pueden formar deuterio, ²H. Pero los fotones suficientemente energéticos lo rompen de nuevo.',
    detail: 'El deuterón está ligado por unos 2,2 MeV. Como hay muchísimos más fotones que nucleones, la cola energética de la radiación impide que sobreviva suficiente deuterio.',
    time: 'Antes de unos 3 minutos', temperature: 'Aún por encima de ≈ 0,1 MeV', seconds: 120,
    era: 'FOTODESINTEGRACIÓN', annotation: 'SE UNEN → LLEGA UN FOTÓN → SE SEPARAN', reaction: 'breakup',
    visualDescription: 'Un protón y un neutrón se acercan y forman un deuterón, emitiendo un fotón. Otro fotón energético lo alcanza y los separa otra vez.', sourceIds: ['book'],
  },
  {
    id: 'deuterium-survives', label: 'El deuterio sobrevive', title: 'Ahora el vínculo\npuede durar.',
    description: 'Con más expansión y enfriamiento quedan menos fotones capaces de romper el deuterón. El deuterio puede acumularse.',
    detail: '²H sigue siendo hidrógeno: tiene un solo protón, acompañado por un neutrón. Es un isótopo distinto del protio, ¹H, cuyo núcleo es únicamente un protón.',
    time: 'Hacia los 3 minutos', temperature: 'Por debajo de ≈ 1 000 millones K', seconds: 180,
    era: 'NUCLEOSÍNTESIS PRIMORDIAL', annotation: 'UN PROTÓN + UN NEUTRÓN · NÚCLEO DE ²H', reaction: 'deuterium',
    visualDescription: 'El mismo par se reúne y emite radiación. Esta vez el deuterón permanece unido: no aparece un fotón que lo rompa.', sourceIds: ['book'],
  },
  {
    id: 'hydrogen-remains', label: 'El hidrógeno que permanece', title: 'La mayoría\nqueda como hidrógeno.',
    description: 'El deuterio abre otras rutas nucleares. Casi todos los neutrones disponibles terminan en helio-4, pero quedan muchos protones sin unirse.',
    detail: 'Un balance aproximado: de 14 protones y 2 neutrones resultan 12 núcleos de ¹H y uno de ⁴He. Cerca del 75 % de la masa de los núcleos es hidrógeno. Omitimos aquí las pequeñas trazas de otros isótopos.',
    time: 'De unos 3 a 15 minutos', temperature: 'Sigue descendiendo', seconds: 900,
    era: 'EL BALANCE PRIMORDIAL', annotation: 'BALANCE SIMPLIFICADO · NO ES UNA ÚNICA REACCIÓN',
    visualDescription: 'Dieciséis nucleones se reorganizan: dos protones y dos neutrones forman un grupo de helio-4; los doce protones restantes permanecen separados como núcleos de hidrógeno-1.', sourceIds: ['book'],
  },
  {
    id: 'ionized-universe', label: 'Núcleos, todavía sin átomos', title: 'El núcleo existe.\nFalta el átomo.',
    description: 'La nucleosíntesis ha terminado, pero los electrones aún no permanecen ligados a los núcleos. El universo sigue siendo un plasma.',
    detail: 'No hace falta fabricar otro protón. Hace falta que el medio se enfríe lo suficiente para conservar el electrón. Entre ambas etapas transcurren cientos de miles de años.',
    time: 'De minutos a cientos de miles de años', temperature: 'Hacia unos pocos miles de K', seconds: 100000 * 365.25 * 86400,
    era: 'UN LARGO INTERVALO DE ENFRIAMIENTO', annotation: 'PROTÓN Y ELECTRÓN · AÚN SEPARADOS',
    visualDescription: 'Ampliamos uno de los protones que quedaron libres. Un electrón permanece separado y la radiación atraviesa el medio ionizado.', sourceIds: ['book', 'nasa'],
  },
  {
    id: 'recombination', label: 'Recombinación', title: 'Un electrón\npuede quedarse.',
    description: 'Hacia los 380 000 años, con una temperatura de unos 3 000 K, la formación de átomos neutros puede sostenerse.',
    detail: 'El electrón pasa a un estado ligado al protón y se emite radiación. La nube representa su distribución de probabilidad; no una pequeña esfera recorriendo una órbita.',
    time: 'Hacia los 380 000 años', temperature: '≈ 3 000 K', seconds: 380000 * 365.25 * 86400,
    era: 'LOS PRIMEROS ÁTOMOS NEUTROS', annotation: 'CAPTURA DEL ELECTRÓN · EMISIÓN DE RADIACIÓN', reaction: 'capture',
    visualDescription: 'El electrón se acerca al protón. Su punto se transforma en una nube de probabilidad ligada y salen fotones: aparece un átomo de hidrógeno neutro.', sourceIds: ['book', 'nasa'],
  },
  {
    id: 'neutral-hydrogen', label: 'Hidrógeno neutro', title: 'Y ahora,\nun átomo.',
    description: 'El núcleo se formó al principio. El átomo neutro llegó mucho después. Son dos momentos distintos del origen del hidrógeno.',
    detail: 'Este es el protio, ¹H: un protón, ningún neutrón y un electrón ligado. Aquí termina nuestro recorrido, antes de las primeras estrellas y de las moléculas de hidrógeno.',
    time: 'Hacia los 380 000 años', temperature: '≈ 3 000 K', seconds: 380000 * 365.25 * 86400,
    era: 'EL PRIMER ELEMENTO', annotation: '¹H · CARGA TOTAL CERO · SIN NEUTRÓN',
    visualDescription: 'Un protón rodeado por la nube de probabilidad de un electrón. La composición permanece quieta para observar el átomo neutro.', sourceIds: ['book', 'nasa'],
  },
];
