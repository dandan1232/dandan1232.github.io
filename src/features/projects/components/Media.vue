<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import gsap from "gsap";
import Notch from "../../../components/Notch.vue";
import { t } from "../../../i18n/utils/translate";

const wrapperRef = ref<HTMLElement | null>(null);
const mediaRef = ref<HTMLVideoElement | HTMLImageElement | null>(null);
const mediaContentRef = ref<HTMLElement | null>(null);

export interface Props {
  type: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
  presentation?: "cover" | "screenshot";
  index: number;
}

const props = defineProps<Props>();
const isScreenshot = computed(() => props.type === "image" && props.presentation === "screenshot");

const wrapperClasses = computed(() => {
  return {
    "project-media": true,
    "project-media-screenshot": isScreenshot.value,
  };
});

watchEffect(async (onInvalidate) => {
  if (!wrapperRef.value || isScreenshot.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapperRef.value,
      start: "top bottom",
      end: "bottom bottom",
      toggleActions: "play none none reset",
    },
  });
  tl.fromTo(mediaContentRef.value, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "power1.out" }, 0);
  tl.fromTo(mediaRef.value, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "power1.out" }, 0);

  onInvalidate(() => {
    tl.kill();
    gsap.set(mediaContentRef.value, { scale: 1 });
    gsap.set(mediaRef.value, { scale: 1 });
  });
});
</script>

<template>
  <figure :class="wrapperClasses" ref="wrapperRef">
    <component
      :is="isScreenshot ? 'a' : 'div'"
      class="project-media-content"
      ref="mediaContentRef"
      :href="isScreenshot ? props.src : undefined"
      :target="isScreenshot ? '_blank' : undefined"
      :rel="isScreenshot ? 'noopener noreferrer' : undefined"
      :aria-label="isScreenshot ? `${t('view-full-image')}: ${props.alt || props.caption || ''}` : undefined"
    >
      <img
        v-if="props.type === 'image'"
        :src="props.src"
        :alt="props.alt"
        loading="lazy"
        decoding="async"
        class="project-media-image"
        ref="mediaRef"
      />
      <video
        v-else
        :src="props.src"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        class="project-media-video"
        ref="mediaRef"
      >
        <source :src="props.src" type="video/mp4" />
      </video>
    </component>
    <figcaption class="project-media-caption" v-if="props.caption">
      <Notch v-if="!isScreenshot" class="project-media-caption-notch project-media-caption-notch-left" />
      <Notch v-if="!isScreenshot" class="project-media-caption-notch project-media-caption-notch-top" />
      <p class="project-media-caption-copy">{{ props.caption }}</p>
      <p v-if="isScreenshot" class="project-media-hint">{{ t("view-full-image") }}</p>
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.project-media {
  margin: 0;
  width: 100%;
  height: 100%;
  grid-column: 1 / 13;
  max-width: 900px;
  justify-self: center;
  position: relative;
  aspect-ratio: 16 / 9;

  @include mixins.mq("md") {
    grid-column: 2 / 12;
  }

  @include mixins.mq("lg") {
    grid-column: 3 / 11;
  }

  &-caption {
    position: absolute;
    bottom: -1px;
    right: -1px;
    background-color: var(--color-background-400);
    padding: var(--space-xxs) var(--space-sm);
    border-radius: var(--radius-md) 0 0 0;

    @include mixins.mq("md") {
      padding: var(--space-xxs) var(--space-sm);
    }

    @include mixins.mq("lg") {
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-lg) 0 0 0;
    }

    &-notch {
      position: absolute;
      color: var(--color-background-400);
      --icon-color: var(--color-background-400);
      width: var(--radius-md);

      @include mixins.mq("md") {
        width: var(--radius-lg);
      }

      &-left {
        left: 0;
        bottom: 0;
        transform: translate(-100%, 0) scale(-1) rotate(90deg);
      }

      &-top {
        top: 0;
        right: 0;
        transform: translate(0, -100%) scale(-1) rotate(90deg);
      }
    }

    &-copy {
      font-size: var(--font-size-sm);
      font-weight: 700;

      @include mixins.mq("md") {
        font-size: var(--font-size-md);
      }
    }
  }

  &-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &-content {
    overflow: hidden;
    border-radius: var(--radius-lg);
    background-color: var(--color-background-300);
    width: 100%;
    height: 100%;
  }

  &-screenshot {
    height: auto;
    aspect-ratio: auto;

    .project-media-content {
      display: block;
      height: auto;

      &:focus-visible {
        outline: 3px solid var(--color-accent-400);
        outline-offset: 4px;
      }
    }

    .project-media-image {
      display: block;
      height: auto;
      object-fit: contain;
    }

    .project-media-caption {
      position: static;
      padding: var(--space-sm) 0 0;
      border-radius: 0;
      background: transparent;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
  }

  &-hint {
    margin-top: var(--space-xxs);
    color: var(--color-text-300);
    font-size: var(--font-size-sm);
  }
}
</style>
