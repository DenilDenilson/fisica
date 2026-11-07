import * as T from 'three/webgpu';
import { float, length, positionLocal, smoothstep } from 'three/tsl';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Element } from './catalogue';

// A small shared geometry vocabulary, with element-specific materials and forms.
export class SampleFactory {
  private geometries = new Map<string, T.BufferGeometry>();
  private materials = new Map<string, T.MeshPhysicalMaterial>();
  private textures: T.Texture[] = [];
  private gases = new Map<string, T.MeshBasicNodeMaterial>();

  private geometry(kind: string, detail: boolean) {
    const key = kind + detail;
    if (this.geometries.has(key)) return this.geometries.get(key)!;
    let geometry: T.BufferGeometry;
    if (kind === 'mercury') {
      geometry = new T.SphereGeometry(0.48, detail ? 64 : 16, detail ? 32 : 12);
      geometry.scale(1.12, 0.58, 0.9);
    } else if (kind === 'liquid') {
      geometry = new T.CylinderGeometry(0.47, 0.43, 0.48, detail ? 64 : 16);
    } else if (kind === 'gas') {
      geometry = new T.BoxGeometry(0.98, 0.9, 0.8);
    } else if (kind === 'graphite') {
      geometry = new T.BoxGeometry(0.9, 0.1, 0.58);
    } else if (kind === 'crystal') {
      geometry = new T.OctahedronGeometry(0.53, 0);
      geometry.scale(0.85, 1.28, 0.7);
    } else if (kind === 'unknown') {
      geometry = new T.TorusGeometry(0.38, 0.008, 4, 40);
    } else {
      geometry = new T.IcosahedronGeometry(0.55, detail ? 5 : 0);
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const f = 1 + 0.22 * Math.sin(x * 9 + y * 5) * Math.cos(z * 8 - x * 3) + 0.09 * Math.cos(y * 21 + z * 17);
        pos.setXYZ(i, x * f * 1.1, y * f * 0.73, z * f * 0.88);
      }
      if (detail) {
        geometry.deleteAttribute('normal');
        geometry = mergeVertices(geometry);
      }
      geometry.computeVertexNormals();
    }
    this.geometries.set(key, geometry);
    return geometry;
  }
  private texture(graphite: boolean) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const pixels = ctx.createImageData(128, 128);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const x = (i / 4) % 128, y = Math.floor(i / 512);
      const n = graphite ? 115 + 65 * Math.sin(y * 0.9) + 15 * Math.sin(x * 0.3) : 125 + 30 * Math.sin(x * 11.3 + y * 7.7) * Math.cos(x * 3.1 - y * 2.7);
      pixels.data.set([n, n, n, 255], i);
    }
    ctx.putImageData(pixels, 0, 0);
    const texture = new T.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    this.textures.push(texture);
    return texture;
  }
  create(element: Element, detail = false) {
    const root = new T.Group();
    const v = element.visual;
    const key = element.symbol + detail;
    if (v.kind === 'gas') {
      let gas = this.gases.get(element.symbol);
      if (!gas) {
        gas = new T.MeshBasicNodeMaterial({ color: v.color, transparent: true, depthWrite: false, side: T.DoubleSide });
        gas.opacityNode = float([9, 17].includes(element.number) ? 0.2 : 0.035)
          .mul(smoothstep(float(0.72), float(0.12), length(positionLocal)));
        this.gases.set(element.symbol, gas);
      }
      for (const scale of [1, 0.78, 0.55]) {
        const volume = new T.Mesh(this.geometry('gas', detail), gas);
        volume.scale.setScalar(scale); root.add(volume);
      }
      return root;
    }
    let material = this.materials.get(key);
    if (!material) {
      material = new T.MeshPhysicalMaterial({
        color: v.color, metalness: v.metalness, roughness: v.roughness,
        flatShading: v.kind === 'crystal' || v.kind === 'powder' || (!detail && v.kind === 'metal'),
        clearcoat: v.kind === 'mercury' ? 1 : 0,
        clearcoatRoughness: 0.04,
      });
      if (v.kind === 'gas') {
        material.transparent = true;
        material.opacity = [9, 17].includes(element.number) ? 0.24 : 0.045;
        material.depthWrite = false;
        material.roughness = 1;
      }
      if (v.kind === 'liquid') {
        material.transmission = detail ? 0.24 : 0;
        material.ior = 1.66;
        material.thickness = 0.8;
        material.roughness = 0.09;
        material.attenuationColor = new T.Color('#5c1005');
        material.attenuationDistance = 0.6;
      }
      if (element.number === 16) {
        material.transmission = detail ? 0.15 : 0;
        material.thickness = 0.25;
        material.ior = 1.95;
      }
      if (detail && !['gas', 'unknown', 'liquid', 'mercury'].includes(v.kind)) {
        material.bumpMap = this.texture(v.kind === 'graphite');
        material.bumpScale = v.kind === 'graphite' ? 0.035 : 0.007;
      }
      this.materials.set(key, material);
    }
    const count = v.kind === 'graphite' ? (detail ? 7 : 4) : v.kind === 'crystal' ? (detail ? 5 : 3) : 1;
    for (let i = 0; i < count; i++) {
      const mesh = new T.Mesh(this.geometry(v.kind, detail), material);
      if (v.kind === 'graphite') {
        mesh.position.set(Math.sin(i * 3) * 0.06, i * 0.09 - 0.25, 0);
        mesh.rotation.y = i * 0.07;
      } else if (v.kind === 'crystal') {
        mesh.scale.setScalar(i === 0 ? 0.9 : 0.45 + i * 0.06);
        mesh.position.set(i === 0 ? 0 : Math.sin(i * 2.4) * 0.3, i === 0 ? 0 : -0.2, Math.cos(i * 2.4) * 0.2);
        mesh.rotation.z = (i - 1) * 0.23;
        if (element.number === 83) mesh.rotation.y = i * 0.5;
      } else if (v.kind === 'mercury' || v.kind === 'liquid') mesh.position.y = -0.23;
      else if (v.kind === 'metal') mesh.rotation.set(0.2, element.number * 0.73, 0.12);
      root.add(mesh);
    }
    if (v.kind === 'unknown') {
      // A measurement placeholder, deliberately not a fabricated material specimen.
      const second = root.children[0].clone();
      second.rotation.y = Math.PI / 2;
      root.add(second);
    }
    return root;
  }
  dispose() {
    this.gases.forEach(m => m.dispose());
    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.textures.forEach(t => t.dispose());
  }
}
