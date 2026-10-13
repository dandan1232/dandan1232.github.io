import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { resources } from "../utils/resources";
import gsap from "gsap";

export const preloaderVisible = ref(true);
export const staticMode = ref(false);
export const loadingFailure = ref(resources.failure);

const hidePreloader = () => {
  document.body.classList.remove("is-loading");
  document.querySelector(".preloader")?.classList.add("preloader-hidden");
  preloaderVisible.value = false;
};

export const usePreloader = () => {
  const progress = ref(0);
  const resourcesProgress = ref(0);
  let completionCall: gsap.core.Tween | null = null;
  const handleProgress = (newProgress: number) => {
    resourcesProgress.value = newProgress;
  };
  const handleError = (reason: "network" | "timeout") => {
    loadingFailure.value = reason;
  };

  onMounted(() => {
    resources.on("progress", handleProgress);
    resources.on("error", handleError);
    handleProgress(resources.loaded / resources.toLoad);
    loadingFailure.value = resources.failure;
  });

  onUnmounted(() => {
    resources.off("progress", handleProgress);
    resources.off("error", handleError);
    completionCall?.kill();
  });

  watch(loadingFailure, async (reason) => {
    if (!reason) return;
    await nextTick();
    document.querySelector<HTMLButtonElement>(".preloader-error button")?.focus();
  });

  watch(
    resourcesProgress,
    (newProgress) => {
      progress.value = 0.25 + newProgress * 0.75;
    },
    { immediate: true },
  );

  watch(
    progress,
    (newProgress) => {
      const rect = document.querySelector<HTMLElement>(".preloader-rect");
      if (newProgress === 1) {
        completionCall = gsap.delayedCall(0.2, () => {
          if (!resources.failure && !resources.disabled) hidePreloader();
        });
      }

      if (rect) rect.style.transform = `scaleY(${newProgress})`;
    },
    { immediate: true },
  );

  const continueWithout3D = () => {
    resources.disable();
    loadingFailure.value = null;
    staticMode.value = true;
    hidePreloader();
    void nextTick(() => document.querySelector<HTMLElement>(".home-static-intro h1")?.focus());
  };

  return {
    loadingFailure,
    retryLoading: () => window.location.reload(),
    continueWithout3D,
  };
};
