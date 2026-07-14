import { CatmullRomCurve3, Group, Mesh, SphereGeometry, TorusGeometry, TubeGeometry, Vector3 } from "three";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { createAccessoryMaterial, type SharedAvatarUniforms } from "./accessory-material";

import type { Material, Object3D, ShaderMaterial } from "three";

const HAIR_TIE_COLOR = 0xff9fba;

let root: Group | null = null;
let leftPonytail: Group | null = null;
let rightPonytail: Group | null = null;

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
    { x: -0.31, y: 0.47, rotation: -0.12, scale: [0.3, 0.2, 0.075] },
    { x: 0, y: 0.45, rotation: 0, scale: [0.25, 0.19, 0.08] },
    { x: 0.31, y: 0.47, rotation: 0.12, scale: [0.3, 0.2, 0.075] },
  ] as const;

  bangs.forEach((bang, index) => {
    const mesh = addMesh(parent, `hair-bang-${index + 1}`, bangGeometry, material);
    mesh.position.set(bang.x, bang.y, 0.493);
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
        new Vector3(side * 0.51, 0.65, 0.28),
        new Vector3(side * 0.59, 0.2, 0.39),
        new Vector3(side * 0.55, -0.26, 0.32),
      ],
      0.065,
      material,
    );
  });
};

const addPonytail = (parent: Group, side: -1 | 1, hairMaterial: ShaderMaterial, tieMaterial: ShaderMaterial) => {
  const pivot = new Group();
  pivot.name = side < 0 ? "hair-ponytail-left" : "hair-ponytail-right";
  pivot.position.set(side * 0.63, 0.35, -0.45);
  parent.add(pivot);

  createTube(
    pivot,
    `${pivot.name}-main`,
    [
      new Vector3(0, 0, 0),
      new Vector3(side * 0.15, -0.18, -0.06),
      new Vector3(side * 0.21, -0.58, -0.09),
      new Vector3(side * 0.14, -1.03, -0.01),
    ],
    0.13,
    hairMaterial,
  );

  const tip = addMesh(pivot, `${pivot.name}-tip`, rememberGeometry(new SphereGeometry(1, 14, 10)), hairMaterial);
  tip.position.set(side * 0.14, -1.03, -0.01);
  tip.scale.set(0.13, 0.17, 0.13);

  const tie = addMesh(
    pivot,
    `${pivot.name}-tie`,
    rememberGeometry(new TorusGeometry(0.105, 0.033, 8, 20)),
    tieMaterial,
  );
  tie.position.z = 0.035;

  const bowGeometry = rememberGeometry(new SphereGeometry(1, 12, 8));
  ([-1, 1] as const).forEach((direction) => {
    const bow = addMesh(pivot, `${pivot.name}-bow-${direction < 0 ? "left" : "right"}`, bowGeometry, tieMaterial);
    bow.position.set(direction * 0.125, 0.01, 0.04);
    bow.rotation.z = direction * 0.28;
    bow.scale.set(0.105, 0.062, 0.045);
  });

  return pivot;
};

const tick = () => {
  const time = gsap.ticker.time;
  if (leftPonytail) {
    leftPonytail.rotation.z = Math.sin(time * 1.55) * 0.035;
    leftPonytail.rotation.x = Math.sin(time * 1.2 + 0.5) * 0.018;
  }
  if (rightPonytail) {
    rightPonytail.rotation.z = -Math.sin(time * 1.55 + 0.35) * 0.035;
    rightPonytail.rotation.x = Math.sin(time * 1.2 + 0.85) * 0.018;
  }
};

const init = (avatarMesh: Object3D, sharedUniforms: SharedAvatarUniforms) => {
  if (root) return;
  const headBone = avatarMesh.getObjectByName("headBone");
  if (!headBone) {
    console.warn("Avatar hair could not find headBone");
    return;
  }

  root = new Group();
  root.name = "avatar-hair";

  const hairMaterial = createAccessoryMaterial({
    color: 0xffffff,
    matcap: resources.items["matcap-black"],
    sharedUniforms,
  });
  const tieMaterial = createAccessoryMaterial({
    color: HAIR_TIE_COLOR,
    matcap: resources.items["matcap-white"],
    sharedUniforms,
  });
  materials.add(hairMaterial);
  materials.add(tieMaterial);

  addHairCap(root, hairMaterial);
  addBangs(root, hairMaterial);
  addFaceFramingLocks(root, hairMaterial);
  leftPonytail = addPonytail(root, -1, hairMaterial, tieMaterial);
  rightPonytail = addPonytail(root, 1, hairMaterial, tieMaterial);

  headBone.add(root);
  gsap.ticker.add(tick);
};

const destroy = () => {
  gsap.ticker.remove(tick);
  root?.removeFromParent();
  root?.clear();
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  geometries.clear();
  materials.clear();
  root = null;
  leftPonytail = null;
  rightPonytail = null;
};

export const hair = { init, destroy };
