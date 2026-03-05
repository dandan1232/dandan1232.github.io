const htmlEl = document.documentElement;
const toggleBtn = document.getElementById("theme-toggle-btn");

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

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const newTheme = htmlEl.dataset.theme === "dark" ? "pink" : "dark";
    applyTheme(newTheme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
});
