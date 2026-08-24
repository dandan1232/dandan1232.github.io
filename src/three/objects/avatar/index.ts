import { Vector3, Euler, Group } from "three";
import { scene } from "../../core/scene";
import { sceneWeights, sceneWeightsInOut } from "../../../animations/scenes";
import { animations } from "./animations";
import { leftDesktop as avatarLeftDesktop } from "./left-desktop";
import { girl } from "./girl";
import { face } from "./face";
import gsap from "gsap";
import { aboutProgress } from "../../../animations/transitions/about";

const tIdleIntensity = { value: 0 };

const waypointsPosition = new Vector3();
const waypointsRotation = new Euler();
const transform = new Group();
const uniforms = { uProgress: { value: 0 }, uAmbientStrength: { value: 0 } };
const contactPosition = new Vector3(0, -13.25, 0);
const contactRotation = new Euler(0, -Math.PI, 0);

const init = () => {
  girl.init(transform);
  scene.instance.add(transform);
  animations.init();
  face.init();
  avatarLeftDesktop.init();
  gsap.ticker.add(tick);
};

const tick = () => {
  animations.update();

  const isContact = sceneWeights.contact > 0.001;
  girl.setStandingProgress(isContact ? 1 : tIdleIntensity.value, isContact);
  const isAbout = !isContact && sceneWeights.about > 0.001;
  const mode = isContact ? "solid" : isAbout ? (aboutProgress.value >= 0.995 ? "hologram" : "transition") : "solid";
  girl.setMode(mode, aboutProgress.value);
  girl.updateHologramUniforms();

  if (isContact) {
    transform.position.copy(contactPosition);
    transform.rotation.copy(contactRotation);
    uniforms.uProgress.value = 0;
    uniforms.uAmbientStrength.value = 0;
    return;
  }

  transform.position.copy(waypointsPosition);
  transform.rotation.copy(waypointsRotation);

  uniforms.uProgress.value = aboutProgress.value * 1.1 - 0.1;
  uniforms.uAmbientStrength.value = sceneWeightsInOut.about.in;
};

const destroy = () => {
  girl.destroy();
  face.destroy();
  gsap.ticker.remove(tick);
};

export const avatar = {
  init,
  destroy,
  getRightHandBone: () => girl.getRightHandPropBone(),
  tIdleIntensity,
  waypointsPosition,
  waypointsRotation,
  uniforms,
  transform,
};
