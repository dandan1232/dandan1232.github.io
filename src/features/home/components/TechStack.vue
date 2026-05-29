<script setup lang="ts">
import Banner from "../../../components/Banner.vue";
import NotchSection from "../../../components/NotchSection.vue";
import { locale } from "../../../i18n/store";
import { t } from "../../../i18n/utils/translate";

const stackGroupsZh = [
  {
    title: "语言",
    items: ["Python", "JavaScript/TypeScript", "Java"],
  },
  {
    title: "前端 & 框架",
    items: ["Vue.js", "React", "Node.js", "微信小程序"],
  },
  {
    title: "后端 & 平台",
    items: ["FastAPI", "Spring Boot", "RESTful API"],
  },
  {
    title: "数据库",
    items: ["PostgreSQL", "Neo4j", "MySQL", "OceanBase", "向量数据库"],
  },
  {
    title: "AI & 工具",
    items: ["RAG / LangChain", "FastGPT", "NLP (SpaCy, etc.)", "OpenAI / GLM API"],
  },
  {
    title: "DevOps & 其他",
    items: ["Docker / Docker Compose", "Git / GitHub Actions", "Linux / WSL", "MinIO"],
  },
] as const;

const stackGroupsEn = [
  {
    title: "Languages",
    items: ["Python", "JavaScript/TypeScript", "Java"],
  },
  {
    title: "Frontend & Frameworks",
    items: ["Vue.js", "React", "Node.js", "WeChat Mini Program"],
  },
  {
    title: "Backend & Platforms",
    items: ["FastAPI", "Spring Boot", "RESTful API"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "Neo4j", "MySQL", "OceanBase", "Vector Databases"],
  },
  {
    title: "AI & Tools",
    items: ["RAG / LangChain", "FastGPT", "NLP (SpaCy, etc.)", "OpenAI / GLM API"],
  },
  {
    title: "DevOps & Other",
    items: ["Docker / Docker Compose", "Git / GitHub Actions", "Linux / WSL", "MinIO"],
  },
] as const;
</script>

<template>
  <section class="tech-stack-section">
    <NotchSection class="tech-stack-section-notch" />
    <div class="grid">
      <div class="tech-stack-heading">
        <Banner class="tech-stack-heading-banner" :copy="locale === 'zh' ? '常用' : 'Core'" size="sm" animated />
        <h2 class="tech-stack-title">{{ t("stack") }}</h2>
        <p class="tech-stack-copy">
          {{
            locale === "zh"
              ? "从前端交互到后端服务、数据库、RAG 和部署链路，按实际项目里常用的组合整理。"
              : "A practical stack across frontend interaction, backend services, databases, RAG, and deployment workflows."
          }}
        </p>
      </div>

      <div class="tech-stack-grid">
        <section
          v-for="group in locale === 'zh' ? stackGroupsZh : stackGroupsEn"
          :key="group.title"
          class="tech-stack-group"
        >
          <h3 class="tech-stack-group-title">{{ group.title }}</h3>
          <ul class="tech-stack-list">
            <li v-for="item in group.items" :key="item" class="tech-stack-item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tech-stack-section {
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

.tech-stack-heading {
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

.tech-stack-title {
  font-weight: 900;
  letter-spacing: 0.02em;
  font-size: var(--font-size-title-md);

  @include mixins.mq("sm") {
    font-size: var(--font-size-title-lg);
  }
}

.tech-stack-copy {
  line-height: var(--line-height-copy);
  color: var(--color-text-300);
}

.tech-stack-grid {
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

.tech-stack-group {
  border: var(--stroke-md) solid var(--color-beige-500);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  background: color-mix(in srgb, var(--color-beige-500) 34%, transparent);
}

.tech-stack-group-title {
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-md);
  font-weight: 900;
}

.tech-stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  list-style: none;
  padding: 0;
}

.tech-stack-item {
  border: var(--stroke-sm) solid var(--color-beige-500);
  border-radius: 100px;
  padding: var(--space-xxs) var(--space-sm);
  background: var(--color-beige-400);
  color: var(--color-text-400);
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: var(--line-height-md);
  white-space: nowrap;
}
</style>
