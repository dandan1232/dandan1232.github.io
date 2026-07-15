import { Color, ShaderMaterial, DoubleSide, AdditiveBlending } from "three";
import vertexShader from "../../shaders/hologram/vertex.glsl";
import accessoryVertexShader from "../../shaders/hologram/accessory-vertex.glsl";
import fragmentShader from "../../shaders/hologram/fragment.glsl";

let material: ShaderMaterial;
let accessoryMaterial: ShaderMaterial;

const uniforms = {
  uTime: { value: 0 },
  uColor: { value: new Color("rgb(0, 234, 255)") },
  uProgress: { value: 0 },
};

const getMaterial = () => {
  if (material) return material;

  material = new ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms,
  });

  return material;
};

const getAccessoryMaterial = () => {
  if (accessoryMaterial) return accessoryMaterial;

  accessoryMaterial = new ShaderMaterial({
    vertexShader: accessoryVertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms,
  });

  return accessoryMaterial;
};

export { getMaterial, getAccessoryMaterial, uniforms };
