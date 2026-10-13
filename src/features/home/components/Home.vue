<script setup lang="ts">
import Layout from "../../../components/Layout.vue";
import Hero from "./Hero.vue";
import About from "./About.vue";
//import AboutSections from "../features/about/Sections.vue";
import Projects from "./Projects.vue";
import TechStack from "./TechStack.vue";
import Notes from "./Notes.vue";
import Contact from "./Contact.vue";
import Footer from "../../../components/Footer.vue";
import { ref, onMounted, onUnmounted, watchEffect, computed, watch } from "vue";
import { three } from "../../../three";
import { animations } from "../../../animations";
import HeaderHome from "../../../components/HeaderHome.vue";
import { preloaderVisible, staticMode } from "../../../composables/usePreloader";
import { t } from "../../../i18n/utils/translate";
import ScrollIcon from "../../../components/ScrollIcon.vue";
import { raycast } from "../../../three/utils/raycast";
import gsap from "gsap";
import { useAgent } from "../../../composables/useAgent";
import { projectId, projectVisible } from "../../../composables/useRouteObserver";
import { isTransitioning } from "../../../composables/useProjectTransition";
import { renderer } from "../../../three/core/renderer";

const introRef = ref<HTMLElement | null>(null);
const stickyObserver = ref<IntersectionObserver | null>(null);
const scrolledPastIntro = ref(false);
const projectsLoaded = ref(false);
const contactRef = ref<HTMLElement | null>(null);
const contactBottom = ref<number>(0);
const aboutSpacerRef = ref<HTMLElement | null>(null);
const isHoveringObject3D = ref<boolean>(false);
const threeCanvasRef = ref<HTMLCanvasElement | null>(null);
const threeInitialized = ref<boolean>(false);
const { isTouch } = useAgent();

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  scrolledPastIntro.value = entries[0]?.isIntersecting ?? false;
};

const isStickyVisible = computed(() => {
  return scrolledPastIntro.value || !projectsLoaded.value;
});

const updateContactBottomOffset = () => {
  if (!contactRef.value) return;
  const bounding = contactRef.value.getBoundingClientRect();
  const documentBottom = document.documentElement.scrollHeight;
  const elementBottom = bounding.bottom + window.scrollY;
  // distance from bottom of document to bottom of contact section
  contactBottom.value = documentBottom - elementBottom;
};

watch([projectVisible, isTransitioning], () => {
  if (!projectVisible.value) {
    updateContactBottomOffset();
  }
});

watchEffect((onInvalidate) => {
  if (!contactRef.value || preloaderVisible.value) return;

  const resizeObserver = new ResizeObserver(updateContactBottomOffset);
  resizeObserver.observe(contactRef.value as HTMLElement);

  //const intersectionObserver = new IntersectionObserver(updateContactBottomOffset);
  //intersectionObserver.observe(contactRef.value as HTMLElement);

  onInvalidate(() => {
    resizeObserver.disconnect();
    //intersectionObserver.disconnect();
  });
});

const updateCursor = () => {
  if (isTouch.value) return;
  const hoveringBox = raycast.getHoveringBox();
  const shouldBePointer = !!hoveringBox;

  if (shouldBePointer !== isHoveringObject3D.value) {
    isHoveringObject3D.value = shouldBePointer;
    document.documentElement.style.cursor = shouldBePointer ? "pointer" : "";
  }
};

onMounted(() => {
  stickyObserver.value = new IntersectionObserver(handleIntersection);
  stickyObserver.value.observe(introRef.value as HTMLElement);

  if (threeCanvasRef.value && !threeInitialized.value) {
    three.init(threeCanvasRef.value);
    threeInitialized.value = true;
  }

  gsap.ticker.add(updateCursor);
});

onUnmounted(() => {
  stickyObserver.value?.disconnect();
  stickyObserver.value = null;

  three.destroy();

  document.documentElement.style.cursor = "";

  gsap.ticker.remove(updateCursor);
  animations.destroy();
});

const handleProjectsLoaded = () => {
  projectsLoaded.value = true;
};

watchEffect((onInvalidate) => {
  if (
    projectsLoaded.value &&
    threeInitialized.value &&
    //(projectId.value === null || isTransitioning.value) &&
    !preloaderVisible.value &&
    !staticMode.value
  ) {
    animations.init();
  }

  onInvalidate(() => {
    animations.destroy();
  });
});

watch(staticMode, (enabled) => {
  if (!enabled) return;
  stickyObserver.value?.disconnect();
  gsap.ticker.remove(updateCursor);
  document.documentElement.style.cursor = "";
  three.destroy();
  threeInitialized.value = false;
});

watch(
  [projectVisible, staticMode],
  ([visible, without3D]) => {
    renderer.setIsActive(!visible && !without3D);
  },
  { immediate: true },
);
</script>

