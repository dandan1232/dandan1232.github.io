import { CatmullRomCurve3, Group, Mesh, SphereGeometry, TorusGeometry, TubeGeometry, Vector3 } from "three";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { createAccessoryMaterial, type SharedAvatarUniforms } from "./accessory-material";

import type { Material, Object3D, ShaderMaterial } from "three";

const HAIR_COLOR = 0x704638;
const HAIR_TIE_COLOR = 0xffc95f;

type HairInstance = {
  root: Group;
  leftPonytail: Group;
  rightPonytail: Group;
};

let solidHair: HairInstance | null = null;
let hologramHair: HairInstance | null = null;
let isTicking = false;

const geometries = new Set<SphereGeometry | TorusGeometry | TubeGeometry>();
const materials = new Set<ShaderMaterial>();

const rememberGeometry = <T extends SphereGeometry | TorusGeometry | TubeGeometry>(geometry: T) => {
  geometries.add(geometry);
  return geometry;
};

const addMesh = (
  parent: Group,
  name: string,
  geometry: SphereGeometry | TorusGeometry | TubeGeometry,
  material: Material,
) => {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.renderOrder = 24;
  parent.add(mesh);
  return mesh;
};

const addHairCap = (parent: Group, material: ShaderMaterial) => {
  const center = new Vector3(0, 0.31, -0.08);

  const back = addMesh(
    parent,
    "hair-back-cap",
    rememberGeometry(new SphereGeometry(0.75, 40, 20, Math.PI, Math.PI, 0, 2.18)),
    material,
  );
  back.position.copy(center);
  back.scale.set(1, 1.02, 1.02);

  const crown = addMesh(
    parent,
    "hair-crown",
    rememberGeometry(new SphereGeometry(0.735, 40, 18, 0, Math.PI * 2, 0, 1.22)),
    material,
  );
  crown.position.copy(center);
  crown.scale.set(1, 1.03, 1.02);

  const sideShells = [
    { name: "hair-side-shell-left", phiStart: 0 },
    { name: "hair-side-shell-right", phiStart: Math.PI - 0.95 },
  ] as const;

  sideShells.forEach(({ name, phiStart }) => {
    const shell = addMesh(
      parent,
      name,
      rememberGeometry(new SphereGeometry(0.755, 24, 14, phiStart, 0.95, 0.88, 0.86)),
      material,
    );
    shell.position.copy(center);
    shell.scale.set(1, 1.03, 1.02);
  });
};

const addBangs = (parent: Group, material: ShaderMaterial) => {
  const bangGeometry = rememberGeometry(new SphereGeometry(1, 20, 12));
  const bangs = [
    { x: -0.29, y: 0.45, rotation: -0.12, scale: [0.27, 0.18, 0.065] },
    { x: 0, y: 0.43, rotation: 0, scale: [0.23, 0.17, 0.07] },
    { x: 0.29, y: 0.45, rotation: 0.12, scale: [0.27, 0.18, 0.065] },
  ] as const;

  bangs.forEach((bang, index) => {
    const mesh = addMesh(parent, `hair-bang-${index + 1}`, bangGeometry, material);
    mesh.position.set(bang.x, bang.y, 0.475);
    mesh.rotation.z = bang.rotation;
    mesh.scale.set(bang.scale[0], bang.scale[1], bang.scale[2]);
  });
};

const createTube = (parent: Group, name: string, points: Vector3[], radius: number, material: ShaderMaterial) =>
  addMesh(
    parent,
    name,
    rememberGeometry(new TubeGeometry(new CatmullRomCurve3(points), 24, radius, 10, false)),
    material,
  );

const addFaceFramingLocks = (parent: Group, material: ShaderMaterial) => {
  ([-1, 1] as const).forEach((side) => {
    createTube(
      parent,
      side < 0 ? "hair-face-lock-left" : "hair-face-lock-right",
      [
        new Vector3(side * 0.49, 0.61, 0.27),
        new Vector3(side * 0.55, 0.18, 0.37),
        new Vector3(side * 0.51, -0.2, 0.31),
      ],
      0.052,
      material,
    );
  });
};

