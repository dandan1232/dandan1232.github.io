import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailQuibbo from "../../../assets/thumbnails/quibbo.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "企业知识库 · GraphRAG 系统",
    slug: "enterprise-knowledge-base",
    thumbnail: thumbnailStreakon,
    description: "面向业务问答的多层知识检索系统",
  },
  {
    title: "ChatGPT on WeChat · 媒体增强版",
    slug: "wechat-media-ai",
    thumbnail: thumbnailCubeWar,
    description: "公众号与企业知识的 AI 消息链路",
  },
  {
    title: "PPT 自动清洗 & 审核工具",
    slug: "ppt-audit-tool",
    thumbnail: thumbnailQuibbo,
    description: "面向素材治理的自动化工具链",
  },
  {
    title: "内部 AI 助手 · Workflow 设计",
    slug: "workflow-assistant",
    thumbnail: thumbnailSharkie,
    description: "可控、可扩展的 LLM 流程编排",
  },
  {
    title: "软著资料",
    slug: "software-copyrights",
    thumbnail: thumbnailPokedex,
    description: "软件著作权资料与项目沉淀",
  },
] as const satisfies ProjectPreview[];
