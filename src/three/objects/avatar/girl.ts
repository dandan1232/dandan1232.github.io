import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopOnce,
  LoopPingPong,
  MathUtils,
  Matrix4,
  Mesh,
  Object3D,
  Plane,
  Quaternion,
  QuaternionKeyframeTrack,
  SkinnedMesh,
  Vector3,
} from "three";
import type { Material } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { retargetClip } from "three/examples/jsm/utils/SkeletonUtils.js";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { aboutProgress } from "../../../animations/transitions/about";
import { getMaterial as getHologramMaterial, uniforms as hologramUniforms } from "./hologram-material";
import { getScanY, SCAN_MIN_Y } from "./scan-progress";

const SCALE = 2.3;
const HIP_SCALE = 1 / SCALE;
const SEATED_YAW_CORRECTION = -Math.PI / 2;
const solidClipPlane = new Plane(new Vector3(0, 1, 0), -SCAN_MIN_Y);

const CLIP_NAMES = [
  "idle",
  "t-idle",
  "left-desktop",
  "sleeping",
  "wake-up",
  "contact-idle",
  "wave",
] as const;

const UPRIGHT_IDLE_CLIP_NAME = "upright-idle";
// The source standing clip stores its front-facing quarter turn and forward
// lean in the hips. Preserve only the yaw component for a vertical VRM pose.
const UPRIGHT_HIPS_YAW_COMPONENT = Math.SQRT1_2;
const UPRIGHT_RESET_BONES = new Set([
  "spineBone",
  "spine1Bone",
  "spine2Bone",
  "headBone",
  "leftUpLegBone",
  "leftLegBone",
  "leftFootBone",
  "leftToeBaseBone",
  "rightUpLegBone",
  "rightLegBone",
  "rightFootBone",
  "rightToeBaseBone",
]);

type ClipName = (typeof CLIP_NAMES)[number];

/** Bare (x, y, z, w) quaternion, the layout QuaternionKeyframeTrack expects. */
type Quat = [number, number, number, number];

const HALF_DEG = Math.PI / 360; // degrees -> half-angle radians
/** Rotation about the bone's local Z: swings the arm within her frontal plane. */
const qZ = (degrees: number): Quat => [0, 0, Math.sin(degrees * HALF_DEG), Math.cos(degrees * HALF_DEG)];
/** Rotation about the bone's local Y: tilts the arm forward of / behind her. */
const qY = (degrees: number): Quat => [0, Math.sin(degrees * HALF_DEG), 0, Math.cos(degrees * HALF_DEG)];
/** Rotation about the bone's local X, i.e. a twist around the bone's own axis. */
const qX = (degrees: number): Quat => [Math.sin(degrees * HALF_DEG), 0, 0, Math.cos(degrees * HALF_DEG)];
/** `a * b` — b is applied first, in the frame a then rotates. */
const qMul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

/**
 * Procedural greeting-wave: synthetic arm-only clip replacing the seated
 * `wave` source whose lift was too small in the standing pose. Her LEFT arm
 * lifts out to her own side, forearm vertical beside the skull, hand swinging
 * left/right. Rest rotations on this rig are identity, so local deltas are the
 * whole story — geometry pre-verified offline (scripts/verify-wave-pose.mjs).
 *
 * The clip is played as an OVERLAY on top of `contact-idle`; see the weight
 * pre-compensation in animations.ts, without which the mixer only ever renders
 * half of these angles.
 */
const WAVE_CLIP_NAME = "upright-wave"; // consumed by the existing contact-wave action
const WAVE_DURATION_S = 2.4;
// Base pose, as rotations about each bone's local Z away from the VRM rest
// T-pose (negative lifts the left arm). Abduction + flexion deliberately sum to
// 90° so the forearm ends up VERTICAL — the only orientation where elbow
// flexion moves the hand horizontally. Lifting the upper arm past vertical (the
// old 98°) tips the forearm toward horizontal, where the same flexion reads as
// beckoning, and pushes the hand across the midline above her head.
const WAVE_ABDUCT_DEG = 38; // upper arm: out to the side, well clear of the head
const WAVE_BEND_BASE_DEG = 52; // 38 + 52 = 90 -> forearm vertical
const WAVE_FOREARM_TWIST_DEG = 90; // pronation about the forearm axis so the palm faces front
// Oscillation. The elbow carries the wave; the shoulder only leads it slightly
// so the arm is not a rigid metronome, and the wrist trails further so the hand
// whips instead of moving as one board with the forearm.
const WAVE_SWING_FOLD_DEG = 16; // elbow — the actual left/right travel
const WAVE_SWING_UPPER_DEG = 4; // shoulder lead
const WAVE_SWING_HAND_DEG = 7; // wrist follow-through
const WAVE_LAG_DEG = 30; // phase each joint trails its parent by
const WAVE_FREQUENCY_HZ = 1.6;
const WAVE_KEY_RATE_FPS = 30;

