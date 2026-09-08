import { Color, ShaderMaterial, DoubleSide, AdditiveBlending, NoBlending } from "three";
import type { Material, Texture } from "three";
import vertexShader from "../../shaders/hologram/vertex.glsl";
import fragmentShader from "../../shaders/hologram/fragment.glsl";
import { SCAN_MAX_Y, SCAN_MIN_Y } from "./scan-progress";

const materials = new Map<Material, ShaderMaterial>();
const depthMaterials = new Map<Material, ShaderMaterial>();

const uniforms = {
  uTime: { value: 0 },
  uColor: { value: new Color("rgb(0, 234, 255)") },
  uProgress: { value: 0 },
  uScanMinY: { value: SCAN_MIN_Y },
  uScanMaxY: { value: SCAN_MAX_Y },
};

const getMaterial = (source: Material) => {
  const cached = materials.get(source);
  if (cached) return cached;
  const map = (source as Material & { map?: Texture }).map ?? null;

  const material = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      ...uniforms,
      uAlphaMap: { value: map },
      uUseAlphaMap: { value: Boolean(map && (source.transparent || source.alphaTest > 0)) },
      uAlphaCutoff: { value: source.alphaTest || 0.5 },
      uSurfaceStrength: { value: source.name.includes("_CLOTH") ? 0.16 : 0 },
    },
  });

  materials.set(source, material);
  return material;
};

// Garments establish their depth before any glowing surfaces are drawn. This
// keeps the projection translucent without drawing the body through the dress.
const getDepthMaterial = (source: Material) => {
  const cached = depthMaterials.get(source);
  if (cached) return cached;
  const surface = getMaterial(source);
  const material = surface.clone();
  material.uniforms = surface.uniforms;
  material.colorWrite = false;
  material.depthWrite = true;
  material.blending = NoBlending;
  material.forceSinglePass = true;
  depthMaterials.set(source, material);
  return material;
};

const dispose = () => {
  for (const material of [...materials.values(), ...depthMaterials.values()]) material.dispose();
  materials.clear();
  depthMaterials.clear();
};

export { getMaterial, getDepthMaterial, dispose, uniforms };
