import type { SceneState } from './sequence';

interface Particle { x: number; y: number; depth: number; size: number; phase: number }
function randomGenerator(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** A schematic cross-section; positions are deterministic and persist across milestones. */
export function createRenderer(canvas: HTMLCanvasElement, state: SceneState) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx = context;
  const random = randomGenerator(73);
  const particles: Particle[] = Array.from({ length: 1600 }, () => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      depth: random(), size: 0.3 + random() * 1.5, phase: random() * Math.PI * 2,
    };
  });
  const stars = Array.from({ length: 190 }, () => ({
    x: random(), y: random(), size: 0.3 + random() * 0.85, alpha: 0.12 + random() * 0.5,
  }));
  let width = 1;
  let height = 1;

  function halo(x: number, y: number, radius: number, color: string, opacity: number) {
    if (radius <= 0 || opacity <= 0) return;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color.replace('ALPHA', String(opacity)));
    gradient.addColorStop(0.35, color.replace('ALPHA', String(opacity * 0.42)));
    gradient.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      ctx.fillStyle = 'rgba(198,215,235,' + star.alpha + ')';
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    const mobile = width < 700;
    const cx = width * (mobile ? 0.5 : 0.65);
    const cy = height * (mobile ? 0.28 : 0.47);
    const radius = Math.min(width * (mobile ? 0.62 : 0.36), height * (mobile ? 0.28 : 0.43));
    const { spread, core, heat, fusion, balance } = state;
    ctx.globalCompositeOperation = 'screen';

    // Diffuse gas filaments fade as their mass gathers in the central object.
    for (let i = 0; i < 36; i++) {
      const p = particles[i * 17];
      const spiral = Math.sin(p.phase + (1 - spread) * 2);
      const x = cx + (p.x * spread + spiral * 0.06) * radius;
      const y = cy + p.y * radius * spread * 0.67;
      halo(x, y, radius * (0.15 + p.depth * 0.18) * (spread + 0.25),
        i % 3 === 0 ? 'rgba(134,96,168,ALPHA)' : 'rgba(67,136,158,ALPHA)',
        (0.05 + p.depth * 0.035) * (1 - core * 0.7));
    }

    for (const p of particles) {
      // Outer material contracts more slowly: gas remains around a forming proto-star.
      const contraction = spread + (1 - spread) * Math.pow(p.depth, 8) * 0.5;
      const twist = (1 - spread) * (1 - p.depth) * 0.6;
      const x = (p.x * Math.cos(twist) - p.y * Math.sin(twist)) * contraction;
      const y = (p.x * Math.sin(twist) + p.y * Math.cos(twist)) * contraction;
      const alpha = (0.16 + p.depth * 0.55) * (1 - core * 0.45);
      ctx.fillStyle = 'rgba(' + Math.round(158 + heat * 97) + ','
        + Math.round(198 - heat * 28) + ',' + Math.round(213 - heat * 68) + ',' + alpha + ')';
      ctx.beginPath();
      ctx.arc(cx + x * radius, cy + y * radius * 0.72,
        p.size * (mobile ? 0.7 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    halo(cx, cy, radius * (0.25 + core * 0.5), 'rgba(238,128,47,ALPHA)', core * 0.28);
    halo(cx, cy, radius * 0.29, 'rgba(255,180,80,ALPHA)', core * 0.5);
    if (core > 0.005) {
      const r = radius * (0.025 + core * 0.12);
      const surface = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 0, cx, cy, r);
      surface.addColorStop(0, fusion > 0.3 ? '#fffce6' : '#ffe3ae');
      surface.addColorStop(0.5, '#ffd18a');
      surface.addColorStop(0.9, '#ec9244');
      surface.addColorStop(1, 'rgba(229,117,44,0)');
      ctx.globalAlpha = core;
      ctx.fillStyle = surface;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Steady central light, with no repeated bursts or radial explosion.
      halo(cx, cy, r * 0.65, 'rgba(255,252,223,ALPHA)', fusion * 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';

    if (balance > 0) {
      // Opposing radial arrows explain pressure support, not an outflow of gas.
      const r = radius * 0.23;
      ctx.globalAlpha = balance * 0.8;
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const offset = 0.11;
        for (const outward of [true, false]) {
          const a = angle + (outward ? offset : -offset);
          const from = r * (outward ? 0.65 : 1.5);
          const to = r * (outward ? 1.18 : 1.0);
          const ex = cx + Math.cos(a) * to;
          const ey = cy + Math.sin(a) * to;
          ctx.strokeStyle = outward ? '#e9bc80' : '#86b9c7';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * from, cy + Math.sin(a) * from);
          ctx.lineTo(ex, ey);
          const direction = a + (outward ? 0 : Math.PI);
          ctx.moveTo(ex - 5 * Math.cos(direction - 0.5), ey - 5 * Math.sin(direction - 0.5));
          ctx.lineTo(ex, ey);
          ctx.lineTo(ex - 5 * Math.cos(direction + 0.5), ey - 5 * Math.sin(direction + 0.5));
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  const observer = new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  });
  observer.observe(canvas);
  return { draw, dispose: () => observer.disconnect() };
}