/**
 * Relaxed hanging arm for the standing pose.
 *
 * The retargeted idle came from a seated desk shot: both upper arms sit ~45°
 * below horizontal angled forward, elbows folded ~105°, so the hands end up in
 * front of the chest. Read standing, that is a figure clutching something.
 * Replacing the chain with constants drops both arms to her sides; the wave
 * overlay lifts the left one back up when it fires. Nothing is lost by going
 * constant — the arms travel all of 4.8° across the whole clip, and the upright
 * variant already freezes the spine, head and legs at the VRM rest.
 *
 * Angles are about the bone's local Z away from the rest T-pose, so ±90° is
 * straight down; `sign` carries the mirroring (right arm rests along +X, left
 * along -X). The forward tilt is about local Y and mirrors the other way.
 */
const RELAXED_ARM_CHAINS = {
  right: { shoulder: "rightShoulder", upper: "rightarmBone", fore: "rightForearmBone", hand: "rightHandBone", sign: -1 },
  left: { shoulder: "leftShoulderBone", upper: "leftArmBone", fore: "leftForeArmBone", hand: "leftHandBone", sign: 1 },
} as const;
// Both arms hang; the wave overlay lifts the left one back up when it fires.
const RELAXED_ARM_SIDES: (keyof typeof RELAXED_ARM_CHAINS)[] = ["right", "left"];
// She wears a flared one-piece: measured off girl.vrm the dress reaches 0.09m at
// the waist but 0.19m at hand height and 0.27m near the hem, so an arm hanging
// straight puts the hand 0.074m INSIDE it and the hand disappears. The clearance
// comes mostly from the elbow rather than the shoulder — abducting the shoulder
// far enough on its own (24°) reads as a penguin stance, whereas a forearm that
// deviates outward is just the elbow's natural carrying angle (5-15° in humans).
const RELAXED_ABDUCT_DEG = 16; // upper arm, away from the torso
const RELAXED_CARRY_DEG = 12; // forearm, further outward again — clears the dress by 0.05m
const RELAXED_FORWARD_DEG = 9; // drifts ahead of the coronal plane so it reads 3D

const Q_IDENTITY: Quat = [0, 0, 0, 1]; // rest rotations are identity on this rig

/**
 * bone -> constant local rotation for the standing pose. The whole chain is
 * pinned, shoulder and hand included: the left hand is contested between this
 * clip and the wave overlay, and leaving it undriven would make its resting
 * value depend on whatever the mixer happened to capture as "original state".
 */
const RELAXED_ARM_POSE = new Map<string, Quat>(
  RELAXED_ARM_SIDES.flatMap((side) => {
    const { shoulder, upper, fore, hand, sign } = RELAXED_ARM_CHAINS[side];
    return [
      [shoulder, Q_IDENTITY],
      [hand, Q_IDENTITY],
      [upper, qMul(qZ(sign * (90 - RELAXED_ABDUCT_DEG)), qY(-sign * RELAXED_FORWARD_DEG))],
      [fore, qZ(-sign * RELAXED_CARRY_DEG)],
    ] as [string, Quat][];
  }),
);

