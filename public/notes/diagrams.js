const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.2;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setupDiagramControls(figure) {
  const viewport = figure.querySelector(".sequence-diagram-viewport");
  const stage = figure.querySelector(".sequence-diagram-stage");
  const diagram = figure.querySelector(".mermaid");
  const svg = diagram?.querySelector("svg");
  const zoomOut = figure.querySelector("[data-diagram-zoom-out]");
  const zoomIn = figure.querySelector("[data-diagram-zoom-in]");
  const reset = figure.querySelector("[data-diagram-reset]");
  const output = figure.querySelector("[data-diagram-zoom-output]");

  if (!viewport || !stage || !diagram || !svg || !zoomOut || !zoomIn || !reset || !output) {
    figure.classList.add("is-error");
    return;
  }

  const baseWidth = diagram.getBoundingClientRect().width;
  const baseHeight = diagram.getBoundingClientRect().height;
  let scale = 1;

  const renderScale = (nextScale, center) => {
    const oldScale = scale;
    const focus = center || {
      x: viewport.scrollLeft + viewport.clientWidth / 2,
      y: viewport.scrollTop + viewport.clientHeight / 2,
    };
    const contentX = focus.x / oldScale;
    const contentY = focus.y / oldScale;

    scale = clamp(Math.round(nextScale * 10) / 10, MIN_SCALE, MAX_SCALE);
    diagram.style.transform = `scale(${scale})`;
    stage.style.width = `${baseWidth * scale}px`;
    stage.style.height = `${baseHeight * scale}px`;
    output.value = `${Math.round(scale * 100)}%`;
    output.textContent = output.value;
    zoomOut.disabled = scale <= MIN_SCALE;
    zoomIn.disabled = scale >= MAX_SCALE;

    viewport.scrollLeft = contentX * scale - (focus.x - viewport.scrollLeft);
    viewport.scrollTop = contentY * scale - (focus.y - viewport.scrollTop);
  };

  zoomOut.addEventListener("click", () => renderScale(scale - SCALE_STEP));
  zoomIn.addEventListener("click", () => renderScale(scale + SCALE_STEP));
  reset.addEventListener("click", () => {
    renderScale(1, { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
    viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const bounds = viewport.getBoundingClientRect();
      renderScale(scale + (event.deltaY < 0 ? 0.1 : -0.1), {
        x: viewport.scrollLeft + event.clientX - bounds.left,
        y: viewport.scrollTop + event.clientY - bounds.top,
      });
    },
    { passive: false },
  );

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") renderScale(scale + SCALE_STEP);
    if (event.key === "-") renderScale(scale - SCALE_STEP);
    if (event.key === "0") {
      renderScale(1);
      viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  });

  let dragStart = null;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    viewport.scrollLeft = dragStart.left - (event.clientX - dragStart.x);
    viewport.scrollTop = dragStart.top - (event.clientY - dragStart.y);
  });

  const stopDragging = (event) => {
    if (!dragStart) return;
    dragStart = null;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  renderScale(1, { x: 0, y: 0 });
}

async function initMermaidDiagrams() {
  const diagrams = [...document.querySelectorAll(".mermaid")];
  if (!diagrams.length) return;

  try {
    const { default: mermaid } = await import(
      "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
    );

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: 'Urbanist, "Noto Sans SC", sans-serif',
      themeCSS: `
        .nodeLabel,
        .edgeLabel,
        .label,
        .cluster-label,
        .messageText,
        .actor,
        .noteText,
        foreignObject div,
        text,
        tspan {
          color: #f6efe7 !important;
          fill: #f6efe7 !important;
          opacity: 1 !important;
        }
        .edgeLabel,
        .edgeLabel p {
          background-color: #1b1713 !important;
        }
      `,
      themeVariables: {
        background: "#1b1713",
        textColor: "#f6efe7",
        primaryColor: "#2f2721",
        primaryTextColor: "#f6efe7",
        primaryBorderColor: "#ff9838",
        lineColor: "#c4b6a7",
        secondaryColor: "#3a2e25",
        secondaryTextColor: "#f6efe7",
        tertiaryColor: "#221d18",
        tertiaryTextColor: "#f6efe7",
        actorBkg: "#2a231d",
        actorBorder: "#ff9838",
        actorTextColor: "#f6efe7",
        actorLineColor: "#786858",
        signalColor: "#d7c6b5",
        signalTextColor: "#f6efe7",
        labelBoxBkgColor: "#2a231d",
        labelBoxBorderColor: "#ff9838",
        labelTextColor: "#f6efe7",
        noteBkgColor: "#3a2e25",
        noteBorderColor: "#ff9838",
        noteTextColor: "#f6efe7",
        activationBkgColor: "#ff9838",
        activationBorderColor: "#ffb56e",
      },
      sequence: {
        useMaxWidth: false,
        mirrorActors: false,
        wrap: true,
        actorMargin: 28,
        messageMargin: 34,
        diagramMarginX: 24,
        diagramMarginY: 18,
      },
    });

    await mermaid.run({ nodes: diagrams, suppressErrors: true });
    document.querySelectorAll("[data-sequence-diagram]").forEach(setupDiagramControls);
  } catch (error) {
    console.error("Mermaid diagram rendering failed", error);
    document.querySelectorAll("[data-sequence-diagram]").forEach((figure) => {
      figure.classList.add("is-error");
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMermaidDiagrams, { once: true });
} else {
  initMermaidDiagrams();
}
