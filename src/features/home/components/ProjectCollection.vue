<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "../../../components/Link.vue";
import Plus from "../../../components/icons/Plus.vue";
import ArrowRight from "../../../components/icons/ArrowRight.vue";
import { projectCollection } from "../../../content/projects/collection";
import { lenis } from "../../../composables/useScroll";
import { locale } from "../../../i18n/store";
import { t } from "../../../i18n/utils/translate";

const isOpen = ref(false);
const language = computed(() => (locale.value === "en" ? "en" : "zh"));

const refreshLayout = async () => {
  await nextTick();
  lenis.value?.resize();
  ScrollTrigger.refresh();
};

const handleToggle = (event: Event) => {
  isOpen.value = (event.currentTarget as HTMLDetailsElement).open;
  refreshLayout();
};

watch(language, refreshLayout);
</script>

<template>
  <details class="project-collection" @toggle="handleToggle">
    <summary class="project-collection-summary" data-hoversound="hover" data-sound="click">
      <span class="project-collection-intro">
        <span class="project-collection-heading">
          <span class="project-collection-title">{{ t("project-collection-title") }}</span>
          <span class="project-collection-count">{{ t("project-collection-count", { count: projectCollection.length }) }}</span>
        </span>
        <span class="project-collection-description">{{ t("project-collection-description") }}</span>
      </span>
      <span class="project-collection-action" aria-hidden="true">
        {{ t(isOpen ? "project-collection-collapse" : "project-collection-expand") }}
        <Plus class="project-collection-toggle-icon" />
      </span>
    </summary>

    <ul v-if="isOpen" class="project-collection-list">
      <li v-for="project in projectCollection" :key="project.source">
        <Link
          class="project-collection-link children-unclickable"
          :href="project.source"
          external
          :aria-label="t('project-collection-link', { project: project.title[language] })"
          data-cursor="arrow-external"
          data-hoversound="hover"
        >
          <img
            class="project-collection-image"
            :src="`/images/project-collection/${project.thumbnail}.jpg`"
            alt=""
            width="96"
            height="64"
            loading="lazy"
            decoding="async"
          />
          <span class="project-collection-copy">
            <span v-if="project.badge" class="project-collection-badge">{{ project.badge[language] }}</span>
            <span class="project-collection-name">
              {{ project.title[language] }}
            </span>
            <span class="project-collection-project-description">{{ project.description[language] }}</span>
          </span>
          <ArrowRight class="project-collection-link-icon" aria-hidden="true" />
        </Link>
      </li>
    </ul>
  </details>
</template>

<style scoped lang="scss">
.project-collection {
  --icon-color: var(--color-text-400);
  grid-column: 1 / 13;
  min-width: 0;
  border: 1px solid var(--color-beige-700);
  border-radius: var(--radius-lg);

  @include mixins.mq("lg") {
    grid-column: 3 / span 8;
  }

  &-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md);
    list-style: none;
    border-radius: inherit;

    &::-webkit-details-marker {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid var(--color-text-400);
      outline-offset: 4px;
    }

    @include mixins.mq("md") {
      padding: var(--space-lg);
    }
  }

  &-intro,
  &-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }

  &-heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  &-title {
    font-size: var(--font-size-title-xs);
    font-weight: 700;
  }

  &-count,
  &-description,
  &-project-description {
    color: var(--color-text-300);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  &-action {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
    font-size: var(--font-size-sm);
    font-weight: 700;
  }

  &-toggle-icon {
    width: 18px;
    height: 18px;
    transition: transform 0.18s var(--ease-power2-out);
  }

  &[open] &-toggle-icon {
    transform: rotate(45deg);
  }

  &-list {
    display: grid;
    padding: 0 var(--space-md) var(--space-xs);

    @include mixins.mq("md") {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--space-lg);
      padding: 0 var(--space-lg) var(--space-xs);
    }

    > li {
      min-width: 0;
      border-top: 1px solid var(--color-beige-700);
    }
  }

  &-link {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    min-height: 108px;
    padding: var(--space-md) 0;

    &:focus-visible {
      outline: 2px solid var(--color-text-400);
      outline-offset: 4px;
    }

    @include mixins.hover {
      &:hover .project-collection-name {
        text-decoration: underline;
        text-underline-offset: 4px;
      }
    }
  }

  &-image {
    flex: 0 0 72px;
    width: 72px;
    height: 48px;
    object-fit: cover;
    object-position: top;
    border-radius: var(--radius-sm);

    @include mixins.mq("xl") {
      flex-basis: 96px;
      width: 96px;
      height: 64px;
    }
  }

  &-copy {
    flex: 1;
    gap: var(--space-xxs);
  }

  &-name {
    font-size: var(--font-size-lg);
    font-weight: 700;
    line-height: 1.5;
  }

  &-badge {
    align-self: flex-start;
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    background: var(--color-beige-500);
    font-size: var(--font-size-xxs);
    vertical-align: middle;
    white-space: nowrap;
  }

  &-link-icon {
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    margin-top: 5px;
  }

  @media (prefers-reduced-motion: reduce) {
    &-toggle-icon {
      transition: none;
    }
  }
}
</style>