const BONE_MAP: Record<string, string> = {
  hipsBone: "J_Bip_C_Hips",
  spineBone: "J_Bip_C_Spine",
  spine1Bone: "J_Bip_C_Chest",
  spine2Bone: "J_Bip_C_UpperChest",
  headBone: "J_Bip_C_Head",
  leftShoulderBone: "J_Bip_L_Shoulder",
  leftArmBone: "J_Bip_L_UpperArm",
  leftForeArmBone: "J_Bip_L_LowerArm",
  leftHandBone: "J_Bip_L_Hand",
  leftHandIndex1Bone: "J_Bip_L_Index1",
  leftHandIndex2Bone: "J_Bip_L_Index2",
  rightShoulder: "J_Bip_R_Shoulder",
  rightarmBone: "J_Bip_R_UpperArm",
  rightForearmBone: "J_Bip_R_LowerArm",
  rightHandBone: "J_Bip_R_Hand",
  rightHandIndex2Bone: "J_Bip_R_Index2",
  leftUpLegBone: "J_Bip_L_UpperLeg",
  leftLegBone: "J_Bip_L_LowerLeg",
  leftFootBone: "J_Bip_L_Foot",
  leftToeBaseBone: "J_Bip_L_ToeBase",
  rightUpLegBone: "J_Bip_R_UpperLeg",
  rightLegBone: "J_Bip_R_LowerLeg",
  rightFootBone: "J_Bip_R_Foot",
  rightToeBaseBone: "J_Bip_R_ToeBase",
};

const HAIR_TINT = new Color(0xffa8c6);

let solidRoot: Group | null = null;
let hologramRoot: Group | null = null;
let mixer: AnimationMixer | null = null;
let hologramMixer: AnimationMixer | null = null;
const actions = new Map<string, AnimationAction>();
const hologramActions = new Map<string, AnimationAction>();
const clips = new Map<string, AnimationClip>();
const solidMaterialStates = new Map<
  Material,
  {
    opacity: number;
    transparent: boolean;
    depthWrite: boolean;
    clippingPlanes: Plane[] | null;
  }
>();

let faceMesh: SkinnedMesh | null = null;
const morphIndexes = { blink: -1, joy: -1, surprised: -1, fun: -1, angry: -1, sorrow: -1 };

const renameBones = (root: Object3D) => {
  const reverse = new Map(Object.entries(BONE_MAP).map(([legacy, vroid]) => [vroid, legacy]));
  root.traverse((child) => {
    const legacy = reverse.get(child.name);
    if (legacy) child.name = legacy;
  });
};

const addPropAnchor = (root: Object3D) => {
  const hand = root.getObjectByName("rightHandBone");
  if (!hand) return;
  const anchor = new Group();
  anchor.name = "bone-right-hand";
  hand.add(anchor);
};

const findSkinnedMesh = (root: Object3D): SkinnedMesh | null => {
  let found: SkinnedMesh | null = null;
  root.traverse((child) => {
    if (!found && child instanceof SkinnedMesh) found = child;
  });
  return found;
};

const computeLocalOffsets = (targetRoot: Object3D, sourceMesh: SkinnedMesh) => {
  targetRoot.updateMatrixWorld(true);
  const sourceRoot = sourceMesh.parent ?? sourceMesh;
  sourceRoot.updateMatrixWorld(true);

  const offsets: Record<string, Matrix4> = {};
  const targetQuat = new Quaternion();
  const sourceQuat = new Quaternion();

  for (const legacy of Object.keys(BONE_MAP)) {
    const targetBone = targetRoot.getObjectByName(legacy);
    const sourceBone = sourceMesh.skeleton.bones.find((bone) => bone.name === legacy);
    if (!targetBone || !sourceBone) continue;

    targetBone.getWorldQuaternion(targetQuat);
    sourceBone.getWorldQuaternion(sourceQuat);
    sourceQuat.invert().multiply(targetQuat);

    offsets[legacy] = new Matrix4().makeRotationFromQuaternion(sourceQuat);
  }
  return offsets;
};

const getSourceMesh = () => {
  const avatarResource = resources.items["avatar-model"];
  const mesh = avatarResource.scene.getObjectByName("black") as SkinnedMesh | undefined;
  if (!mesh) throw new Error("[Girl] Could not find the retarget source skinned mesh");
  return mesh;
};

const getSourceClip = (name: ClipName) => {
  const avatarResource = resources.items["avatar-model"];
  const clip = avatarResource.animations.find((animation: AnimationClip) => animation.name === name);
  if (!clip) throw new Error(`[Girl] Source clip "${name}" not found`);
  return clip;
};