<template>
  <div
    :class="[
      'home-wrapper',
      { 'home-wrapper-static': staticMode },
      typeof projectId === 'string' && isTransitioning && `home-wrapper-out`,
      typeof projectId !== 'string' && isTransitioning && `home-wrapper-in`,
    ]"
  >
    <ScrollIcon v-if="!staticMode" />
    <Layout>
      <section v-if="staticMode" class="home-static-intro" id="hero">
        <h1 tabindex="-1">念安 · Echo</h1>
        <p>{{ t('job-title') }}</p>
        <div id="about">
          <h2>{{ t('about') }}</h2>
          <p v-html="t('about-intro')"></p>
        </div>
      </section>
      <div v-else class="intro-wrapper" ref="introRef">
        <div
          class="intro-sticky"
          :class="{ 'intro-sticky-visible': isStickyVisible }"
          :style="{ '--contact-bottom': `${contactBottom}px` }"
        >
          <canvas :class="['three-canvas', { 'three-canvas-contact': !isStickyVisible }]" ref="threeCanvasRef"></canvas>
          <div :class="{ 'intro-about-hidden': !isStickyVisible }">
            <About :spacer-ref="aboutSpacerRef" />
          </div>
        </div>
        <Hero class="intro-hero" id="hero" />
        <div class="intro-wrapper-spacer"></div>
        <div class="about-spacer" ref="aboutSpacerRef" id="about"></div>
      </div>
      <TechStack id="stack" />
      <Projects id="projects" @loaded="handleProjectsLoaded" />
      <Notes id="notes" />
      <div ref="contactRef" class="home-contact">
        <Contact id="contact" v-if="projectsLoaded" />
      </div>
      <Footer :withSocial="false"></Footer>
    </Layout>
  </div>
  <HeaderHome v-if="projectsLoaded" />
</template>

<style scoped lang="scss">
.three-canvas {
  width: calc(var(--svw) * 100);
  height: calc(var(--lvh) * 100);
  max-height: calc(var(--lvh) * 100);
  position: relative;
  overflow: hidden;

  &-contact {
    position: absolute;
    bottom: var(--contact-bottom);
    left: 0;
    width: 100%;
    height: calc(var(--lvh) * 100);
    max-height: calc(var(--lvh) * 100);
  }
}

.home {
  &-static-intro {
    width: min(100%, 960px);
    padding: calc(var(--height-header) + 48px) var(--space-outer) 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    line-height: 1.7;

    h1 {
      font-size: clamp(36px, 7vw, 56px);
      line-height: 1.2;
    }

    h2 {
      margin-bottom: 12px;
    }
  }

  &-wrapper-static .home-contact {
    min-height: 400px;
    max-height: none;
  }

  &-wrapper {
    transform-origin: center center;

    @media (max-width: 1023px) {
      padding-bottom: calc(80px + env(safe-area-inset-bottom));
    }

    &-out {
      animation: home-wrapper-out var(--transition-route-duration) var(--transition-route-ease);
    }

    &-in {
      animation: home-wrapper-in var(--transition-route-duration) var(--transition-route-ease);
    }

    @keyframes home-wrapper-out {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(0.95);
      }
    }

    @keyframes home-wrapper-in {
      0% {
        transform: scale(0.95);
      }
      100% {
        transform: scale(1);
      }
    }
  }

  &-contact {
    width: 100%;
    min-height: calc(var(--lvh) * 100);
    max-height: calc(var(--lvh) * 100);
  }
}

.about-spacer {
  max-height: calc(var(--lvh) * 250);
  min-height: calc(var(--lvh) * 250);
}

.intro-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;

  &-spacer {
    display: none;

    @include mixins.mq("md") {
      display: block;
      height: 200px;
    }
  }
}

.intro-hero {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: calc(var(--lvh) * 100);
  min-height: calc(var(--lvh) * 100);
  overflow: hidden;
}

.intro-about-hidden {
  visibility: hidden;
}

.intro-sticky {
  top: 0;
  left: 0;
  width: 100%;
  max-height: calc(var(--lvh) * 100);
  min-height: calc(var(--lvh) * 100);
  overflow: hidden;
  z-index: -1;
  display: flex;
  align-items: flex-end;

  &-visible {
    position: sticky;
  }
}

.intro-sticky-content {
  width: calc(var(--svw) * 100);
  height: calc(var(--lvh) * 100);
  max-height: calc(var(--lvh) * 100);
  position: relative;
  overflow: hidden;

  &-contact {
    position: absolute;
    bottom: var(--contact-bottom);
    left: 0;
    width: 100%;
    height: calc(var(--lvh) * 100);
    max-height: calc(var(--lvh) * 100);
  }
}
</style>
