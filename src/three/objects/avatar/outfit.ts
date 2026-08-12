import { Group, LatheGeometry, Mesh, SphereGeometry, TorusGeometry, Vector2 } from "three";
import { resources } from "../../../utils/resources";
import { createAccessoryMaterial, type SharedAvatarUniforms } from "./accessory-material";

import type { BufferGeometry, Material, Object3D, ShaderMaterial } from "three";

const DRESS_COLOR = 0xf36f98;
const DRESS_HIGHLIGHT = 0xffb2c7;
const TRIM_COLOR = 0xffc95f;

type OutfitInstance = {
  root: Group;
};

let solidOutfit: OutfitInstance | null = null;
let hologramOutfit: OutfitInstance | null = null;

const geometries = new Set<BufferGeometry>();
const materials = new Set<ShaderMaterial>();

const rememberGeometry = <T extends BufferGeometry>(geometry: T) => {
  geometries.add(geometry);
  return geometry;
};

const addMesh = (parent: Group, name: string, geometry: BufferGeometry, material: Material) => {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.renderOrder = 24;
  parent.add(mesh);
  return mesh;
};

const addSkirt = (root: Group, dressMaterial: ShaderMaterial, trimMaterial: ShaderMaterial) => {
  const skirtProfile = [
    new Vector2(0.44, 0),
    new Vector2(0.49, 0.12),
    new Vector2(0.56, 0.3),
    new Vector2(0.65, 0.55),
    new Vector2(0.7, 0.72),
    new Vector2(0.66, 0.78),
    new Vector2(0, 0.78),
  ];
  const skirt = addMesh(root, "avatar-skirt", rememberGeometry(new LatheGeometry(skirtProfile, 24)), dressMaterial);
  skirt.scale.z = 0.82;

  const waist = addMesh(
    root,
    "avatar-skirt-waist",
    rememberGeometry(new TorusGeometry(0.47, 0.055, 8, 24)),
    trimMaterial,
  );
  waist.position.y = 0.02;
  waist.rotation.x = Math.PI * 0.5;
  waist.scale.y = 0.8;
};

const addWaistBow = (root: Group, trimMaterial: ShaderMaterial) => {
  const bowGeometry = rememberGeometry(new SphereGeometry(1, 14, 10));

  ([-1, 1] as const).forEach((side) => {
    const loop = addMesh(
      root,
      side < 0 ? "avatar-waist-bow-left" : "avatar-waist-bow-right",
      bowGeometry,
      trimMaterial,
    );
    loop.position.set(side * 0.15, 0.03, -0.49);
    loop.rotation.z = side * -0.32;
    loop.scale.set(0.17, 0.11, 0.065);
  });

  const knot = addMesh(root, "avatar-waist-bow-knot", rememberGeometry(new SphereGeometry(1, 14, 10)), trimMaterial);
  knot.position.set(0, 0.03, -0.52);
  knot.scale.setScalar(0.085);
};

const createOutfit = (
  avatarMesh: Object3D,
  name: string,
  dressMaterial: ShaderMaterial,
  trimMaterial: ShaderMaterial,
) => {
  const hipsBone = avatarMesh.getObjectByName("hipsBone");
  if (!hipsBone) {
    console.warn(`${name} could not find hipsBone`);
    return null;
  }

  const root = new Group();
  root.name = name;
  addSkirt(root, dressMaterial, trimMaterial);
  addWaistBow(root, trimMaterial);
  hipsBone.add(root);

  return { root };
};

const init = (avatarMesh: Object3D, sharedUniforms: SharedAvatarUniforms) => {
  if (solidOutfit) return;

  const dressMaterial = createAccessoryMaterial({
    color: DRESS_COLOR,
    highlight: DRESS_HIGHLIGHT,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  const trimMaterial = createAccessoryMaterial({
    color: TRIM_COLOR,
    highlight: 0xffe0a0,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  materials.add(dressMaterial);
  materials.add(trimMaterial);

  solidOutfit = createOutfit(avatarMesh, "avatar-outfit", dressMaterial, trimMaterial);
};

const initHologram = (avatarMesh: Object3D, hologramMaterial: ShaderMaterial) => {
  if (hologramOutfit) return;
  hologramOutfit = createOutfit(avatarMesh, "avatar-outfit-hologram", hologramMaterial, hologramMaterial);
};

const destroy = () => {
  [solidOutfit, hologramOutfit].forEach((instance) => {
    instance?.root.removeFromParent();
    instance?.root.clear();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  geometries.clear();
  materials.clear();
  solidOutfit = null;
  hologramOutfit = null;
};

export const outfit = { init, initHologram, destroy };
