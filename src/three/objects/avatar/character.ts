import {
  CapsuleGeometry,
  CircleGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  Vector2,
  Vector3,
} from "three";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { createAccessoryMaterial, type SharedAvatarUniforms } from "./accessory-material";

import type { BufferGeometry, Material, Object3D, ShaderMaterial } from "three";

type CharacterMaterials = {
  skin: ShaderMaterial;
  skinWarm: ShaderMaterial;
  blush: ShaderMaterial;
  hair: ShaderMaterial;
  hairSoft: ShaderMaterial;
  eyeWhite: ShaderMaterial;
  iris: ShaderMaterial;
  pupil: ShaderMaterial;
  eyeLight: ShaderMaterial;
  mouth: ShaderMaterial;
  tongue: ShaderMaterial;
  dress: ShaderMaterial;
  dressDark: ShaderMaterial;
  dressLight: ShaderMaterial;
  sock: ShaderMaterial;
  shoe: ShaderMaterial;
  sole: ShaderMaterial;
};

type CharacterInstance = {
  roots: Group[];
  skirt: Group;
  leftPonytail: Group;
  rightPonytail: Group;
};

let solidCharacter: CharacterInstance | null = null;
let hologramCharacter: CharacterInstance | null = null;
let isTicking = false;

const geometries = new Set<BufferGeometry>();
const materials = new Set<ShaderMaterial>();

const rememberGeometry = <T extends BufferGeometry>(geometry: T) => {
  geometries.add(geometry);
  return geometry;
};

const addMesh = (
  parent: Object3D,
  name: string,
  geometry: BufferGeometry,
  material: Material,
  renderOrder = 24,
) => {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.renderOrder = renderOrder;
  parent.add(mesh);
  return mesh;
};

const addEllipsoid = (
  parent: Object3D,
  name: string,
  position: [number, number, number],
  scale: [number, number, number],
  material: Material,
  renderOrder = 24,
) => {
  const mesh = addMesh(
    parent,
    name,
    rememberGeometry(new SphereGeometry(1, 32, 22)),
    material,
    renderOrder,
  );
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return mesh;
};

const addCapsule = (
  parent: Object3D,
  name: string,
  radius: number,
  segmentLength: number,
  material: Material,
) => {
  const mesh = addMesh(
    parent,
    name,
    rememberGeometry(new CapsuleGeometry(radius, segmentLength, 10, 20)),
    material,
  );
  mesh.position.y = segmentLength / 2 + radius;
  return mesh;
};

