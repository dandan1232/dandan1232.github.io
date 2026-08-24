import { avatar } from ".";
import gsap from "gsap";
import { sceneWeights } from "../../../animations/scenes";
import { face } from "./face";
import { sleepingSprite } from "../contact/sleeping-sprite";
import { playSound } from "../../../features/sounds/utils/sounds";
import { isFeatureEnabled } from "../../../utils/features";
import { stopSnoreRepetition } from "../../../features/sounds/core/contact";
import { girl } from "./girl";

let isAwake = false;
const wavingStrength = { value: isFeatureEnabled("introWave") ? 1 : 0 };

const init = () => {
  play("desktop-idle");
  wave();
};

const play = (name: string, transition: number = 0.5) => {
  girl.play(name, transition);
};

const setWeight = (key: string, weight: number) => {
  girl.setSolidWeight(key, weight);
};

const updateHologram = () => {
  girl.setHologramWeight("desktop-idle", 1);
};

const updateIntro = () => {
  setWeight("desktop-idle", (1 - avatar.tIdleIntensity.value) * (1 - wavingStrength.value));
  setWeight("left-desktop", (1 - avatar.tIdleIntensity.value) * (1 - wavingStrength.value));
  setWeight("t-idle", avatar.tIdleIntensity.value);
  setWeight("sleeping", 0);
  setWeight("contact-idle", 0);
  setWeight("wake-up", 0);
  setWeight("wave", wavingStrength.value * (1 - avatar.tIdleIntensity.value));
};

const wave = () => {
  const waveAction = girl.actions.get("wave");
  if (!waveAction) return;
  const tl = gsap.timeline();

  const waveDuration = waveAction.getClip().duration;
  waveAction.play();

  tl.add(face.wave());
  tl.fromTo(wavingStrength, { value: 1 }, { value: 0 }, waveDuration - 0.2);

  return tl;
};

const wakeUp = () => {
  if (isAwake) return;
  isAwake = true;
  const sleepingAction = girl.actions.get("sleeping");
  const wakeUpAction = girl.actions.get("wake-up");
  const contactIdleAction = girl.actions.get("contact-idle");
  if (!sleepingAction || !wakeUpAction || !contactIdleAction) return;

  stopSnoreRepetition();
  playSound("gasp");

  sleepingAction.crossFadeTo(wakeUpAction, 0.2);
  wakeUpAction.play();

  const wakeUpDuration = wakeUpAction.getClip().duration;

  setTimeout(() => {
    wakeUpAction.crossFadeTo(contactIdleAction, 0.5);
    contactIdleAction.play();
  }, wakeUpDuration * 1000);

  face.wakeUp();
  sleepingSprite.hide();
};

const updateContact = () => {
  setWeight("desktop-idle", 0);
  setWeight("left-desktop", 0);
  setWeight("t-idle", 0);
  setWeight("sleeping", 0);
  setWeight("contact-idle", 1);
  setWeight("wake-up", 0);
  setWeight("wave", 0);
};

const update = () => {
  const isContact = sceneWeights.contact > 0.001;
  if (isContact) {
    updateContact();
  } else {
    updateIntro();
  }
  updateHologram();

  const delta = gsap.ticker.deltaRatio(60);
  girl.update(delta / 60);
};

export const animations = { init, play, actions: girl.actions, update, wakeUp, getIsAwake: () => isAwake, wave };
