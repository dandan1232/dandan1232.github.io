import { CapsuleGeometry, Group, LatheGeometry, Mesh, SphereGeometry, TorusGeometry, Vector2 } from "three";
import { resources } from "../../../utils/resources";
import { createAccessoryMaterial, type SharedAvatarUniforms } from "./accessory-material";

import type { BufferGeometry, Material, Object3D, ShaderMaterial } from "three";

const DRESS_COLOR = 0xf36f98;
const DRESS_HIGHLIGHT = 0xffb2c7;
const DRESS_TRIM_COLOR = 0xd94d78;
const DRESS_LIGHT_COLOR = 0xffd8e3;

type OutfitMaterials = {
  dress: ShaderMaterial;
  trim: ShaderMaterial;
  light: ShaderMaterial;
  skin: ShaderMaterial;
};

type OutfitInstance = {
  roots: Group[];
  skirtGroup: Group;
};

let solidOutfit: OutfitInstance | null = null;
let hologramOutfit: OutfitInstance | null = null;

const geometries = new Set<BufferGeometry>();
const materials = new Set<ShaderMaterial>();

const rememberGeometry = <T extends BufferGeometry>(geometry: T) => {
  geometries.add(geometry);
  return geometry;
};

const addMesh = (parent: Object3D, name: string, geometry: BufferGeometry, material: Material) => {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.renderOrder = 24;
  parent.add(mesh);
  return mesh;
};

const addSkirt = (root: Group, materials: OutfitMaterials) => {
  const skirtGroup = new Group();
  skirtGroup.name = "avatar-skirt-group";
  root.add(skirtGroup);

  const skirtProfile = [
    new Vector2(0.44, 0),
    new Vector2(0.47, 0.12),
    new Vector2(0.54, 0.31),
    new Vector2(0.63, 0.55),
    new Vector2(0.72, 0.74),
    new Vector2(0.69, 0.8),
    new Vector2(0, 0.8),
  ];
  const skirt = addMesh(
    skirtGroup,
    "avatar-skirt",
    rememberGeometry(new LatheGeometry(skirtProfile, 28)),
    materials.dress,
  );
  skirt.scale.z = 0.82;

  const hemProfile = [
    new Vector2(0.65, 0.7),
    new Vector2(0.73, 0.76),
    new Vector2(0.76, 0.84),
    new Vector2(0.72, 0.9),
    new Vector2(0, 0.9),
  ];
  const hem = addMesh(
    skirtGroup,
    "avatar-skirt-underlay",
    rememberGeometry(new LatheGeometry(hemProfile, 28)),
    materials.light,
  );
  hem.scale.z = 0.82;

  const belt = addMesh(
    skirtGroup,
    "avatar-dress-belt",
    rememberGeometry(new TorusGeometry(0.455, 0.03, 10, 32)),
    materials.trim,
  );
  belt.rotation.x = Math.PI / 2;
  belt.scale.z = 0.82;

  return skirtGroup;
};

const addBodiceDetails = (root: Group, materials: OutfitMaterials) => {
  const detailGeometry = rememberGeometry(new SphereGeometry(1, 20, 14));

  ([-1, 1] as const).forEach((side) => {
    const collar = addMesh(root, `avatar-collar-${side < 0 ? "left" : "right"}`, detailGeometry, materials.light);
    collar.position.set(side * 0.16, 0.26, 0.29);
    collar.rotation.z = side * 0.18;
    collar.scale.set(0.21, 0.12, 0.045);
  });

  [0.11, -0.03].forEach((y, index) => {
    const button = addMesh(root, `avatar-dress-button-${index + 1}`, detailGeometry, materials.light);
    button.position.set(0, y, 0.315);
    button.scale.setScalar(0.055);
  });
};

const addPuffSleeve = (root: Group, side: -1 | 1, material: ShaderMaterial) => {
  const sleeve = addMesh(
    root,
    `avatar-puff-sleeve-${side < 0 ? "left" : "right"}`,
    rememberGeometry(new SphereGeometry(1, 20, 14)),
    material,
  );
  sleeve.position.y = 0.12;
  sleeve.scale.set(0.16, 0.18, 0.17);
};

const addBareLeg = (root: Group, name: string, radius: number, length: number, material: ShaderMaterial) => {
  const leg = addMesh(
    root,
    name,
    rememberGeometry(new CapsuleGeometry(radius, length, 8, 18)),
    material,
  );
  leg.position.y = length / 2 + radius;
};

