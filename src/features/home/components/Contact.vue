<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { transitions } from "../../../animations";
import { t } from "../../../i18n/utils/translate";
import { locale } from "../../../i18n/store";
import Social from "../../../components/Social.vue";

const contactElement = ref<HTMLElement | null>(null);

onMounted(() => {
  if (contactElement.value) {
    transitions.contact.setup(contactElement.value);
  }
});

onUnmounted(() => {
  transitions.contact.destroy();
});
</script>

<template>
  <div class="contact grid" ref="contactElement">
    <div class="contact-content">
      <h2 class="contact-title" v-html="t('lets-work-together')"></h2>
      <div class="contact-card">
        <dl class="contact-list">
          <div class="contact-row">
            <dt>WeChat</dt>
            <dd>waitu1232 <span>{{ locale === "zh" ? "推荐" : "Recommend" }}</span></dd>
          </div>
          <div class="contact-row">
            <dt>Email</dt>
            <dd><a href="mailto:danbao1108@foxmail.com">danbao1108@foxmail.com</a></dd>
          </div>
          <div class="contact-row">
            <dt>GitHub</dt>
            <dd><a href="https://github.com/dandan1232" target="_blank" rel="noopener noreferrer">github.com/dandan1232</a></dd>
          </div>
        </dl>
        <div class="contact-social-links" :aria-label="locale === 'zh' ? '社交链接' : 'Social links'">
          <a href="https://github.com/dandan1232" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://blog.csdn.net/weixin_45092728?spm=1000.2115.3001.10640" target="_blank" rel="noopener noreferrer">CSDN</a>
          <a href="/notes/software-copyrights.html">{{ locale === "zh" ? "软著" : "Copyrights" }}</a>
        </div>
      </div>
      <Social variant="background" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.contact {
  width: 100%;
  max-width: calc(var(--svw) * 100);
  overflow: hidden;
  min-height: calc(var(--lvh) * 100);
  padding: var(--space-outer);
  padding-top: var(--space-lg);

  @include mixins.mq("md") {
    padding-top: var(--space-xxl);
  }

  &-content {
    position: relative;
    padding-top: var(--space-md);
    grid-column: 1 / 13;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);

    @include mixins.mq("sm") {
      grid-column: 1 / 8;
    }

    @include mixins.mq("md") {
      gap: var(--space-xl);
      grid-column: 1 / 6;
      padding-top: var(--space-lg);
    }

    @include mixins.mq("lg") {
      grid-column: 2 / 6;
    }
  }

  &-title {
    font-weight: 900;
    letter-spacing: 0.02em;
    font-size: var(--font-size-title-md);

    @include mixins.mq("sm") {
      font-size: var(--font-size-title-lg);
    }

    @include mixins.mq("xl") {
      font-size: var(--font-size-title-xl);
    }
  }

  &-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    border: var(--stroke-md) solid var(--color-beige-500);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    background: color-mix(in srgb, var(--color-beige-500) 28%, transparent);
  }

  &-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin: 0;
  }

  &-row {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    gap: var(--space-sm);
    align-items: baseline;

    dt {
      color: var(--color-text-300);
      font-size: var(--font-size-sm);
      font-weight: 900;
      text-transform: uppercase;
    }

    dd {
      margin: 0;
      font-weight: 700;
      line-height: var(--line-height-md);
      overflow-wrap: anywhere;

      span {
        color: var(--color-orange-400);
        font-size: var(--font-size-sm);
      }
    }

    a {
      color: inherit;
      text-decoration: none;

      @include mixins.hover {
        &:hover {
          color: var(--color-orange-400);
        }
      }
    }
  }

  &-social-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);

    a {
      border: var(--stroke-sm) solid var(--color-beige-500);
      border-radius: 100px;
      padding: var(--space-xxs) var(--space-sm);
      color: inherit;
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: 900;
      background: var(--color-beige-400);

      @include mixins.hover {
        &:hover {
          border-color: var(--color-orange-400);
          color: var(--color-orange-400);
        }
      }
    }
  }
}
</style>