const retargetClips = (targetRoot: Object3D, targetMesh: SkinnedMesh, sourceMesh: SkinnedMesh) => {
  const localOffsets = computeLocalOffsets(targetRoot, sourceMesh);
  if (Object.keys(localOffsets).length < Object.keys(BONE_MAP).length) {
    throw new Error(`[Girl] localOffsets incomplete: ${Object.keys(localOffsets).length}/${Object.keys(BONE_MAP).length}`);
  }
  const options = {
    hip: "hipsBone",
    scale: HIP_SCALE,
    hipInfluence: new Vector3(0, 1, 0),
    getBoneName: (bone: Object3D) => bone.name,
    localOffsets,
  };

  for (const name of CLIP_NAMES) {
    const sourceClip = getSourceClip(name);
    const converted = retargetClip(targetMesh, sourceMesh, sourceClip, options);
    converted.duration = sourceClip.duration;
    clips.set(name, converted);
  }

  const contactIdle = clips.get("contact-idle");
  if (!contactIdle) throw new Error('[Girl] Retargeted clip "contact-idle" missing');

  const makeUprightVariant = (baseClip: AnimationClip, name: string) => {
    const tracks = baseClip.tracks.flatMap((track) => {
      if (track.name.includes("[hipsBone].quaternion")) {
        const uprightHipsTrack = track.clone();
        for (let index = 0; index < uprightHipsTrack.values.length; index += 4) {
          uprightHipsTrack.values[index] = 0;
          uprightHipsTrack.values[index + 1] = UPRIGHT_HIPS_YAW_COMPONENT;
          uprightHipsTrack.values[index + 2] = 0;
          uprightHipsTrack.values[index + 3] = UPRIGHT_HIPS_YAW_COMPONENT;
        }
        return [uprightHipsTrack];
      }

      if (!track.name.endsWith(".quaternion")) return [track];
      const boneName = track.name.match(/\[([^\]]+)\]/)?.[1];
      if (!boneName) return [track];
      // dropped -> the bone holds its VRM rest rotation; relaxed arm bones are
      // re-added below as constants (dropped here even if absent from the clip).
      if (UPRIGHT_RESET_BONES.has(boneName) || RELAXED_ARM_POSE.has(boneName)) return [];
      return [track];
    });

    for (const [boneName, quat] of RELAXED_ARM_POSE) {
      tracks.push(
        new QuaternionKeyframeTrack(`.bones[${boneName}].quaternion`, [0, baseClip.duration], [...quat, ...quat]),
      );
    }

    return new AnimationClip(name, baseClip.duration, tracks);
  };

  clips.set(UPRIGHT_IDLE_CLIP_NAME, makeUprightVariant(contactIdle, UPRIGHT_IDLE_CLIP_NAME));
  clips.set(WAVE_CLIP_NAME, createWaveClip());

  targetMesh.skeleton.pose();
};

/** Bake the procedural greeting-wave described by the WAVE_* constants. */
const createWaveClip = () => {
  const frameCount = Math.ceil(WAVE_DURATION_S * WAVE_KEY_RATE_FPS);
  const times = new Float32Array(frameCount);
  const armValues = new Float32Array(frameCount * 4);
  const foreArmValues = new Float32Array(frameCount * 4);
  const handValues = new Float32Array(frameCount * 4);

  const envelope = (t: number) =>
    Math.min(t / 0.3, (WAVE_DURATION_S - t) / 0.45, 1); // let the mixer weight ramps own the fades
  const lag = (WAVE_LAG_DEG * Math.PI) / 180;

  for (let frame = 0; frame < frameCount; frame++) {
    const time = frame / WAVE_KEY_RATE_FPS;
    const phase = time * WAVE_FREQUENCY_HZ * Math.PI * 2;
    const gate = envelope(time);

    // All three swings push the hand the same way; the trailing phases turn a
    // rigid sweep into an arm that whips from the shoulder down to the fingers.
    const armAngle = -WAVE_ABDUCT_DEG + WAVE_SWING_UPPER_DEG * gate * Math.sin(phase);
    const foldAngle = -WAVE_BEND_BASE_DEG + WAVE_SWING_FOLD_DEG * gate * Math.sin(phase - lag);
    const handAngle = WAVE_SWING_HAND_DEG * gate * Math.sin(phase - 2 * lag);

    times[frame] = time;
    armValues.set(qZ(armAngle), frame * 4);
    // twist below the elbow only: twisting the upper arm instead would rotate
    // the elbow's hinge plane and turn the wave into a forward/back paddle.
    foreArmValues.set(qMul(qZ(foldAngle), qX(WAVE_FOREARM_TWIST_DEG)), frame * 4);
    handValues.set(qZ(handAngle), frame * 4);
  }

  return new AnimationClip(WAVE_CLIP_NAME, WAVE_DURATION_S, [
    new QuaternionKeyframeTrack(".bones[leftArmBone].quaternion", Array.from(times), Array.from(armValues)),
    new QuaternionKeyframeTrack(".bones[leftForeArmBone].quaternion", Array.from(times), Array.from(foreArmValues)),
    // the idle clip leaves a bent wrist here; overriding it keeps the hand in
    // line with the forearm instead of dangling through the wave.
    new QuaternionKeyframeTrack(".bones[leftHandBone].quaternion", Array.from(times), Array.from(handValues)),
  ]);
};

