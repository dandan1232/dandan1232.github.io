import gsap from "gsap";
import { girl } from "./girl";
import { sceneWeights } from "../../../animations/scenes";

type PresetName = "neutral" | "joy" | "surprised" | "sleep";

const PRESETS: Record<PresetName, Record<string, number>> = {
  neutral: {},
  joy: { joy: 1 },
  surprised: { surprised: 1 },
  sleep: { blink: 1, fun: 0.55 },
};

const CONTROLLED_MORPHS = ["blink", "joy", "surprised", "fun", "angry", "sorrow"] as const;

const blinkWeight = { value: 0 };

const introFace: { value: PresetName } = { value: "neutral" };
const contactFace: { value: PresetName } = { value: "sleep" };

const init = () => {
  gsap.ticker.add(tick);
  scheduleBlinkInterval();
};

const scheduleBlinkInterval = () => {
  gsap.delayedCall(3 + Math.random() * 3, () => {
    scheduleBlinkInterval();
    blink();
  });
};

const blink = () => {
  if (!canBlink()) return;
  const tl = gsap.timeline();
  tl.to(blinkWeight, { value: 1, duration: 0.12, ease: "power2.out" });
  tl.to(blinkWeight, { value: 0, duration: 0.2, ease: "power2.out" });
};

const canBlink = (): boolean => {
  const isContact = sceneWeights.contact > 0.001;
  if (isContact) {
    return contactFace.value === "joy";
  }
  return introFace.value === "neutral";
};

const wakeUp = () => {
  const tl = gsap.timeline();
  tl.set(contactFace, { value: "surprised" }, 0);
  tl.set(contactFace, { value: "joy" }, 0.46);
};

const wave = () => {
  const tl = gsap.timeline();

  const RESET_AFTER = 3;
  tl.set(introFace, { value: "joy" }, 0);
  tl.set(introFace, { value: "neutral" }, RESET_AFTER);

  return tl;
};

const apply = (preset: PresetName) => {
  const weights: Record<string, number> = {};
  for (const key of CONTROLLED_MORPHS) weights[key] = 0;
  Object.assign(weights, PRESETS[preset]);

  if ((preset === "neutral" && introFace.value === "neutral") || (preset === "joy" && canBlink())) {
    weights.blink = Math.max(weights.blink ?? 0, blinkWeight.value);
  }

  girl.setFaceWeights(weights);
};

const tick = () => {
  const isContact = sceneWeights.contact > 0.001;
  if (isContact) {
    apply(contactFace.value);
  } else {
    const isAbout = sceneWeights.about > 0.1;
    apply(isAbout ? "neutral" : introFace.value);
  }
};

const destroy = () => {
  gsap.ticker.remove(tick);
};

export const face = { init, destroy, wakeUp, wave };
