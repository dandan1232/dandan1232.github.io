import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { SRGBColorSpace, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./EventEmitter";
import { sources } from "../sources";

import type { Texture } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const isProd = import.meta.env.PROD;

type ResourceType = Texture | GLTF;

class Resources extends EventEmitter<{
  ready: void;
  progress: number;
  error: "network" | "timeout";
}> {
  toLoad = sources.length;
  isReady = false;
  loaded = 0;
  items: Record<string, any> = {};
  failure: "network" | "timeout" | null = null;
  disabled = false;
  private started = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  loaders: {
    gltfLoader: GLTFLoader;
    textureLoader: TextureLoader;
    fontLoader: FontLoader;
  };

  constructor() {
    super();

    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new TextureLoader(),
      fontLoader: new FontLoader(),
    };
  }

  startLoading() {
    if (this.started || this.disabled) return;
    this.started = true;
    this.timeout = setTimeout(() => this.sourceFailed("timeout"), 30_000);

    for (const source of sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(
          source.path,
          (file) => this.sourceLoaded(source, file),
          undefined,
          () => this.sourceFailed("network"),
        );
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(
          source.path,
          (file: Texture) => {
            file.colorSpace = SRGBColorSpace;
            this.sourceLoaded(source, file);
          },
          undefined,
          () => this.sourceFailed("network"),
        );
      }
    }
  }

  sourceLoaded(source: { name: string; type: string; path: string }, file: ResourceType) {
    if (this.failure || this.disabled || this.isReady) return;
    this.items[source.name] = file;

    this.loaded++;

    this.emit("progress", this.loaded / this.toLoad);

    if (this.loaded === this.toLoad) {
      this.clearTimeout();
      this.isReady = true;
      this.emit("ready");
      this.log("All resources loaded");
    }
  }

  sourceFailed(reason: "network" | "timeout") {
    if (this.isReady || this.failure || this.disabled) return;
    this.failure = reason;
    this.clearTimeout();
    this.emit("error", reason);
  }

  disable() {
    this.disabled = true;
    this.clearTimeout();
  }

  private clearTimeout() {
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.timeout = null;
  }

  log(message: string) {
    if (isProd) return;
    console.log(`[Resources] ${message}`);
  }
}

export const resources = new Resources();
resources.startLoading();