const createOutfit = (avatarMesh: Object3D, name: string, materials: OutfitMaterials) => {
  const hipsBone = avatarMesh.getObjectByName("hipsBone");
  const spineBone = avatarMesh.getObjectByName("spine2Bone");
  const leftArmBone = avatarMesh.getObjectByName("leftArmBone");
  const rightArmBone = avatarMesh.getObjectByName("rightarmBone");
  const leftUpLegBone = avatarMesh.getObjectByName("leftUpLegBone");
  const rightUpLegBone = avatarMesh.getObjectByName("rightUpLegBone");
  const leftLegBone = avatarMesh.getObjectByName("leftLegBone");
  const rightLegBone = avatarMesh.getObjectByName("rightLegBone");
  if (
    !hipsBone ||
    !spineBone ||
    !leftArmBone ||
    !rightArmBone ||
    !leftUpLegBone ||
    !rightUpLegBone ||
    !leftLegBone ||
    !rightLegBone
  ) {
    console.warn(`${name} could not find the required outfit bones`);
    return null;
  }

  const hipsRoot = new Group();
  hipsRoot.name = `${name}-hips`;
  const skirtGroup = addSkirt(hipsRoot, materials);
  hipsBone.add(hipsRoot);

  const bodiceRoot = new Group();
  bodiceRoot.name = `${name}-bodice`;
  addBodiceDetails(bodiceRoot, materials);
  spineBone.add(bodiceRoot);

  const leftSleeveRoot = new Group();
  leftSleeveRoot.name = `${name}-left-sleeve`;
  addPuffSleeve(leftSleeveRoot, -1, materials.dress);
  leftArmBone.add(leftSleeveRoot);

  const rightSleeveRoot = new Group();
  rightSleeveRoot.name = `${name}-right-sleeve`;
  addPuffSleeve(rightSleeveRoot, 1, materials.dress);
  rightArmBone.add(rightSleeveRoot);

  const legRoots = [
    { bone: leftUpLegBone, name: "left-upper-leg", radius: 0.17, length: 0.51 },
    { bone: rightUpLegBone, name: "right-upper-leg", radius: 0.17, length: 0.51 },
    { bone: leftLegBone, name: "left-lower-leg", radius: 0.155, length: 0.62 },
    { bone: rightLegBone, name: "right-lower-leg", radius: 0.155, length: 0.62 },
  ].map(({ bone, name: legName, radius, length }) => {
    const legRoot = new Group();
    legRoot.name = `${name}-${legName}`;
    addBareLeg(legRoot, `${name}-${legName}-mesh`, radius, length, materials.skin);
    bone.add(legRoot);
    return legRoot;
  });

  return { roots: [hipsRoot, bodiceRoot, leftSleeveRoot, rightSleeveRoot, ...legRoots], skirtGroup };
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
    color: DRESS_TRIM_COLOR,
    highlight: DRESS_COLOR,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  const lightMaterial = createAccessoryMaterial({
    color: DRESS_LIGHT_COLOR,
    highlight: 0xfff0f4,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  const skinMaterial = createAccessoryMaterial({
    color: 0xffffff,
    highlight: 0xffffff,
    matcap: resources.items["matcap-skin"],
    sharedUniforms,
  });
  materials.add(dressMaterial);
  materials.add(trimMaterial);
  materials.add(lightMaterial);
  materials.add(skinMaterial);

  solidOutfit = createOutfit(avatarMesh, "avatar-outfit", {
    dress: dressMaterial,
    trim: trimMaterial,
    light: lightMaterial,
    skin: skinMaterial,
  });
};

const initHologram = (avatarMesh: Object3D, hologramMaterial: ShaderMaterial) => {
  if (hologramOutfit) return;
  hologramOutfit = createOutfit(avatarMesh, "avatar-outfit-hologram", {
    dress: hologramMaterial,
    trim: hologramMaterial,
    light: hologramMaterial,
    skin: hologramMaterial,
  });
};

const update = (standingProgress: number) => {
  if (!solidOutfit) return;

  // The desk chair surrounds the hips in the intro pose. Keep the rigid skirt
  // folded away until the chair has rotated clear and the avatar is standing.
  const reveal = Math.max(0, Math.min(1, (standingProgress - 0.45) / 0.4));
  const easedReveal = reveal * reveal * (3 - 2 * reveal);
  solidOutfit.skirtGroup.visible = easedReveal > 0.001;
  solidOutfit.skirtGroup.scale.setScalar(easedReveal);
};

const destroy = () => {
  [solidOutfit, hologramOutfit].forEach((instance) => {
    instance?.roots.forEach((root) => {
      root.removeFromParent();
      root.clear();
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  geometries.clear();
  materials.clear();
  solidOutfit = null;
  hologramOutfit = null;
};

export const outfit = { init, initHologram, update, destroy };
