import { avatar } from ".";
import gsap from "gsap";
import { MathUtils } from "three";
import { sceneWeights } from "../../../animations/scenes";
import { face } from "./face";
import { sleepingSprite } from "../contact/sleeping-sprite";
import { playSound } from "../../../features/sounds/utils/sounds";
import { isFeatureEnabled } from "../../../utils/features";
import { stopSnoreRepetition } from "../../../features/sounds/core/contact";
import { girl } from "./girl";

let isAwake = false;
const wavingStrength = { value: isFeatureEnabled("introWave") ? 1 : 0 };

/** Contact greeting: overlay weight for the upright arm-wave clip. */
const contactWaveStrength = { value: 0 };

/**
 * `contact-wave` only animates the left arm chain and rides on top of
 * `contact-idle`, which is pinned at weight 1 and animates those same bones.
 * three.js normalises overlapping non-additive actions (PropertyMixer.accumulate
 * blends by `weight / cumulativeWeight`), so an overlay at weight w lands at
 * only w/(1+w) of its own pose — at "full strength" the arm was slerped exactly
 * halfway back to the idle pose, i.e. stuck out sideways with half the swing.
 * Pre-compensate so the requested strength is the mix the mixer actually
 * produces: weight w' = s/(1-s) gives w'/(1+w') = s.
 */
const WAVE_MAX_MIX = 0.98; // s = 1 would need an infinite weight
const overlayWeight = (strength: number) => {
  const mix = MathUtils.clamp(strength, 0, WAVE_MAX_MIX);
  return mix / (1 - mix);
};

/**
 * Delay between the wake-up cue and the greeting wave. Matched to the zzz
 * sprite, which lerps its opacity out over ~0.73s (sleeping-sprite.ts), so she
 * starts waving just as the icon clears rather than after the wake-up clip.
 */
const WAKE_TO_WAVE_DELAY_S = 0.75;
let waveGateOpen = false;
let lastContactWaveTime = -Infinity;
let waveTl: gsap.core.Timeline | null = null;

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
  setWeight("t-idle", 0);
  setWeight("sleeping", 0);
  setWeight("contact-idle", avatar.tIdleIntensity.value);
  setWeight("wake-up", 0);
  setWeight("wave", wavingStrength.value * (1 - avatar.tIdleIntensity.value));
  contactWaveStrength.value = 0;
  setWeight("contact-wave", 0);
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

const playContactWave = () => {
  const waveAction = girl.actions.get("contact-wave");
  if (!waveAction) return;

  const now = gsap.ticker.time;
  const duration = waveAction.getClip().duration;
  if (now - lastContactWaveTime < duration + 0.8) return;
  lastContactWaveTime = now;

  waveAction.reset().play();

  waveTl?.kill();
  waveTl = gsap.timeline();
  waveTl.to(contactWaveStrength, { value: 1, duration: 0.35, ease: "power1.out" }, 0);
  waveTl.to(contactWaveStrength, { value: 0, duration: 0.45, ease: "power1.in" }, Math.max(duration - 0.45, 0.4));

  return waveTl;
};

/** Greet now, if she is already awake. A request made while she is still
 *  asleep is absorbed by the wave wakeUp() has already scheduled. */
const requestContactWave = () => {
  if (!waveGateOpen) return;
  playContactWave();
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

  // Greet on the way out of the wake-up rather than waiting to be asked: the
  // scroll trigger only re-arms the wave for a later re-entry.
  gsap.delayedCall(WAKE_TO_WAVE_DELAY_S, () => {
    waveGateOpen = true;
    playContactWave();
  });

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
  setWeight("contact-wave", overlayWeight(contactWaveStrength.value));
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

export const animations = {
  init,
  play,
  actions: girl.actions,
  update,
  wakeUp,
  requestContactWave,
  getIsAwake: () => isAwake,
  wave,
};