const addHead = (headBone: Object3D, name: string, m: CharacterMaterials) => {
  const root = new Group();
  root.name = `${name}-head`;
  headBone.add(root);

  addEllipsoid(root, `${name}-hair-back`, [0, 0.34, -0.12], [0.79, 0.73, 0.7], m.hair);
  addEllipsoid(root, `${name}-face`, [0, 0.27, 0.05], [0.68, 0.62, 0.6], m.skin, 25);

  ([-1, 1] as const).forEach((side) => {
    addEllipsoid(root, `${name}-ear-${side}`, [side * 0.65, 0.26, 0.04], [0.115, 0.16, 0.09], m.skinWarm, 25);
  });

  const bangGeometry = rememberGeometry(new SphereGeometry(1, 26, 18));
  const bangs = [
    [-0.46, 0.57, -0.15, 0.24, 0.31],
    [-0.24, 0.63, -0.08, 0.25, 0.36],
    [0, 0.66, 0, 0.25, 0.38],
    [0.24, 0.63, 0.08, 0.25, 0.36],
    [0.46, 0.57, 0.15, 0.24, 0.31],
  ] as const;
  bangs.forEach(([x, y, rotation, sx, sy], index) => {
    const bang = addMesh(root, `${name}-bang-${index}`, bangGeometry, m.hair, 27);
    bang.position.set(x, y, 0.57);
    bang.rotation.z = rotation;
    bang.scale.set(sx, sy, 0.085);
  });

  ([-1, 1] as const).forEach((side) => {
    const lock = addEllipsoid(
      root,
      `${name}-face-lock-${side}`,
      [side * 0.56, 0.16, 0.48],
      [0.11, 0.34, 0.09],
      m.hair,
      27,
    );
    lock.rotation.z = side * -0.08;
  });

  const eyeGeometry = rememberGeometry(new SphereGeometry(1, 26, 18));
  ([-1, 1] as const).forEach((side) => {
    const eye = addMesh(root, `${name}-eye-${side}`, eyeGeometry, m.eyeWhite, 28);
    eye.position.set(side * 0.235, 0.29, 0.638);
    eye.scale.set(0.15, 0.17, 0.055);

    const iris = addMesh(root, `${name}-iris-${side}`, eyeGeometry, m.iris, 29);
    iris.position.set(side * 0.225, 0.282, 0.683);
    iris.scale.set(0.092, 0.108, 0.045);

    const pupil = addMesh(root, `${name}-pupil-${side}`, eyeGeometry, m.pupil, 30);
    pupil.position.set(side * 0.222, 0.276, 0.716);
    pupil.scale.set(0.036, 0.057, 0.025);

    addEllipsoid(
      root,
      `${name}-eye-highlight-${side}`,
      [side * 0.19, 0.335, 0.742],
      [0.025, 0.035, 0.014],
      m.eyeLight,
      31,
    );

    const brow = addEllipsoid(
      root,
      `${name}-brow-${side}`,
      [side * 0.24, 0.5, 0.65],
      [0.13, 0.025, 0.022],
      m.hairSoft,
      29,
    );
    brow.rotation.z = side * -0.08;

    [0.34, 0.39].forEach((y, lashIndex) => {
      const lash = addEllipsoid(
        root,
        `${name}-lash-${side}-${lashIndex}`,
        [side * (0.36 + lashIndex * 0.018), y, 0.674],
        [0.055, 0.012, 0.012],
        m.hairSoft,
        30,
      );
      lash.rotation.z = side * (0.25 + lashIndex * 0.18);
    });

    addEllipsoid(
      root,
      `${name}-blush-${side}`,
      [side * 0.42, 0.105, 0.618],
      [0.085, 0.042, 0.018],
      m.blush,
      28,
    );
  });

  addEllipsoid(root, `${name}-nose`, [0, 0.16, 0.671], [0.027, 0.022, 0.018], m.skinWarm, 29);

  const smileShape = new Shape();
  smileShape.moveTo(-0.14, 0.035);
  smileShape.quadraticCurveTo(0, -0.008, 0.14, 0.035);
  smileShape.quadraticCurveTo(0.105, -0.095, 0, -0.11);
  smileShape.quadraticCurveTo(-0.105, -0.095, -0.14, 0.035);
  const mouth = addMesh(root, `${name}-mouth`, rememberGeometry(new ShapeGeometry(smileShape, 8)), m.mouth, 30);
  mouth.position.set(0, 0.035, 0.665);
  const tongue = addMesh(root, `${name}-tongue`, rememberGeometry(new CircleGeometry(1, 24)), m.tongue, 31);
  tongue.position.set(0, -0.048, 0.669);
  tongue.scale.set(0.07, 0.026, 1);

  const ahoge = addMesh(
    root,
    `${name}-ahoge`,
    rememberGeometry(
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0, 1.02, -0.06),
          new Vector3(-0.035, 1.18, -0.02),
          new Vector3(0.055, 1.25, 0.02),
        ]),
        18,
        0.022,
        8,
        false,
      ),
    ),
    m.hair,
    27,
  );
  ahoge.scale.setScalar(1);

  const ponytails = ([-1, 1] as const).map((side) => {
    const ponytail = new Group();
    ponytail.name = `${name}-ponytail-${side < 0 ? "left" : "right"}`;
    root.add(ponytail);

    addEllipsoid(ponytail, `${ponytail.name}-tie`, [side * 0.69, 0.35, 0], [0.13, 0.13, 0.11], m.dress);
    const upper = addEllipsoid(
      ponytail,
      `${ponytail.name}-upper`,
      [side * 0.82, 0.12, -0.06],
      [0.24, 0.36, 0.21],
      m.hair,
    );
    upper.rotation.z = side * -0.23;
    const lower = addEllipsoid(
      ponytail,
      `${ponytail.name}-lower`,
      [side * 0.9, -0.23, -0.035],
      [0.22, 0.36, 0.2],
      m.hair,
    );
    lower.rotation.z = side * 0.16;
    const curl = addEllipsoid(
      ponytail,
      `${ponytail.name}-curl`,
      [side * 0.78, -0.49, 0.055],
      [0.2, 0.23, 0.18],
      m.hair,
    );
    curl.rotation.z = side * 0.52;
    return ponytail;
  });

  return { root, leftPonytail: ponytails[0]!, rightPonytail: ponytails[1]! };
};

