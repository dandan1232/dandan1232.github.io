import { camera } from "./core/camera";
import { renderer } from "./core/renderer";
import { objects } from "./objects";
import { renderTarget } from "./core/renderTarget";
import { threeSizes } from "./utils/sizes";
import { resources } from "../utils/resources";
import { raycast } from "./utils/raycast";

let canvas: HTMLCanvasElement | null = null;
let initialized = false;
let pendingSetup: (() => void) | null = null;

const init = (_canvas: HTMLCanvasElement) => {
  canvas = _canvas;

  const setup = () => {
    if (pendingSetup) resources.off("ready", pendingSetup);
    pendingSetup = null;
    if (initialized || !canvas || resources.disabled || resources.failure) return;
    initialized = true;

    threeSizes.init(canvas);
    camera.init();
    renderTarget.init();
    renderer.init(canvas);
    objects.init();
    raycast.init();
  };

  if (resources.isReady) {
    setup();
  } else {
    pendingSetup = setup;
    resources.on("ready", setup);
  }
};

const destroy = () => {
  if (pendingSetup) resources.off("ready", pendingSetup);
  pendingSetup = null;
  canvas = null;
  if (!initialized) return;
  threeSizes.destroy();
  renderTarget.destroy();
  renderer.destroy();
  objects.destroy();
  camera.destroy();
  initialized = false;
};

export const three = { init, destroy };
