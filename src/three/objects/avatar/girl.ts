import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopOnce,
  LoopPingPong,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { retargetClip } from "three/examples/jsm/utils/SkeletonUtils.js";
import gsap from "gsap";
import { resources } from "../../../utils/resources";
import { aboutProgress } from "../../../animations/transitions/about";
import { getMaterial as getHologramMaterial, uniforms as hologramUniforms } from "./hologram-material";

const SCALE = 2.3;
const HIP_SCALE = 1 / SCALE;

const CLIP_NAMES = [
  "idle",
  "t-idle",
  "left-desktop",
  "sleeping",
  "wake-up",
  "contact-idle",
  "wave",
] as const;

type ClipName = (typeof CLIP_NAMES)[number];

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
const clips = new Map<ClipName, AnimationClip>();

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
    getBoneName: (bone: Object3D) => bone.name,
    localOffsets,
  };

  for (const name of CLIP_NAMES) {
    const sourceClip = getSourceClip(name);
    const converted = retargetClip(targetMesh, sourceMesh, sourceClip, options);
    converted.duration = sourceClip.duration;
    clips.set(name, converted);
  }

  targetMesh.skeleton.pose();
};

const applySolidMaterials = (root: Object3D) => {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.frustumCulled = false;
    const material = child.material as { name?: string; color?: Color };
    if (material?.name?.includes("_HAIR") && material.color) {
      material.color.copy(HAIR_TINT);
    }
  });
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

const setupActions = (actionMixer: AnimationMixer, targetActions: Map<string, AnimationAction>, standing = false) => {
  const seatedClipName = standing ? "t-idle" : "idle";
  setupAction(
    targetActions,
    actionMixer,
    "desktop-idle",
    (action) => {
      action.loop = LoopPingPong;
      action.weight = 1;
    },
    seatedClipName,
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
    standing ? "t-idle" : "left-desktop",
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

  setupAction(targetActions, actionMixer, "contact-idle", (action) => {
    action.loop = LoopPingPong;
    action.weight = 0;
    action.play();
  });

  setupAction(targetActions, actionMixer, "wave", (action) => {
    action.clampWhenFinished = true;
    action.loop = LoopOnce;
  });
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
  setupActions(hologramMixer, hologramActions, true);

  hologramRoot.visible = false;

  parent.add(solidRoot);
  parent.add(hologramRoot);

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

const setWeight = (name: string, weight: number) => {
  const action = actions.get(name);
  if (action) action.setEffectiveWeight(weight);
  const hologramAction = hologramActions.get(name);
  if (hologramAction) hologramAction.setEffectiveWeight(weight);
};

const update = (delta: number) => {
  mixer?.update(delta);
  hologramMixer?.update(delta);
};

const updateHologramUniforms = () => {
  hologramUniforms.uTime.value = gsap.ticker.time;
  hologramUniforms.uProgress.value = aboutProgress.value * 1.1 - 0.1;
};

const setMode = (mode: "solid" | "hologram" | "transition") => {
  if (solidRoot) solidRoot.visible = mode !== "hologram";
  if (hologramRoot) hologramRoot.visible = mode !== "solid";
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
  solidRoot?.removeFromParent();
  hologramRoot?.removeFromParent();
  solidRoot = null;
  hologramRoot = null;
  faceMesh = null;
};

export const girl = {
  init,
  play,
  setWeight,
  update,
  updateHologramUniforms,
  setMode,
  setFaceWeights,
  getRightHandPropBone,
  actions,
  hologramActions,
  destroy,
};