const applySolidMaterials = (root: Object3D) => {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.frustumCulled = false;
    child.renderOrder = 24;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!solidMaterialStates.has(material)) {
        solidMaterialStates.set(material, {
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite,
          clippingPlanes: material.clippingPlanes ? [...material.clippingPlanes] : null,
        });
      }

      const colorMaterial = material as Material & { color?: Color };
      if (material.name.includes("_HAIR") && colorMaterial.color) {
        colorMaterial.color.copy(HAIR_TINT);
      }
    }
  });
};

const setSolidOpacity = (opacity: number, overlay = false) => {
  const clampedOpacity = MathUtils.clamp(opacity, 0, 1);

  for (const [material, state] of solidMaterialStates) {
    const transparent = overlay || state.transparent || clampedOpacity < 0.999;
    const depthWrite = state.depthWrite && clampedOpacity >= 0.999;

    material.opacity = state.opacity * clampedOpacity;
    if (material.transparent !== transparent || material.depthWrite !== depthWrite) {
      material.transparent = transparent;
      material.depthWrite = depthWrite;
      material.needsUpdate = true;
    }
  }
};

const setSolidClipping = (enabled: boolean, progress = 0) => {
  if (enabled) {
    solidClipPlane.constant = -getScanY(progress);
  }

  for (const [material, state] of solidMaterialStates) {
    const clippingPlanes = enabled ? [solidClipPlane] : state.clippingPlanes;
    const clippingChanged = material.clippingPlanes?.[0] !== clippingPlanes?.[0];
    material.clippingPlanes = clippingPlanes;
    if (clippingChanged) material.needsUpdate = true;
  }
};

const restoreSolidMaterials = () => {
  for (const [material, state] of solidMaterialStates) {
    material.opacity = state.opacity;
    material.transparent = state.transparent;
    material.depthWrite = state.depthWrite;
    material.clippingPlanes = state.clippingPlanes;
    material.needsUpdate = true;
  }
  solidMaterialStates.clear();
};

const applyHologramMaterials = (root: Object3D) => {
  const material = getHologramMaterial();
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.material = material;
    child.frustumCulled = false;
    child.renderOrder = 23;
  });
};

const resolveFaceMorphs = (root: Object3D) => {
  let found: SkinnedMesh | null = null;
  root.traverse((child) => {
    if (!found && child instanceof SkinnedMesh && child.name.includes("Face")) found = child;
  });
  if (!found) return;
  faceMesh = found;

  const girlResource = resources.items["girl-model"];
  const groups = girlResource.parser?.json?.extensions?.VRM?.blendShapeMaster?.blendShapeGroups ?? [];
  const presetToIndex: Record<string, number> = { Blink: -1, Joy: -1, Surprised: -1, Fun: -1, Angry: -1, Sorrow: -1 };

  for (const group of groups) {
    if (!(group.name in presetToIndex)) continue;
    const bind = group.binds?.[0];
    if (!bind) continue;
    const meshName = girlResource.parser.json.meshes[bind.mesh]?.name;
    if (meshName !== faceMesh.name) continue;
    presetToIndex[group.name] = bind.index;
  }

  morphIndexes.blink = presetToIndex.Blink ?? -1;
  morphIndexes.joy = presetToIndex.Joy ?? -1;
  morphIndexes.surprised = presetToIndex.Surprised ?? -1;
  morphIndexes.fun = presetToIndex.Fun ?? -1;
  morphIndexes.angry = presetToIndex.Angry ?? -1;
  morphIndexes.sorrow = presetToIndex.Sorrow ?? -1;
};