const addTorso = (spineBone: Object3D, name: string, m: CharacterMaterials) => {
  const root = new Group();
  root.name = `${name}-torso`;
  spineBone.add(root);

  addEllipsoid(root, `${name}-bodice`, [0, -0.19, 0.04], [0.48, 0.43, 0.32], m.dress);
  ([-1, 1] as const).forEach((side) => {
    const collar = addEllipsoid(
      root,
      `${name}-collar-${side}`,
      [side * 0.15, 0.12, 0.31],
      [0.2, 0.105, 0.045],
      m.dressLight,
      27,
    );
    collar.rotation.z = side * 0.18;
  });
  [0.01, -0.13].forEach((y, index) => {
    addEllipsoid(root, `${name}-button-${index}`, [0, y, 0.355], [0.052, 0.052, 0.035], m.dressLight, 28);
  });
  return root;
};

const addSkirt = (hipsBone: Object3D, name: string, m: CharacterMaterials) => {
  const root = new Group();
  root.name = `${name}-skirt`;
  hipsBone.add(root);

  const skirtProfile = [
    new Vector2(0.42, 0),
    new Vector2(0.46, 0.12),
    new Vector2(0.54, 0.36),
    new Vector2(0.66, 0.67),
    new Vector2(0.74, 0.82),
    new Vector2(0.71, 0.88),
    new Vector2(0, 0.88),
  ];
  const skirt = addMesh(root, `${name}-skirt-main`, rememberGeometry(new LatheGeometry(skirtProfile, 36)), m.dress);
  skirt.scale.z = 0.82;

  const hemProfile = [
    new Vector2(0.67, 0.75),
    new Vector2(0.76, 0.84),
    new Vector2(0.78, 0.9),
    new Vector2(0.73, 0.96),
    new Vector2(0, 0.96),
  ];
  const hem = addMesh(root, `${name}-skirt-hem`, rememberGeometry(new LatheGeometry(hemProfile, 36)), m.dressLight, 25);
  hem.scale.z = 0.82;

  const belt = addMesh(root, `${name}-belt`, rememberGeometry(new TorusGeometry(0.44, 0.035, 12, 36)), m.dressDark, 26);
  belt.rotation.x = Math.PI / 2;
  belt.scale.z = 0.82;
  return root;
};

const addLimb = (
  bone: Object3D,
  name: string,
  radius: number,
  segmentLength: number,
  material: Material,
) => {
  const root = new Group();
  root.name = name;
  addCapsule(root, `${name}-mesh`, radius, segmentLength, material);
  bone.add(root);
  return root;
};

const addArm = (
  upperBone: Object3D,
  forearmBone: Object3D,
  handBone: Object3D,
  name: string,
  m: CharacterMaterials,
) => {
  const upper = addLimb(upperBone, `${name}-upper-arm`, 0.15, 0.37, m.skin);
  addEllipsoid(upper, `${name}-puff-sleeve`, [0, 0.12, 0], [0.245, 0.255, 0.225], m.dress);
  const forearm = addLimb(forearmBone, `${name}-forearm`, 0.135, 0.23, m.skin);
  const hand = new Group();
  hand.name = `${name}-hand`;
  addEllipsoid(hand, `${name}-hand-mesh`, [0, 0.1, 0], [0.13, 0.18, 0.1], m.skin);
  handBone.add(hand);
  return [upper, forearm, hand];
};

