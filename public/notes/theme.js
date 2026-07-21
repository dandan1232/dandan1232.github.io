const htmlEl = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle-btn");
const GROUPS_KEY = "notesSidebarGroups";

const NOTES_GROUPS = [
  {
    id: "nav",
    label: "快速导航",
    items: [{ title: "笔记专栏首页", href: "./index.html" }]
  },
  {
    id: "ai",
    label: "AI 应用",
    items: [
      { title: "大模型应用开发基础", href: "./llm-app-dev-fundamentals.html" },
      { title: "RAG 从 0 到 1 落地笔记", href: "./rag-from-0-to-1-practice.html" },
      { title: "FastGPT 工作流标识全链路透传", href: "./fastgpt-workflow-identifiers.html" },
      { title: "FastGPT 跨知识库迁移补丁", href: "./fastgpt-cross-knowledgebase-migration-patch.html" },
      { title: "FastGPT 知识库结构讲解", href: "./fastgpt-knowledge-base-structure.html" },
      { title: "AI 接入微信公众号", href: "./ai-wechat-official-account-integration.html" },
      { title: "AI 后端 LLM 工程师技能雷达图", href: "./ai-backend-llm-engineer-skills.html" }
    ]
  },
  {
    id: "rec",
    label: "推荐系统",
    items: [
      { title: "Torch-RecHub 轻量推荐系统", href: "./torch-rechub-recommendation.html" }
    ]
  },
  {
    id: "training",
    label: "训练 & 系统",
    items: [
      { title: "从 0 到 1 构建 RLHF 系统", href: "./rlhf-system-from-scratch.html" }
    ]
  },
  {
    id: "devops",
    label: "工程运维",
    items: [
      { title: "Docker Desktop 数据迁移", href: "./docker-desktop-data-migration.html" }
    ]
  },
  {
    id: "multimodal",
    label: "多模态",
    items: [
      { title: "数字人重复播放问题复盘", href: "./digital-human-repeat-playback.html" },
      { title: "MediaPipe 摸索笔记", href: "./mediapipe-exploration-notes.html" }
    ]
  },
  {
    id: "ip",
    label: "IP / 软著",
    items: [{ title: "软件著作权与专利清单", href: "./software-copyrights.html" }]
  },
  {
    id: "agent",
    label: "Agent",
    items: [
      { title: "Easy-Lagent LangChain & LangGraph", href: "./easy-lagent-langchain-langgraph.html" },
      { title: "agent-skills-with-anthropic", href: "./agent-skills-with-anthropic.html" }
    ]
  }
];

const MIGRATION_SCENES = {
  dark: "NIGHT",
  pink: "WARM"
};

let migrationFrame = null;
let migrationHost = null;
let migrationPointerFrame = 0;
let latestPointer = null;
let migrationTransitionTimer = 0;

function postToMigration(message) {
  migrationFrame?.contentWindow?.postMessage(message, window.location.origin);
}

function syncMigrationScene(theme, animate = true) {
  if (!migrationFrame) return;
  const scene = MIGRATION_SCENES[theme] || MIGRATION_SCENES.dark;
  if (migrationFrame.dataset.scene === scene) return;
  migrationFrame.dataset.scene = scene;

  if (animate && migrationHost) {
    migrationHost.classList.add("is-switching");
    window.clearTimeout(migrationTransitionTimer);
    migrationTransitionTimer = window.setTimeout(() => {
      migrationHost?.classList.remove("is-switching");
    }, 520);
  }

  postToMigration({ type: "migration:scene", scene });
}

function queueMigrationPointer(event) {
  if (event.pointerType === "touch") return;
  latestPointer = { type: "migration:pointer", x: event.clientX, y: event.clientY, active: true };
  if (migrationPointerFrame) return;

  migrationPointerFrame = window.requestAnimationFrame(() => {
    postToMigration(latestPointer);
    migrationPointerFrame = 0;
  });
}

function initMigrationBackground(theme) {
  migrationHost = document.getElementById("particles-js");
  if (!migrationHost) {
    migrationHost = document.createElement("div");
    migrationHost.id = "particles-js";
    document.body.prepend(migrationHost);
  }

  migrationHost.setAttribute("aria-hidden", "true");
  migrationFrame = document.createElement("iframe");
  migrationFrame.className = "migration-background-frame";
  migrationFrame.dataset.scene = MIGRATION_SCENES[theme] || MIGRATION_SCENES.dark;
  migrationFrame.src = `./migration/background.html?scene=${migrationFrame.dataset.scene}`;
  migrationFrame.tabIndex = -1;
  migrationFrame.setAttribute("aria-hidden", "true");
  migrationFrame.setAttribute("title", "");
  migrationFrame.addEventListener("load", () => syncMigrationScene(theme, false));
  migrationHost.replaceChildren(migrationFrame);

  window.addEventListener("pointermove", queueMigrationPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    latestPointer = { type: "migration:pointer", active: false };
    postToMigration(latestPointer);
  });
}

