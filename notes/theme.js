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
      { title: "RAG 从 0 到 1 落地笔记", href: "./rag-from-0-to-1-practice.html" },
      { title: "FastGPT 跨知识库迁移补丁", href: "./fastgpt-cross-knowledgebase-migration-patch.html" },
      { title: "AI 接入微信公众号", href: "./ai-wechat-official-account-integration.html" }
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
    id: "agent",
    label: "Agent",
    items: [{ title: "agent-skills-with-anthropic", href: "./agent-skills-with-anthropic.html" }]
  }
];

const darkThemeConfig = {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 900 } },
    color: { value: "#38bdf8" },
    shape: { type: "circle" },
    opacity: { value: 0.6, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false } },
    size: { value: 3, random: true },
    line_linked: { enable: true, distance: 140, color: "#38bdf8", opacity: 0.35, width: 1 },
    move: { enable: true, speed: 1.4, direction: "none", random: true, out_mode: "out" }
  },
  interactivity: {
    detect_on: "window",
    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
    modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
};

const pinkThemeConfig = {
  particles: {
    number: { value: 40, density: { enable: true, value_area: 800 } },
    color: { value: "#f472b6" },
    shape: { type: "circle" },
    opacity: { value: 0.7, random: true, anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false } },
    size: { value: 5, random: true, anim: { enable: true, speed: 2, size_min: 1, sync: false } },
    line_linked: { enable: false },
    move: { enable: true, speed: 1, direction: "top", random: true, straight: false, out_mode: "out", bounce: false }
  },
  interactivity: {
    detect_on: "window",
    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
    modes: { repulse: { distance: 120, duration: 0.4 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
};

function applyTheme(theme) {
  if (window.pJSDom && window.pJSDom[0]) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
  htmlEl.dataset.theme = theme;
  const config = theme === "pink" ? pinkThemeConfig : darkThemeConfig;
  if (typeof particlesJS === "function") {
    particlesJS("particles-js", config);
  }
  localStorage.setItem("theme", theme);
}

function currentFileName() {
  const path = window.location.pathname.replace(/\\/g, "/");
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

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const newTheme = htmlEl.dataset.theme === "dark" ? "pink" : "dark";
    applyTheme(newTheme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDetailSidebar();
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
});