const addLeg = (
  upperBone: Object3D,
  lowerBone: Object3D,
  footBone: Object3D,
  side: "left" | "right",
  name: string,
  m: CharacterMaterials,
) => {
  const upper = addLimb(upperBone, `${name}-${side}-upper-leg`, 0.17, 0.51, m.skin);
  const lower = addLimb(lowerBone, `${name}-${side}-lower-leg`, 0.155, 0.62, m.skin);

  const sock = addMesh(
    lower,
    `${name}-${side}-sock`,
    rememberGeometry(new CapsuleGeometry(0.175, 0.19, 8, 18)),
    m.sock,
  );
  sock.position.y = 0.73;
  const sockBand = addMesh(
    lower,
    `${name}-${side}-sock-band`,
    rememberGeometry(new TorusGeometry(0.17, 0.025, 10, 28)),
    m.dressLight,
    26,
  );
  sockBand.position.y = 0.58;
  sockBand.rotation.x = Math.PI / 2;

  const foot = new Group();
  foot.name = `${name}-${side}-shoe`;
  const shoe = addMesh(
    foot,
    `${name}-${side}-shoe-upper`,
    rememberGeometry(new CapsuleGeometry(0.22, 0.27, 10, 22)),
    m.shoe,
  );
  shoe.position.y = 0.27;
  shoe.scale.z = 1.08;
  const toe = addEllipsoid(foot, `${name}-${side}-shoe-toe`, [0, 0.45, 0.02], [0.23, 0.2, 0.235], m.sole, 26);
  toe.rotation.x = -0.18;
  addEllipsoid(foot, `${name}-${side}-shoe-sole`, [0, 0.27, -0.13], [0.235, 0.34, 0.075], m.sole, 25);
  [0.17, 0.245, 0.32].forEach((y, laceIndex) => {
    addEllipsoid(
      foot,
      `${name}-${side}-shoe-lace-${laceIndex}`,
      [0, y, 0.215],
      [0.115 - laceIndex * 0.008, 0.018, 0.018],
      m.sole,
      27,
    );
  });
  footBone.add(foot);
  return [upper, lower, foot];
};

const getRequiredBones = (avatarMesh: Object3D) => {
  const names = [
    "headBone",
    "spine2Bone",
    "hipsBone",
    "leftArmBone",
    "leftForeArmBone",
    "leftHandBone",
    "rightarmBone",
    "rightForearmBone",
    "rightHandBone",
    "leftUpLegBone",
    "leftLegBone",
    "leftFootBone",
    "rightUpLegBone",
    "rightLegBone",
    "rightFootBone",
  ] as const;
  const bones = Object.fromEntries(names.map((boneName) => [boneName, avatarMesh.getObjectByName(boneName)]));
  if (Object.values(bones).some((bone) => !bone)) return null;
  return bones as Record<(typeof names)[number], Object3D>;
};

const createCharacter = (avatarMesh: Object3D, name: string, m: CharacterMaterials) => {
  const bones = getRequiredBones(avatarMesh);
  if (!bones) {
    console.warn(`${name} could not find the required character bones`);
    return null;
  }

  const head = addHead(bones.headBone, name, m);
  const roots = [head.root, addTorso(bones.spine2Bone, name, m)];
  const skirt = addSkirt(bones.hipsBone, name, m);
  roots.push(skirt);
  roots.push(...addArm(bones.leftArmBone, bones.leftForeArmBone, bones.leftHandBone, `${name}-left`, m));
  roots.push(...addArm(bones.rightarmBone, bones.rightForearmBone, bones.rightHandBone, `${name}-right`, m));
  roots.push(...addLeg(bones.leftUpLegBone, bones.leftLegBone, bones.leftFootBone, "left", name, m));
  roots.push(...addLeg(bones.rightUpLegBone, bones.rightLegBone, bones.rightFootBone, "right", name, m));

  if (!isTicking) {
    gsap.ticker.add(tick);
    isTicking = true;
  }
  return { roots, skirt, leftPonytail: head.leftPonytail, rightPonytail: head.rightPonytail };
};

