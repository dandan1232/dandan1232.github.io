<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue";
import { onMounted, ref } from "vue";
import { t } from "../i18n/utils/translate";
import { lenis } from "../composables/useScroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeaderTheme } from "../composables/useHeaderTheme";
import { projectId } from "../composables/useRouteObserver";

const handleLinkClick = (link: string) => {
  if (lenis.value) {
    lenis.value.scrollTo(link);
  } else {
    document.querySelector(link)?.scrollIntoView();
  }
};

type ActiveLink = "about" | "stack" | "projects" | "notes" | "contact";
const activeLink = ref<ActiveLink | null>(null);
const sections: ActiveLink[] = ["about", "stack", "projects", "notes", "contact"];
const mobileSections: ActiveLink[] = ["projects", "notes", "contact"];

const isMounted = ref(false);

const barStyle = ref({ transform: "" });
const ITEM_WIDTH = 128;

const { isDarkTheme, hasScrolledIntoView } = useHeaderTheme();

const updateBarPosition = () => {
  const index = sections.indexOf(activeLink.value as ActiveLink);
  const left = index * ITEM_WIDTH;
  barStyle.value = {
    transform: `translateX(${left}px)`,
  };
};

onMounted(() => {
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: `#${section}`,
      start: section === "about" ? "top 22.5%" : "top center",
      end: "bottom center",
      onEnter: () => {
        activeLink.value = section;
        updateBarPosition();
      },
      onEnterBack: () => {
        activeLink.value = section;
        updateBarPosition();
      },
      onLeave: () => (activeLink.value = null),
      onLeaveBack: () => (activeLink.value = null),
    });
  });

  ScrollTrigger.refresh();

  isMounted.value = true;
});
</script>

<template>
  <nav
    :aria-label="t('page-navigation')"
    :class="['header-home', { 'header-home-mounted': isMounted, 'header-home-isProjectPage': projectId !== null }]"
  >
    <div :class="['header-home-mobile-links', { 'header-home-mobile-links-dark': isDarkTheme }]">
      <HeaderLink
        v-for="section in mobileSections"
        :key="section"
        class="header-home-mobile-link"
        :is-active="activeLink === section"
        :is-dark-theme="isDarkTheme"
        :aria-current="activeLink === section ? 'location' : undefined"
        @click="handleLinkClick('#' + section)"
      >{{ t(section) }}</HeaderLink>
    </div>
    <div :class="['header-home-links', { 'header-home-links-dark': isDarkTheme }]">
      <div
        :class="[
          'header-home-bar',
          { 'header-home-bar-active': activeLink !== null && hasScrolledIntoView, 'header-home-bar-dark': isDarkTheme },
        ]"
        :style="barStyle"
      ></div>
      <HeaderLink
        v-for="section in sections"
        :key="section"
        :is-active="activeLink === section"
        :class="[
          'header-home-link',
          { 'header-home-link-active': activeLink === section && hasScrolledIntoView },
          'children-unclickable',
        ]"
        @click="handleLinkClick('#' + section)"
        :is-dark-theme="isDarkTheme"
        :aria-label="t(section)"
        data-sound="click"
        data-hoversound="hover"
      >
        {{ t(section) }}
      </HeaderLink>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.header-home {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-index-header-home);
  width: min(calc(100% - 32px), 360px);
  align-items: center;
  justify-content: center;
  display: flex;
  opacity: 0;
  transition:
    opacity 0.3s ease-in-out,
    transform var(--transition-route-duration) var(--transition-route-ease);

  &-isProjectPage {
    visibility: hidden;
    pointer-events: none;
    transform: translateX(-50%) translateY(150%);
  }

  &-mounted {
    opacity: 1;
  }

  @include mixins.mq("lg") {
    top: 0;
    bottom: auto;
    width: auto;
    height: var(--height-header);

    &-isProjectPage {
      transform: translateX(-50%) translateY(-100%);
    }
  }

  &-mobile-links {
    display: flex;
    width: 100%;
    padding: 4px;
    background-color: var(--color-beige-500);
    border: 1px solid var(--color-text-300);
    border-radius: 100px;

    &-dark {
      background-color: var(--color-dark-blue-500);
      border-color: var(--color-text-cyan-300);
      color: var(--color-white-400);
    }

    @include mixins.mq("lg") {
      display: none;
    }
  }

  &-mobile-link {
    position: relative;
    flex: 1;
    width: auto;
    min-height: 44px;

    &[aria-current="location"] {
      background: var(--color-orange-400);
      color: var(--color-text-400);
    }

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -4px;
    }
  }

  &-links {
    position: relative;
    display: none;
    padding: 3px;
    background-color: var(--color-beige-500);
    border-radius: 100px;
    color: var(--color-text-400);
    transition:
      color 0.1s ease-in-out,
      background-color 0.1s ease-in-out;

    @include mixins.mq("lg") {
      display: flex;
    }

    &-dark {
      background-color: var(--color-dark-blue-500);
      color: var(--color-white-400);
    }
  }

  &-bar {
    position: absolute;
    top: 3px;
    left: 3px;
    height: calc(100% - 6px);
    width: 128px;
    background: var(--color-orange-400);
    border-radius: 100px;
    transition:
      transform 0.3s var(--ease-smooth),
      opacity 0.1s ease-in-out,
      background-color 0.1s ease-in-out;
    z-index: 1;
    opacity: 0;

    &-dark {
      background-color: var(--color-cyan-500);
    }

    &-active {
      opacity: 1;
    }
  }

  &-link {
    position: relative;
    z-index: 2;
    letter-spacing: 0.02em;
    font-weight: 700;
    border: none;
    background: none;
    transition: color 0.1s ease-in-out;
    font-size: var(--font-size-md);
    width: 128px;
    white-space: nowrap;
    text-transform: uppercase;

    &-active {
      color: var(--color-white-400);
    }
  }
}
</style>
