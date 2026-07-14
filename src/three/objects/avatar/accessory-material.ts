import { Color, DoubleSide, LinearSRGBColorSpace, ShaderMaterial } from "three";
import vertexShader from "../../shaders/avatar-accessory/vertex.glsl";
import fragmentShader from "../../shaders/avatar-accessory/fragment.glsl";

import type { IUniform, Texture } from "three";

export type SharedAvatarUniforms = Record<"uProgress" | "uAmbientStrength", IUniform<number>>;

type MaterialOptions = {
  color: number;
  highlight?: number;
  matcap?: Texture;
  sharedUniforms: SharedAvatarUniforms;
};

export const createAccessoryMaterial = ({ color, highlight = color, matcap, sharedUniforms }: MaterialOptions) => {
  const uniforms: Record<string, IUniform> = {
    uColor: { value: new Color(color) },
    uHighlight: { value: new Color(highlight) },
    ...sharedUniforms,
  };

  if (matcap) {
    matcap.colorSpace = LinearSRGBColorSpace;
    matcap.generateMipmaps = false;
    uniforms.uMatcap = { value: matcap };
  }

  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    side: DoubleSide,
    defines: matcap ? { USE_MATCAP: "" } : undefined,
    uniforms,
  });
};