const addPonytail = (parent: Group, side: -1 | 1, hairMaterial: ShaderMaterial, tieMaterial: ShaderMaterial) => {
  const pivot = new Group();
  pivot.name = side < 0 ? "hair-ponytail-left" : "hair-ponytail-right";
  pivot.position.set(side * 0.59, 0.34, -0.39);
  parent.add(pivot);

  createTube(
    pivot,
    `${pivot.name}-main`,
    [
      new Vector3(0, 0, 0),
      new Vector3(side * 0.12, -0.17, -0.05),
      new Vector3(side * 0.17, -0.52, -0.08),
      new Vector3(side * 0.1, -0.88, -0.01),
    ],
    0.105,
    hairMaterial,
  );

  const tip = addMesh(pivot, `${pivot.name}-tip`, rememberGeometry(new SphereGeometry(1, 14, 10)), hairMaterial);
  tip.position.set(side * 0.1, -0.88, -0.01);
  tip.scale.set(0.105, 0.145, 0.105);

  const tie = addMesh(pivot, `${pivot.name}-tie`, rememberGeometry(new TorusGeometry(0.09, 0.028, 8, 20)), tieMaterial);
  tie.position.z = 0.035;

  const bowGeometry = rememberGeometry(new SphereGeometry(1, 12, 8));
  ([-1, 1] as const).forEach((direction) => {
    const bow = addMesh(pivot, `${pivot.name}-bow-${direction < 0 ? "left" : "right"}`, bowGeometry, tieMaterial);
    bow.position.set(direction * 0.105, 0.01, 0.04);
    bow.rotation.z = direction * 0.28;
    bow.scale.set(0.09, 0.055, 0.04);
  });

  return pivot;
};

const tick = () => {
  const time = gsap.ticker.time;
  [solidHair, hologramHair].forEach((instance) => {
    if (!instance) return;
    instance.leftPonytail.rotation.z = Math.sin(time * 1.55) * 0.035;
    instance.leftPonytail.rotation.x = Math.sin(time * 1.2 + 0.5) * 0.018;
    instance.rightPonytail.rotation.z = -Math.sin(time * 1.55 + 0.35) * 0.035;
    instance.rightPonytail.rotation.x = Math.sin(time * 1.2 + 0.85) * 0.018;
  });
};

const createHair = (avatarMesh: Object3D, name: string, hairMaterial: ShaderMaterial, tieMaterial: ShaderMaterial) => {
  const headBone = avatarMesh.getObjectByName("headBone");
  if (!headBone) {
    console.warn(`${name} could not find headBone`);
    return null;
  }

  const root = new Group();
  root.name = name;

  addHairCap(root, hairMaterial);
  addBangs(root, hairMaterial);
  addFaceFramingLocks(root, hairMaterial);
  const leftPonytail = addPonytail(root, -1, hairMaterial, tieMaterial);
  const rightPonytail = addPonytail(root, 1, hairMaterial, tieMaterial);

  headBone.add(root);
  if (!isTicking) {
    gsap.ticker.add(tick);
    isTicking = true;
  }

  return { root, leftPonytail, rightPonytail };
};

const init = (avatarMesh: Object3D, sharedUniforms: SharedAvatarUniforms) => {
  if (solidHair) return;

  const hairMaterial = createAccessoryMaterial({
    color: HAIR_COLOR,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  const tieMaterial = createAccessoryMaterial({
    color: HAIR_TIE_COLOR,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  materials.add(hairMaterial);
  materials.add(tieMaterial);

  solidHair = createHair(avatarMesh, "avatar-hair", hairMaterial, tieMaterial);
};

const initHologram = (avatarMesh: Object3D, hologramMaterial: ShaderMaterial) => {
  if (hologramHair) return;
  hologramHair = createHair(avatarMesh, "avatar-hair-hologram", hologramMaterial, hologramMaterial);
};

const destroy = () => {
  if (isTicking) {
    gsap.ticker.remove(tick);
    isTicking = false;
  }
  [solidHair, hologramHair].forEach((instance) => {
    instance?.root.removeFromParent();
    instance?.root.clear();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  geometries.clear();
  materials.clear();
  solidHair = null;
  hologramHair = null;
};

export const hair = { init, initHologram, destroy };
