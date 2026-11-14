import { sampleHydrogen, type Glyph, type HydrogenState, type Particle } from './sequence';

const colors: Record<Glyph, string> = {
  p: '#e6b985', n: '#8bacc3', u: '#edc789', d: '#9fbfce',
  'e⁻': '#91cfc5', 'e⁺': '#e4acba', 'νₑ': '#bab2dc', 'ν̅ₑ': '#bab2dc',
  'γ': '#e1cf99', cloud: '#91cfc5',
};

export function createHydrogenRenderer(canvas: HTMLCanvasElement, state: HydrogenState) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx = context;
  let width = 1, height = 1;

  function glow(x: number, y: number, radius: number, color: string, opacity: number) {
    ctx.save();
    ctx.globalAlpha *= opacity;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color + '65');
    gradient.addColorStop(0.4, color + '25');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function wave(x: number, y: number, size: number, wavelength: number, opacity: number) {
    ctx.save(); ctx.globalAlpha *= opacity;
    ctx.strokeStyle = colors['γ']; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const px = i / 48 * size;
      const py = Math.sin(px / wavelength * Math.PI * 2) * size * 0.055;
      if (!i) ctx.moveTo(x + px, y + py); else ctx.lineTo(x + px, y + py);
    }
    ctx.stroke(); ctx.restore();
  }

  function glyph(p: Particle, cx: number, cy: number, scale: number) {
    if (p.opacity < 0.002) return;
    const x = cx + p.x * scale, y = cy + p.y * scale;
    const radius = p.radius * scale;
    const color = colors[p.kind];
    ctx.save(); ctx.globalAlpha = p.opacity;
    if (p.kind === 'cloud') {
      // A soft probability density, with no orbit or circling electron.
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloud.addColorStop(0, '#91cfc518'); cloud.addColorStop(0.23, '#91cfc53b');
      cloud.addColorStop(0.6, '#91cfc51a'); cloud.addColorStop(1, '#91cfc500');
      ctx.fillStyle = cloud;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      // Deterministic stippling samples the diffuse density; these are not many electrons.
      ctx.fillStyle = '#b3e4da';
      for (let i = 0; i < 420; i++) {
        const angle = i * 2.399963;
        const r = Math.sqrt(((i * 73) % 419) / 419) * radius;
        ctx.globalAlpha = p.opacity * Math.exp(-r / radius * 3.8) * 0.5;
        ctx.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1.1, 1.1);
      }
    } else if (p.kind === 'γ') {
      glow(x, y, radius * 3, color, 0.4);
      wave(x - radius * 1.7, y, radius * 3.4, radius * 0.85, 1);
      ctx.fillStyle = color; ctx.font = '13px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('γ', x, y + radius + 12);
    } else {
      const nucleon = p.kind === 'p' || p.kind === 'n';
      const quark = p.kind === 'u' || p.kind === 'd';
      const neutrino = p.kind.includes('ν');
      glow(x, y, radius * (nucleon ? 4.8 : 3), color, nucleon ? 0.6 : 0.35);
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = nucleon ? color + '22' : color + '18'; ctx.fill();
      ctx.strokeStyle = color + (neutrino ? '99' : 'cc'); ctx.lineWidth = nucleon ? 1.3 : 1;
      if (neutrino) ctx.setLineDash([3, 3]);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${quark ? Math.max(9, radius * 1.1) : Math.max(12, radius * 0.95)}px Georgia`;
      const constituents = state.phase > 0.5 && state.phase < 1.12 && nucleon;
      ctx.fillText(p.kind, x, constituents ? y + radius + 17 : y + 1);
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const phase = state.phase;
    const cx = width * 0.5, cy = height * 0.43;
    const scale = Math.min(width * 0.4, height * 0.47);
    // A local patch expands throughout the story. It is not a finite cosmic bubble.
    const spacing = 30 + phase * 3.7;
    ctx.strokeStyle = '#8ba7bb0d'; ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = -12; i <= 12; i++) {
      ctx.moveTo(cx + i * spacing, 0); ctx.lineTo(cx + i * spacing, height);
      ctx.moveTo(0, cy + i * spacing); ctx.lineTo(width, cy + i * spacing);
    }
    ctx.stroke();
    const warmth = Math.max(0, 1 - phase / 10);
    glow(cx, cy, scale * 1.7, warmth > 0.5 ? '#cd9565' : '#679ab4', 0.18 + warmth * 0.23);

    // Radiation is schematic, never a star field. Increasing wavelength suggests cooling.
    const radiationOpacity = phase > 9 ? Math.max(0, (10.4 - phase) / 1.4) : 1;
    for (let i = 0; i < 19; i++) {
      const x = (((i * 137 + 57) % 997) / 997 - 0.5) * width * 1.4 + cx;
      const y = (((i * 223 + 93) % 991) / 991 - 0.5) * height * 1.3 + cy;
      // Clear the immediate foreground so reaction trajectories remain readable.
      if (Math.hypot((x - cx) / scale, (y - cy) / scale) < 1.03) continue;
      wave(x, y, 20 + phase * 1.6, 4 + phase * 1.2, 0.18 * radiationOpacity);
    }
    const particles = sampleHydrogen(phase);
    const cloud = particles.find(p => p.kind === 'cloud');
    if (cloud) glyph(cloud, cx, cy, scale);
    // Nucleons are painted first so their confined quarks remain visible.
    for (const p of particles.filter(p => p.kind === 'p' || p.kind === 'n')) glyph(p, cx, cy, scale);
    for (const p of particles.filter(p => !['p', 'n', 'cloud'].includes(p.kind))) glyph(p, cx, cy, scale);
    if (phase >= 7.8 && phase <= 8.1) {
      ctx.globalAlpha = Math.max(0, 1 - Math.abs(phase - 8) * 5);
      ctx.font = `${width < 400 ? 11 : 13}px Georgia`; ctx.textAlign = 'center'; ctx.fillStyle = '#c6cfd4';
      ctx.fillText('12 núcleos de ¹H', cx - scale * 0.39, cy + scale * 0.62);
      ctx.fillText('1 núcleo de ⁴He', cx + scale * 0.65, cy + scale * 0.62);
      ctx.globalAlpha = 1;
    }
  }

  const observer = new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  });
  observer.observe(canvas);
  return { draw, dispose: () => observer.disconnect() };
}
