import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";
import thumbnailFastGPT from "../../../assets/thumbnails/fastgpt-workflow.png";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "FastGPT Workflow Tracing",
    slug: "fastgpt-workflow",
    thumbnail: thumbnailFastGPT,
    description: "End-to-end identifiers from workflow context to log storage",
  },
  {
    title: "Enterprise Knowledge Base · GraphRAG",
    slug: "enterprise-knowledge-base",
    thumbnail: thumbnailStreakon,
    description: "Multi-layer retrieval for business Q&A",
  },
  {
    title: "ChatGPT on WeChat · Media Extension",
    slug: "wechat-media-ai",
    thumbnail: thumbnailCubeWar,
    description: "AI message pipeline for WeChat and company knowledge",
  },
  {
    title: "Step1X-3D · ARM64 Server Deployment",
    slug: "step1x-3d-deployment",
    thumbnail: "/notes/images/step1x-3d-arm64-deployment/generation-result.webp",
    description: "End-to-end deployment from one image to textured and geometry models",
  },
  {
    title: "Internal AI Assistant · Workflow Design",
    slug: "workflow-assistant",
    thumbnail: thumbnailSharkie,
    description: "Controllable LLM workflow orchestration",
  },
  {
    title: "Software Copyrights",
    slug: "software-copyrights",
    thumbnail: thumbnailPokedex,
    description: "Software copyright records and project assets",
  },
] as const satisfies ProjectPreview[];