function applyTheme(theme) {
  htmlEl.dataset.theme = theme;
  if (toggleBtn) {
    const isDark = theme === "dark";
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    toggleBtn.title = isDark ? "切换到暖色主题" : "切换到深色主题";
    toggleBtn.setAttribute("aria-label", toggleBtn.title);
    toggleBtn.setAttribute("aria-pressed", String(!isDark));
  }
  syncMigrationScene(theme);
  localStorage.setItem("theme", theme);
}

function currentFileName() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.endsWith("/")) return "index.html";
  const segments = path.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : "index.html";
}

function loadGroupState() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGroupState(state) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(state));
}

function initDetailSidebar() {
  const file = currentFileName();
  if (file === "index.html") {
    return;
  }

  document.body.classList.add("notes-detail");

  const groupState = loadGroupState();
  const sidebar = document.createElement("aside");
  sidebar.className = "notes-sidebar";

  const inner = document.createElement("div");
  inner.className = "notes-sidebar-inner";
  sidebar.appendChild(inner);

  const head = document.createElement("div");
  head.className = "notes-sidebar-head";
  inner.appendChild(head);

  const title = document.createElement("div");
  title.className = "notes-sidebar-title";
  title.textContent = "Notes Menu";
  head.appendChild(title);

  const collapseBtn = document.createElement("button");
  collapseBtn.className = "notes-sidebar-collapse";
  collapseBtn.type = "button";
  collapseBtn.title = "关闭菜单";
  collapseBtn.textContent = "×";
  head.appendChild(collapseBtn);

  const groupsContainer = document.createElement("div");
  groupsContainer.className = "notes-groups";
  inner.appendChild(groupsContainer);

  NOTES_GROUPS.forEach((group) => {
    const section = document.createElement("section");
    section.className = "notes-group";
    section.dataset.groupId = group.id;

    if (groupState[group.id] === true) {
      section.classList.add("is-collapsed");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "notes-group-btn";
    button.innerHTML = `<span class="label">${group.label}</span><span class="arrow">▾</span>`;
    section.appendChild(button);

    const list = document.createElement("ul");
    list.className = "notes-links";
    group.items.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "notes-link";
      a.href = item.href;
      a.textContent = item.title;
      if (item.href.endsWith(`/${file}`) || item.href.endsWith(file)) {
        a.classList.add("active");
      }
      a.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
      });
      li.appendChild(a);
      list.appendChild(li);
    });
    section.appendChild(list);

    button.addEventListener("click", () => {
      section.classList.toggle("is-collapsed");
      groupState[group.id] = section.classList.contains("is-collapsed");
      saveGroupState(groupState);
    });

    groupsContainer.appendChild(section);
  });

  const overlay = document.createElement("div");
  overlay.className = "notes-sidebar-overlay";
  overlay.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  const mobileToggle = document.createElement("button");
  mobileToggle.className = "notes-mobile-toggle";
  mobileToggle.type = "button";
  mobileToggle.title = "打开笔记菜单";
  mobileToggle.innerHTML = "<span>☰</span><span>目录</span>";
  mobileToggle.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  collapseBtn.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  document.body.appendChild(sidebar);
  document.body.appendChild(overlay);
  document.body.appendChild(mobileToggle);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      document.body.classList.remove("sidebar-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.body.classList.remove("sidebar-open");
    }
  });
}

function initImageLightbox() {
  const images = document.querySelectorAll(".article-media img");
  if (!images.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "图片大图预览");
  lightbox.setAttribute("aria-hidden", "true");

  const preview = document.createElement("img");
  preview.className = "image-lightbox-preview";
  preview.title = "点击缩小";

  const caption = document.createElement("p");
  caption.className = "image-lightbox-caption";

  const closeButton = document.createElement("button");
  closeButton.className = "image-lightbox-close";
  closeButton.type = "button";
  closeButton.title = "缩小图片";
  closeButton.setAttribute("aria-label", "关闭大图预览");
  closeButton.textContent = "×";

  lightbox.appendChild(preview);
  lightbox.appendChild(caption);
  lightbox.appendChild(closeButton);
  document.body.appendChild(lightbox);

  let trigger = null;

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("image-lightbox-open");
    trigger?.focus();
  };

  const openLightbox = (image) => {
    trigger = image.closest("a") || image;
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt || "文章大图";
    caption.textContent = image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("image-lightbox-open");
    closeButton.focus();
  };

  images.forEach((image) => {
    const link = image.closest("a");
    image.title = "点击放大";
    (link || image).addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(image);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  preview.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const newTheme = htmlEl.dataset.theme === "dark" ? "pink" : "dark";
    applyTheme(newTheme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  initMigrationBackground(savedTheme);
  initDetailSidebar();
  initImageLightbox();
  applyTheme(savedTheme);
});