const setupAction = (
  targetActions: Map<string, AnimationAction>,
  actionMixer: AnimationMixer,
  name: string,
  configure: (action: AnimationAction) => void,
  clipName: string = name,
) => {
  const clip = clips.get(clipName as ClipName);
  if (!clip) throw new Error(`[Girl] Retargeted clip "${clipName}" missing`);
  const action = actionMixer.clipAction(clip);
  configure(action);
  targetActions.set(name, action);
};

const setupActions = (actionMixer: AnimationMixer, targetActions: Map<string, AnimationAction>) => {
  setupAction(
    targetActions,
    actionMixer,
    "desktop-idle",
    (action) => {
      action.loop = LoopPingPong;
      action.weight = 1;
    },
    "idle",
  );

  setupAction(targetActions, actionMixer, "t-idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 0;
    action.play();
  });

  setupAction(
    targetActions,
    actionMixer,
    "left-desktop",
    (action) => {
      action.repetitions = 1;
      action.clampWhenFinished = true;
      action.weight = 0;
    },
    "left-desktop",
  );

  setupAction(targetActions, actionMixer, "sleeping", (action) => {
    action.loop = LoopPingPong;
    action.weight = 1;
    action.play();
  });

  setupAction(targetActions, actionMixer, "wake-up", (action) => {
    action.repetitions = 1;
    action.clampWhenFinished = true;
  });

  setupAction(
    targetActions,
    actionMixer,
    "contact-idle",
    (action) => {
      action.loop = LoopPingPong;
      action.weight = 0;
      action.play();
    },
    UPRIGHT_IDLE_CLIP_NAME,
  );

  setupAction(targetActions, actionMixer, "wave", (action) => {
    action.clampWhenFinished = true;
    action.loop = LoopOnce;
  });

  setupAction(
    targetActions,
    actionMixer,
    "contact-wave",
    (action) => {
      action.clampWhenFinished = true;
      action.loop = LoopOnce;
      action.weight = 0;
    },
    "upright-wave",
  );
};

const setupHologramActions = (actionMixer: AnimationMixer) => {
  const clip = clips.get(UPRIGHT_IDLE_CLIP_NAME);
  if (!clip) throw new Error(`[Girl] Retargeted clip "${UPRIGHT_IDLE_CLIP_NAME}" missing`);

  const standingAction = actionMixer.clipAction(clip);
  standingAction.loop = LoopPingPong;
  standingAction.setEffectiveWeight(1);
  standingAction.play();

  hologramActions.set("desktop-idle", standingAction);
  for (const name of CLIP_NAMES) hologramActions.set(name, standingAction);
};

