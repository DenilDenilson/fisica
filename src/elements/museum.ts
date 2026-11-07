import * as T from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { elements, tablePosition, type Element } from './catalogue';
import { SampleFactory } from './samples';

export interface Museum {
  select: (element: Element | null) => void;
  filter: (numbers: Set<number>) => void;
  zoom: (factor: number) => void;
  reset: () => void;
  quality: (value: string) => void;
  dispose: () => void;
}
export async function createMuseum(canvas: HTMLCanvasElement, onSelect: (element: Element) => void): Promise<Museum> {
  let renderer = new T.WebGPURenderer({ canvas, antialias: true, alpha: false });
  try { await renderer.init(); }
  catch {
    renderer.dispose();
    renderer = new T.WebGPURenderer({ canvas, antialias: true, forceWebGL: true });
    try { await renderer.init(); } catch (error) { renderer.dispose(); throw error; }
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.6));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new T.Scene();
  scene.background = new T.Color('#080c10');
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 250);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minDistance = 3;
  controls.maxDistance = 130;
  controls.maxPolarAngle = Math.PI * 0.85;
  const room = new RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  scene.add(new T.HemisphereLight('#cfdfeb', '#262123', 2.2));
  const key = new T.DirectionalLight('#fff0d8', 5);
  key.position.set(-9, 12, 20);
  scene.add(key);
  const rim = new T.DirectionalLight('#a6c8e6', 3);
  rim.position.set(12, -2, 8);
  scene.add(rim);
  const factory = new SampleFactory();
  const table = new T.Group();
  const detail = new T.Group();
  detail.visible = false;
  scene.add(table, detail);
  const bodyGeometry = new T.BoxGeometry(1.82, 0.18, 1.35);
  const caseGeometry = new T.BoxGeometry(1.82, 1.52, 1.35);
  const edgeGeometry = new T.EdgesGeometry(caseGeometry);
  const baseMaterial = new T.MeshStandardMaterial({ color: '#263038', metalness: 0.7, roughness: 0.31 });
  const glassMaterial = new T.MeshPhysicalMaterial({ color: '#abc4d1', roughness: 0.13, transparent: true, opacity: 0.035, depthWrite: false });
  const edgeMaterial = new T.LineBasicMaterial({ color: '#52666e', transparent: true, opacity: 0.4 });
  const detailGlass = new T.MeshPhysicalMaterial({ color: '#d4e4ee', transmission: 0.94, thickness: 0.04, roughness: 0.08, ior: 1.45, transparent: true, opacity: 0.15, depthWrite: false });
  const plinths = new T.InstancedMesh(bodyGeometry, baseMaterial, elements.length);
  const vitrines = new T.InstancedMesh(caseGeometry, glassMaterial, elements.length);
  table.add(plinths, vitrines);
  const roots = new Map<number, T.Group>();
  const labelTextures: T.Texture[] = [];
  const labelMaterials: T.SpriteMaterial[] = [];
  const dummy = new T.Object3D();
  let active = new Set(elements.map(e => e.number));
  let selected: Element | null = null;
  let disposed = false;
  let pending = false;
  let preserveCameraOnResize = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function label(element: Element) {
    const image = document.createElement('canvas');
    image.width = 320; image.height = 138;
    const ctx = image.getContext('2d')!;
    ctx.fillStyle = '#a2aeb5'; ctx.font = '20px Arial';
    ctx.fillText(String(element.number).padStart(2, '0'), 20, 28);
    ctx.fillStyle = '#eef0e9'; ctx.font = '500 44px Georgia';
    ctx.fillText(element.symbol, 62, 67);
    ctx.font = '20px Arial'; ctx.fillStyle = '#b5bfc4';
    ctx.fillText(element.name, 20, 101, 280);
    if (element.evidence === 'conceptual') {
      ctx.fillStyle = '#ba9f7d'; ctx.font = '13px Arial'; ctx.fillText('SIN MUESTRA', 155, 28);
    } else if (element.state === 'gas') {
      ctx.fillStyle = '#869da1'; ctx.font = '13px Arial'; ctx.fillText('GAS · ILUSTRACIÓN', 155, 28);
    }
    const texture = new T.CanvasTexture(image);
    texture.colorSpace = T.SRGBColorSpace;
    labelTextures.push(texture);
    const material = new T.SpriteMaterial({ map: texture, depthWrite: false });
    labelMaterials.push(material);
    const sprite = new T.Sprite(material);
    sprite.scale.set(1.94, 0.84, 1);
    return sprite;
  }
  for (const element of elements) {
    const [col, row] = tablePosition(element.number);
    const root = new T.Group();
    root.position.set((col - 8.5) * 2.15, (4.3 - row) * 2.25, 0);
    root.userData.number = element.number;
    const sample = factory.create(element);
    sample.position.set(0, 0.02, 0.22);
    root.add(sample);
    const edges = new T.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.y = 0.08;
    root.add(edges);
    const sprite = label(element);
    sprite.position.set(0, -1.05, 0.8);
    root.add(sprite);
    table.add(root); roots.set(element.number, root);
    dummy.position.copy(root.position); dummy.position.y -= 0.78;
    dummy.updateMatrix(); plinths.setMatrixAt(element.number - 1, dummy.matrix);
    dummy.position.copy(root.position); dummy.position.y += 0.08;
    dummy.updateMatrix(); vitrines.setMatrixAt(element.number - 1, dummy.matrix);
  }
  plinths.computeBoundingSphere(); vitrines.computeBoundingSphere();
  // Detached f-block markers keep the conventional 18-column layout unambiguous.
  const note = (text: string, x: number, y: number) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#7d8b94'; ctx.font = '22px Arial'; ctx.fillText(text, 5, 40);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; labelTextures.push(t);
    const m = new T.SpriteMaterial({ map: t }); labelMaterials.push(m);
    const sprite = new T.Sprite(m); sprite.scale.set(2.2, 0.55, 1); sprite.position.set(x, y, 0.8); table.add(sprite);
  };
  note('57–71 ↓', (2 - 8.5) * 2.15, (4.3 - 5) * 2.25);
  note('89–103 ↓', (2 - 8.5) * 2.15, (4.3 - 6) * 2.25);

  function draw() {
    if (pending || disposed) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (!disposed) renderer.render(scene, camera);
    });
  }
  const fit = () => {
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    return Math.max(25, 13 / Math.tan(camera.fov * Math.PI / 360), 21 / (aspect * Math.tan(camera.fov * Math.PI / 360)));
  };
  let savedPosition = new T.Vector3(0, 3, fit());
  let savedTarget = new T.Vector3(0, -0.8, 0);
  const reset = () => {
    if (selected) return;
    camera.position.set(0, 3, fit()); controls.target.set(0, -0.8, 0); controls.update(); draw();
  };
  const observer = new ResizeObserver(() => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!selected && !preserveCameraOnResize) reset(); else draw();
    preserveCameraOnResize = false;
  });
  observer.observe(canvas);
  controls.addEventListener('change', draw);
  reset();
  const raycaster = new T.Raycaster();
  const mouse = new T.Vector2();
  let press = { x: 0, y: 0 };
  const pointerDown = (event: PointerEvent) => { press = { x: event.clientX, y: event.clientY }; };
  function pick(event: PointerEvent) {
    if (selected || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) return;
    const rect = canvas.getBoundingClientRect();
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const intersections = raycaster.intersectObjects([...roots.values()].filter(root => root.visible), true);
    if (intersections.length) {
      let object: T.Object3D | null = intersections[0].object;
      while (object && !object.userData.number) object = object.parent;
      const element = elements.find(e => e.number === object?.userData.number);
      if (element) onSelect(element);
    }
  }
  let hovered: T.Group | null = null;
  function hover(event: PointerEvent) {
    if (selected || event.buttons || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects([...roots.values()].filter(root => root.visible), true)[0];
    let object: T.Object3D | null = hit?.object ?? null;
    while (object && !object.userData.number) object = object.parent;
    const root = object as T.Group | null;
    if (hovered === root) return;
    if (hovered) gsap.to(hovered.position, { z: 0, duration: reduced.matches ? 0 : 0.25, onUpdate: draw });
    hovered = root;
    if (hovered) gsap.to(hovered.position, { z: 0.25, duration: reduced.matches ? 0 : 0.25, onUpdate: draw });
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pick);
  canvas.addEventListener('pointermove', hover);
  canvas.addEventListener('webglcontextlost', lost);
  function lost(event: Event) { event.preventDefault(); canvas.dispatchEvent(new CustomEvent('museum-error')); }
  function select(element: Element | null) {
    gsap.killTweensOf(camera.position); gsap.killTweensOf(controls.target);
    if (element && !selected) {
      savedPosition = camera.position.clone(); savedTarget = controls.target.clone();
    }
    preserveCameraOnResize = Boolean(selected && !element);
    selected = element;
    controls.enablePan = !element;
    detail.clear();
    table.visible = !element; detail.visible = Boolean(element);
    if (element) {
      const sample = factory.create(element, true);
      sample.scale.setScalar(2.15);
      sample.updateMatrixWorld(true);
      const bounds = new T.Box3().setFromObject(sample);
      sample.position.y = -1.27 - bounds.min.y;
      detail.add(sample);
      const base = new T.Mesh(bodyGeometry, baseMaterial); base.scale.set(1.6, 1.5, 1.6); base.position.y = -1.43; detail.add(base);
      const glass = new T.Mesh(caseGeometry, detailGlass); glass.scale.setScalar(1.6); detail.add(glass);
      const edges = new T.LineSegments(edgeGeometry, edgeMaterial); edges.scale.setScalar(1.6); detail.add(edges);
    }
    const destination = element ? new T.Vector3(0, 1.2, 8.5) : savedPosition;
    const target = element ? new T.Vector3(0, 0, 0) : savedTarget;
    controls.enabled = false;
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: reduced.matches ? 0 : 0.8, ease: 'power2.inOut' });
    gsap.to(camera.position, { x: destination.x, y: destination.y, z: destination.z, duration: reduced.matches ? 0 : 0.8, ease: 'power2.inOut', onUpdate: () => { camera.lookAt(controls.target); draw(); }, onComplete: () => { controls.enabled = true; controls.update(); draw(); } });
    draw();
  }
  return {
    select, reset,
    filter(numbers) {
      active = numbers;
      for (const element of elements) {
        const root = roots.get(element.number)!;
        root.visible = active.has(element.number);
        dummy.position.copy(root.position); dummy.position.z = 0; dummy.position.y -= 0.78;
        dummy.scale.setScalar(root.visible ? 1 : 0); dummy.updateMatrix(); plinths.setMatrixAt(element.number - 1, dummy.matrix);
        dummy.position.y += 0.86; dummy.updateMatrix(); vitrines.setMatrixAt(element.number - 1, dummy.matrix);
      }
      dummy.scale.setScalar(1);
      plinths.instanceMatrix.needsUpdate = vitrines.instanceMatrix.needsUpdate = true;
      draw();
    },
    zoom(factor) { camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target); controls.update(); draw(); },
    quality(value) { renderer.setPixelRatio(value === 'baja' ? 1 : value === 'alta' ? Math.min(devicePixelRatio, 2) : Math.min(devicePixelRatio, 1.5)); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); draw(); },
    dispose() {
      disposed = true; observer.disconnect(); controls.dispose();
      gsap.killTweensOf(camera.position); gsap.killTweensOf(controls.target);
      roots.forEach(root => gsap.killTweensOf(root.position));
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointerup', pick); canvas.removeEventListener('pointermove', hover); canvas.removeEventListener('webglcontextlost', lost);
      bodyGeometry.dispose(); caseGeometry.dispose(); edgeGeometry.dispose();
      baseMaterial.dispose(); glassMaterial.dispose(); detailGlass.dispose(); edgeMaterial.dispose();
      labelTextures.forEach(t => t.dispose()); labelMaterials.forEach(m => m.dispose());
      factory.dispose(); environment.dispose(); pmrem.dispose(); renderer.dispose();
    },
  };
}
