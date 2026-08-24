import { avatar } from "./avatar";
import { contact } from "./contact";
import { darkPlane } from "./dark-plane";
import { gridFloor } from "./grid-floor";
import { lab } from "./lab";
import { room } from "./room";
import { sleepingSprite } from "./contact/sleeping-sprite";
import { renderer } from "../core/renderer";

const init = () => {
  const modules = [
    ["avatar", avatar],
    ["contact", contact],
    ["darkPlane", darkPlane],
    ["gridFloor", gridFloor],
    ["lab", lab],
    ["room", room],
    ["sleepingSprite", sleepingSprite],
  ] as const;

  for (const [name, module] of modules) {
    try {
      module.init();
    } catch (error) {
      console.error(`[Objects] Failed to initialize "${name}":`, error);
    }
  }

  renderer.compile();
};

const destroy = () => {
  avatar.destroy();
  contact.destroy();
  darkPlane.destroy();
  gridFloor.destroy();
  lab.destroy();
  room.destroy();
  sleepingSprite.destroy();
};

export const objects = { init, destroy };