const init = (parent: Object3D) => {
  if (solidRoot) return;

  const girlResource = resources.items["girl-model"];
  if (!girlResource) throw new Error("[Girl] girl-model resource not loaded");

  solidRoot = cloneSkeleton(girlResource.scene) as Group;
  renameBones(solidRoot);
  addPropAnchor(solidRoot);

  const targetMesh = findSkinnedMesh(solidRoot);
  if (!targetMesh) throw new Error("[Girl] Could not find the girl skinned mesh");

  retargetClips(solidRoot, targetMesh, getSourceMesh());
  applySolidMaterials(solidRoot);
  resolveFaceMorphs(solidRoot);
  solidRoot.scale.setScalar(SCALE);
  solidRoot.traverse((child) => {
    child.frustumCulled = false;
  });
  (solidRoot as Group & { skeleton?: unknown }).skeleton = targetMesh.skeleton;

  hologramRoot = cloneSkeleton(solidRoot) as Group;
  applyHologramMaterials(hologramRoot);
  hologramRoot.scale.setScalar(SCALE);
  const hologramMesh = findSkinnedMesh(hologramRoot);
  if (hologramMesh) {
    (hologramRoot as Group & { skeleton?: unknown }).skeleton = hologramMesh.skeleton;
  }

  mixer = new AnimationMixer(solidRoot);
  hologramMixer = new AnimationMixer(hologramRoot);
  setupActions(mixer, actions);
  setupHologramActions(hologramMixer);

  hologramRoot.visible = false;

  parent.add(solidRoot);
  parent.add(hologramRoot);
  setStandingProgress(0);

  if (import.meta.env.DEV) {
    setTimeout(() => {
      const box = new Box3();
      let meshCount = 0;
      solidRoot!.traverse((child) => {
        if (child instanceof Mesh && child.geometry?.attributes?.position) {
          meshCount++;
          child.geometry.computeBoundingBox();
          box.union(child.geometry.boundingBox!.applyMatrix4(child.matrixWorld));
        }
      });
      const hips = solidRoot!.getObjectByName("hipsBone");
      const head = solidRoot!.getObjectByName("headBone");
      const handL = solidRoot!.getObjectByName("leftHandBone");
      const handR = solidRoot!.getObjectByName("rightHandBone");
      const footL = solidRoot!.getObjectByName("leftFootBone");
      const footR = solidRoot!.getObjectByName("rightFootBone");
      const wp = (o: Object3D | null | undefined) => (o ? o.getWorldPosition(new Vector3()).toArray().map((v: number) => v.toFixed(2)).join(",") : "null");
      const fwd = new Vector3(0, 0, 1).applyQuaternion(solidRoot!.getWorldQuaternion(new Quaternion()));
      const weights = [...actions.entries()].map(([k, a]) => `${k}:${a.getEffectiveWeight().toFixed(2)}t${a.time.toFixed(1)}`).join(" ");
      console.log(
        `[GirlDebug] meshes=${meshCount}`,
        "bbox=", box.isEmpty() ? "EMPTY" : `${box.min.toArray().map((v: number) => v.toFixed(2))} ~ ${box.max.toArray().map((v: number) => v.toFixed(2))}`,
        "\n[GirlDebug] hips=", wp(hips), "head=", wp(head),
        "handL=", wp(handL), "handR=", wp(handR), "footL=", wp(footL), "footR=", wp(footR),
        "\n[GirlDebug] facing=", fwd.toArray().map((v) => v.toFixed(2)).join(","),
        "faceDir=", (() => {
          const d = fwd.clone().multiplyScalar(-1);
          return d.toArray().map((v) => v.toFixed(2)).join(",");
        })(),
        (() => {
          const sceneRef = solidRoot!.parent?.parent ?? null;
          const chair = sceneRef?.getObjectByName("chair");
          return chair ? "chair=" + chair.getWorldPosition(new Vector3()).toArray().map((v) => v.toFixed(2)).join(",") : "chair=null";
        })(),
        "visible=", solidRoot!.visible,
        "parentChain=", (() => {
          const chain: string[] = [];
          let p: Object3D | null = solidRoot!;
          while (p) { chain.push(p.name || p.type); p = p.parent; }
          return chain.join(" < ");
        })(),
        "\n[GirlDebug] actions=", weights,
        "\n[GirlDebug] legLocals=", (() => {
          return ["leftUpLegBone", "leftLegBone", "leftFootBone", "rightUpLegBone"]
            .map((n) => {
              const b = solidRoot!.getObjectByName(n);
              if (!b) return `${n}=MISSING`;
              return `${n.replace("Bone", "")}: p=${b.position.toArray().map((v) => v.toFixed(2))} q=${[b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w].map((v) => v.toFixed(2))}`;
            })
            .join(" | ");
        })(),
        "\n[GirlDebug] clipTracks=", (() => {
          const info = (n: string) => {
            const a = actions.get(n);
            if (!a) return `${n}=NO_ACTION`;
            const c = a.getClip();
            const legQ = c.tracks.filter((t) => t.name.endsWith(".quaternion") && /Leg|Foot|Toe/i.test(t.name)).length;
            const posT = c.tracks.filter((t) => t.name.endsWith(".position")).map((t) => t.name.split(".").pop());
            const upLeg = c.tracks.find((t) => t.name === ".bones[leftUpLegBone].quaternion");
            const upLegV0 = upLeg ? Array.from(upLeg.values.slice(0, 4)).map((v) => v.toFixed(2)) : "MISSING";
            return `${n}: total=${c.tracks.length} legQuat=${legQ} pos=[${posT.join(",")}] dur=${c.duration.toFixed(2)} upLegV0=${upLegV0}`;
          };
          return ["desktop-idle", "wave"].map(info).join(" || ");
        })(),
      );
      (window as unknown as { __girlDebug?: unknown }).__girlDebug = { solidRoot, hologramRoot };
    }, 2000);
  }
};

