<script setup lang="ts">
import Github from "./icons/Github.vue";
import Csdn from "./icons/Csdn.vue";
import Wechat from "./icons/Wechat.vue";
import Linkedin from "./icons/Linkedin.vue";
import Instagram from "./icons/Instagram.vue";
import Mail from "./icons/Mail.vue";
import X from "./icons/X.vue";
import Link from "./Link.vue";
import { t } from "../i18n/utils/translate";
import ButtonRound from "./ButtonRound.vue";
import { ref } from "vue";

import { social } from "../content/social";

const props = defineProps<{
  variant?: "theme" | "background";
}>();

// map icon names to components
const icons = {
  wechat: Wechat,
  mail: Mail,
  github: Github,
  csdn: Csdn,
  linkedin: Linkedin,
  x: X,
  instagram: Instagram,
} as const;

const getAriaLabel = (name: string) => `${t("go-to")} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
const wechatOpen = ref(false);
const wechatQrAvailable = ref(true);

const getSocialUrl = (item: (typeof social)[number]) => ("url" in item ? item.url : "#");
const getWechatQr = (item: (typeof social)[number]) => ("qr" in item ? item.qr : "");
const getWechatAccount = (item: (typeof social)[number]) => ("account" in item ? item.account : "waitu1232");
</script>

<template>
  <div class="social">
    <div v-for="item in social" :key="item.name" class="social-item">
      <button
        v-if="item.name === 'wechat'"
        type="button"
        class="social-link social-wechat-button"
        :aria-label="t('show-wechat-qr')"
        :aria-expanded="wechatOpen"
        data-cursor="circle-white"
        @click.stop="wechatOpen = !wechatOpen"
        @keydown.esc="wechatOpen = false"
      >
        <ButtonRound
          renderAs="div"
          :variant="props.variant ?? 'theme'"
          class="children-unclickable"
          data-hoversound="hover"
        >
          <component :is="icons[item.name]" :aria-label="t('show-wechat-qr')" />
        </ButtonRound>
      </button>

      <div v-if="item.name === 'wechat'" :class="['social-qr', wechatOpen && 'social-qr-visible']">
        <img
          v-if="wechatQrAvailable"
          :src="getWechatQr(item)"
          :alt="`WeChat ${getWechatAccount(item)} QR code`"
          class="social-qr-image"
          @error="wechatQrAvailable = false"
        />
        <div v-else class="social-qr-placeholder">{{ getWechatAccount(item) }}</div>
        <p class="social-qr-caption">WeChat: {{ getWechatAccount(item) }}</p>
      </div>

      <Link
        v-else
        external
        :href="getSocialUrl(item)"
        :aria-label="getAriaLabel(item.name)"
        class="social-link"
        data-cursor="circle-white"
      >
        <ButtonRound
          renderAs="div"
          :variant="props.variant ?? 'theme'"
          class="children-unclickable"
          data-hoversound="hover"
        >
          <component :is="icons[item.name]" :aria-label="getAriaLabel(item.name)" external />
        </ButtonRound>
      </Link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.social {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  overflow: visible;
}

.social-item {
  position: relative;
  display: inline-flex;
}

.social-link {
  display: inline-flex;
  text-decoration: none;
}

.social-wechat-button {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.social-qr {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 20;
  width: 156px;
  padding: 10px;
  border: 1px solid rgba(95, 86, 70, 0.18);
  border-radius: 12px;
  background: var(--color-background-400);
  box-shadow: 0 18px 44px rgba(45, 42, 36, 0.18);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -4px);
  transition:
    opacity 0.16s ease-out,
    transform 0.16s ease-out;

  &::before {
    content: "";
    position: absolute;
    top: -7px;
    left: 50%;
    width: 14px;
    height: 14px;
    background: var(--color-background-400);
    border-left: 1px solid rgba(95, 86, 70, 0.18);
    border-top: 1px solid rgba(95, 86, 70, 0.18);
    transform: translateX(-50%) rotate(45deg);
  }

  &-visible {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, 0);
  }

  &-image,
  &-placeholder {
    position: relative;
    z-index: 1;
    display: grid;
    width: 136px;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 8px;
    background: var(--color-beige-400);
    color: var(--color-text-400);
    font-size: var(--font-size-md);
    font-weight: 800;
  }

  &-image {
    object-fit: cover;
  }

  &-caption {
    position: relative;
    z-index: 1;
    margin-top: 8px;
    color: var(--color-text-300);
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
  }
}
</style>
