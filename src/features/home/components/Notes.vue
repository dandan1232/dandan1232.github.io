<script setup lang="ts">
import Banner from "../../../components/Banner.vue";
import NotchSection from "../../../components/NotchSection.vue";
import { t } from "../../../i18n/utils/translate";
import { locale } from "../../../i18n/store";

const notes = [
  {
    title: "Docker Desktop 数据迁移笔记",
    href: "/notes/docker-desktop-data-migration.html",
    meta: "Docker / WSL2",
  },
  {
    title: "RAG 从 0 到 1 落地笔记",
    href: "/notes/rag-from-0-to-1-practice.html",
    meta: "RAG / GraphRAG",
  },
  {
    title: "数字人重复播放问题复盘",
    href: "/notes/digital-human-repeat-playback.html",
    meta: "音视频 / 幂等",
  },
  {
    title: "AI 接入微信公众号",
    href: "/notes/ai-wechat-official-account-integration.html",
    meta: "WeChat / AI",
  },
] as const;
</script>

<template>
  <section class="notes-section">
    <NotchSection class="notes-section-notch" />
    <div class="grid">
      <div class="notes-heading">
        <Banner class="notes-heading-banner" :copy="locale === 'zh' ? '沉淀' : 'Filed'" size="sm" animated />
        <h2 class="notes-title">{{ t("notes") }}</h2>
        <p class="notes-copy">
          {{
            locale === "zh"
              ? "把项目复盘、架构取舍和 AI 工程实践集中整理出来，方便自己回看，也方便后来者少踩坑。"
              : "Project reviews, architecture notes, and AI engineering practices collected for reuse and future reference."
          }}
        </p>
      </div>

      <div class="notes-panel">
        <a class="notes-card notes-card-featured" href="/notes/index.html">
          <span class="notes-card-meta">{{ locale === "zh" ? "专栏入口" : "Index" }}</span>
          <span class="notes-card-title">{{ locale === "zh" ? "进入博客 / 笔记专栏" : "Open Notes" }}</span>
          <span class="notes-card-desc">
            {{
              locale === "zh"
                ? "查看全部 AI、RAG、FastGPT、Docker、MediaPipe 与工程复盘笔记。"
                : "Browse AI, RAG, FastGPT, Docker, MediaPipe, and engineering review notes."
            }}
          </span>
        </a>

        <a v-for="note in notes" :key="note.href" class="notes-card" :href="note.href">
          <span class="notes-card-meta">{{ note.meta }}</span>
          <span class="notes-card-title">{{ note.title }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.notes-section {
  position: relative;
  width: 100%;
  padding: 96px var(--space-outer);
  background: var(--color-beige-600);
  color: var(--color-text-400);

  @include mixins.mq("md") {
    padding-top: 132px;
    padding-bottom: 132px;
  }

  &-notch {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    color: var(--color-beige-600);
    --icon-color: var(--color-beige-600);
  }
}

.notes-heading {
  grid-column: 1 / 13;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-md);

  @include mixins.mq("lg") {
    grid-column: 2 / 6;
  }

  &-banner {
    position: absolute;
    top: 0;
    left: -8px;
    transform: translate(0, -20%) rotate(-4deg);
  }
}

.notes-title {
  font-weight: 900;
  letter-spacing: 0.02em;
  font-size: var(--font-size-title-md);

  @include mixins.mq("sm") {
    font-size: var(--font-size-title-lg);
  }
}

.notes-copy {
  line-height: var(--line-height-copy);
  color: var(--color-text-300);
}

.notes-panel {
  grid-column: 1 / 13;
  display: grid;
  gap: var(--space-sm);

  @include mixins.mq("md") {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include mixins.mq("lg") {
    grid-column: 7 / 12;
  }
}

.notes-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-height: 116px;
  border: var(--stroke-md) solid var(--color-beige-500);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  color: inherit;
  text-decoration: none;
  background: color-mix(in srgb, var(--color-beige-500) 34%, transparent);
  transition:
    transform 0.25s var(--ease-smooth),
    border-color 0.25s ease,
    background-color 0.25s ease;

  @include mixins.hover {
    &:hover {
      transform: translateY(-4px);
      border-color: var(--color-orange-400);
      background: color-mix(in srgb, var(--color-orange-400) 16%, var(--color-beige-500));
    }
  }

  &-featured {
    @include mixins.mq("md") {
      grid-row: span 2;
    }
  }

  &-meta {
    font-family: "ProFontWindows";
    font-size: var(--font-size-sm);
    color: var(--color-orange-400);
  }

  &-title {
    font-size: var(--font-size-lg);
    font-weight: 900;
    line-height: var(--line-height-md);
  }

  &-desc {
    color: var(--color-text-300);
    line-height: var(--line-height-copy);
  }
}
</style>