let activeAction: string | null = null;

const play = (name: string, transition = 0.5) => {
  if (activeAction === name) return;
  const next = actions.get(name);
  const nextHologram = hologramActions.get(name);
  if (!next || !nextHologram) throw new Error(`[Girl] Action "${name}" not found`);

  next.reset().play();
  nextHologram.reset().play();

  if (activeAction) {
    const current = actions.get(activeAction);
    if (current) current.crossFadeTo(next, transition);

    const currentHologram = hologramActions.get(activeAction);
    if (currentHologram) currentHologram.crossFadeTo(nextHologram, transition);
  }

  activeAction = name;
};

const setSolidWeight = (name: string, weight: number) => {
  const action = actions.get(name);
  if (action) action.setEffectiveWeight(weight);
};

const setHologramWeight = (name: string, weight: number) => {
  const hologramAction = hologramActions.get(name);
  if (hologramAction) hologramAction.setEffectiveWeight(weight);
};

const update = (delta: number) => {
  mixer?.update(delta);
  hologramMixer?.update(delta);
};

const updateHologramUniforms = () => {
  hologramUniforms.uTime.value = gsap.ticker.time;
  hologramUniforms.uProgress.value = aboutProgress.value;
};

const setMode = (mode: "solid" | "hologram" | "transition", progress = 0) => {
  if (mode === "solid") {
    setSolidClipping(false);
    setSolidOpacity(1);
    if (solidRoot) solidRoot.visible = true;
    if (hologramRoot) hologramRoot.visible = false;
    return;
  }

  if (mode === "hologram") {
    setSolidClipping(false);
    setSolidOpacity(0);
    if (solidRoot) solidRoot.visible = false;
    if (hologramRoot) hologramRoot.visible = true;
    return;
  }

  setSolidOpacity(1, true);
  setSolidClipping(true, progress);
  if (solidRoot) solidRoot.visible = progress < 1;
  if (hologramRoot) hologramRoot.visible = true;
};

const setStandingProgress = (_progress: number, _isContact = false) => {
  if (solidRoot) solidRoot.rotation.y = SEATED_YAW_CORRECTION;
  if (hologramRoot) hologramRoot.rotation.y = SEATED_YAW_CORRECTION;
};

const setFaceWeights = (weights: Record<string, number>) => {
  if (!faceMesh?.morphTargetInfluences) return;
  const influences = faceMesh.morphTargetInfluences;
  for (const [preset, value] of Object.entries(weights)) {
    const index = morphIndexes[preset as keyof typeof morphIndexes];
    if (index >= 0 && index < influences.length) {
      influences[index] = Math.max(0, Math.min(1, value));
    }
  }
};

const getRightHandPropBone = () => solidRoot?.getObjectByName("bone-right-hand") ?? null;

const destroy = () => {
  mixer?.stopAllAction();
  hologramMixer?.stopAllAction();
  mixer = null;
  hologramMixer = null;
  actions.clear();
  hologramActions.clear();
  clips.clear();
  restoreSolidMaterials();
  solidRoot?.removeFromParent();
  hologramRoot?.removeFromParent();
  solidRoot = null;
  hologramRoot = null;
  faceMesh = null;
};

export const girl = {
  init,
  play,
  setSolidWeight,
  setHologramWeight,
  update,
  updateHologramUniforms,
  setMode,
  setStandingProgress,
  setFaceWeights,
  getRightHandPropBone,
  actions,
  hologramActions,
  destroy,
};
