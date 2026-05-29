<script setup lang="ts">
import Social from "./Social.vue";
import Link from "./Link.vue";
import Clickable from "./Clickable.vue";
import LangSwitch from "./LangSwitch.vue";
import NotchSection from "./NotchSection.vue";
import { t } from "../i18n/utils/translate";
import { locale } from "../i18n/store";
import ButtonRound from "./ButtonRound.vue";
import { lenis } from "../composables/useScroll";
import ArrowRightLong from "./icons/ArrowRightLong.vue";

interface Props {
  withSocial?: boolean;
}

const handleBackToTop = () => {
  if (!lenis.value) return;
  lenis.value.scrollTo(0);
};

const { withSocial = true } = defineProps<Props>();
const showAttribution = import.meta.env.VITE_SHOW_ATTRIBUTION !== "false";
</script>

<template>
  <footer class="footer">
    <NotchSection class="footer-notch" />
    <div class="footer-content">
      <div
        class="footer-back-to-top"
        tabindex="0"
        @click="handleBackToTop"
        @keydown.enter="handleBackToTop"
        data-cursor="circle-white"
        data-sound="click"
      >
        <ButtonRound renderAs="div" variant="border" class="children-unclickable" data-hoversound="hover">
          <ArrowRightLong class="footer-back-to-top-icon" />
        </ButtonRound>
      </div>
      <div class="footer-top">
        <Social v-if="withSocial" />
        <div class="footer-top-links">
          <div class="footer-top-links-legal">
            <Clickable renderAs="div">
              <Link
                :href="locale === 'zh' ? '/zh/privacy' : '/privacy'"
                class="footer-link"
                :external="true"
                data-cursor="circle-white"
                data-sound="click"
                data-hoversound="hover"
                >{{ t("privacy") }}</Link
              >
            </Clickable>
            <Clickable renderAs="div">
              <Link
                :href="locale === 'zh' ? '/zh/legal' : '/legal'"
                class="footer-link children-unclickable"
                :external="true"
                data-cursor="circle-white"
                data-sound="click"
                data-hoversound="hover"
                >{{ t("legal") }}</Link
              >
            </Clickable>
          </div>
          <LangSwitch />
        </div>
      </div>
      <div class="footer-credits">
        <div v-if="showAttribution" class="footer-credits-built">
          <p>
            {{ t("original-concept-by") }}
          </p>
          <Clickable renderAs="div">
            <Link
              href="https://github.com/davidhckh/portfolio-2025"
              class="footer-link children-unclickable"
              external
              data-cursor="circle-white"
              data-hoversound="hover"
              >portfolio-2025</Link
            >
          </Clickable>
        </div>
        <div class="footer-credits-music">
          <p>
            {{ t("music-produced-by") }}
          </p>
          <Clickable renderAs="div">
            <Link
              href="https://soundcloud.com/hmsurf"
              class="footer-link children-unclickable"
              external
              data-cursor="circle-white"
              data-hoversound="hover"
              >HM Surf</Link
            >
          </Clickable>
        </div>
        <p>© {{ new Date().getFullYear() }} Echo Lin · 念安</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: var(--color-background-300, var(--color-beige-400));
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    width: 100%;
    max-width: calc(var(--breakpoint-xxxl));
    padding: calc(var(--space-outer) + var(--space-sm)) var(--space-outer);
    position: relative;
  }

  &-back-to-top {
    cursor: pointer;

    @include mixins.mq("md") {
      position: absolute;
      top: calc(var(--space-outer) + var(--space-sm));
      left: 50%;
      transform: translateX(-50%);
    }

    &-icon {
      transform: rotate(-90deg);
    }
  }

  &-top {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-xl);

    @include mixins.mq("md") {
      gap: var(--space-md);
      flex-direction: row;
    }

    &-links {
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      gap: var(--space-md);

      &-legal {
        display: flex;
        flex-direction: row;
        gap: var(--space-md);
      }

      @include mixins.mq("md") {
        gap: var(--space-lg);
        flex-direction: row;
        position: relative;
        margin-left: auto;
      }
    }
  }

  &-link {
    font-weight: 700;
  }

  &-credits {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    font-size: var(--font-size-sm);
    text-align: center;

    &-built,
    &-music {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--space-xxs);
    }
  }

  &-notch {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    color: var(--color-background-300, var(--color-beige-400));
    --icon-color: var(--color-background-300, var(--color-beige-400));
  }
}
</style>
