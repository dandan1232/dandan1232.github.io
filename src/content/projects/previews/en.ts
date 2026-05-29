import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailQuibbo from "../../../assets/thumbnails/quibbo.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";

import type { ProjectPreview } from "../../types";

export default [
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
    title: "PPT Cleanup & Review Tool",
    slug: "ppt-audit-tool",
    thumbnail: thumbnailQuibbo,
    description: "Automation tooling for presentation asset governance",
  },
  {
    title: "Internal AI Assistant · Workflow Design",
    slug: "workflow-assistant",
    thumbnail: thumbnailSharkie,
    description: "Controllable LLM workflow orchestration",
  },
] as const satisfies ProjectPreview[];