const makeMaterial = (
  color: number,
  sharedUniforms: SharedAvatarUniforms,
  matcap: "matcap-white" | "matcap-skin" = "matcap-white",
  highlight = color,
) => {
  const material = createAccessoryMaterial({
    color,
    highlight,
    matcap: resources.items[matcap],
    sharedUniforms,
  });
  materials.add(material);
  return material;
};

const createSolidMaterials = (sharedUniforms: SharedAvatarUniforms): CharacterMaterials => ({
  skin: makeMaterial(0xffffff, sharedUniforms, "matcap-skin"),
  skinWarm: makeMaterial(0xffeee2, sharedUniforms, "matcap-skin"),
  blush: makeMaterial(0xffa0a8, sharedUniforms),
  hair: makeMaterial(0x9b604d, sharedUniforms, "matcap-white", 0xc48770),
  hairSoft: makeMaterial(0x7d493b, sharedUniforms),
  eyeWhite: makeMaterial(0xfffbf6, sharedUniforms),
  iris: makeMaterial(0x6a351f, sharedUniforms),
  pupil: makeMaterial(0x24120f, sharedUniforms),
  eyeLight: makeMaterial(0xffffff, sharedUniforms),
  mouth: makeMaterial(0x6f1f25, sharedUniforms),
  tongue: makeMaterial(0xff7182, sharedUniforms),
  dress: makeMaterial(0xf45f8c, sharedUniforms, "matcap-white", 0xff94b2),
  dressDark: makeMaterial(0xd84370, sharedUniforms),
  dressLight: makeMaterial(0xffc2d2, sharedUniforms),
  sock: makeMaterial(0xfff7f1, sharedUniforms),
  shoe: makeMaterial(0xf35e88, sharedUniforms),
  sole: makeMaterial(0xfffaf5, sharedUniforms),
});

const createHologramMaterials = (material: ShaderMaterial): CharacterMaterials => ({
  skin: material,
  skinWarm: material,
  blush: material,
  hair: material,
  hairSoft: material,
  eyeWhite: material,
  iris: material,
  pupil: material,
  eyeLight: material,
  mouth: material,
  tongue: material,
  dress: material,
  dressDark: material,
  dressLight: material,
  sock: material,
  shoe: material,
  sole: material,
});

const init = (avatarMesh: Object3D, sharedUniforms: SharedAvatarUniforms) => {
  if (solidCharacter) return;
  solidCharacter = createCharacter(avatarMesh, "reference-girl", createSolidMaterials(sharedUniforms));
};

const initHologram = (avatarMesh: Object3D, hologramMaterial: ShaderMaterial) => {
  if (hologramCharacter) return;
  hologramCharacter = createCharacter(
    avatarMesh,
    "reference-girl-hologram",
    createHologramMaterials(hologramMaterial),
  );
};

const update = (standingProgress: number) => {
  if (!solidCharacter) return;
  const reveal = Math.max(0, Math.min(1, (standingProgress - 0.48) / 0.32));
  const eased = reveal * reveal * (3 - 2 * reveal);
  solidCharacter.skirt.visible = eased > 0.001;
  solidCharacter.skirt.scale.setScalar(eased);
};

function tick() {
  const time = gsap.ticker.time;
  [solidCharacter, hologramCharacter].forEach((instance) => {
    if (!instance) return;
    instance.leftPonytail.rotation.z = Math.sin(time * 1.35) * 0.025;
    instance.rightPonytail.rotation.z = -Math.sin(time * 1.35 + 0.4) * 0.025;
  });
}

const destroy = () => {
  if (isTicking) {
    gsap.ticker.remove(tick);
    isTicking = false;
  }
  [solidCharacter, hologramCharacter].forEach((instance) => {
    instance?.roots.forEach((root) => {
      root.removeFromParent();
      root.clear();
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  geometries.clear();
  materials.clear();
  solidCharacter = null;
  hologramCharacter = null;
};

export const character = { init, initHologram, update, destroy };
