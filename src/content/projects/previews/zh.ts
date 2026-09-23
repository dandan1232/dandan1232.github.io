import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";
import thumbnailFastGPT from "../../../assets/thumbnails/fastgpt-workflow.png";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "FastGPT 标识全链路透传",
    slug: "fastgpt-workflow",
    thumbnail: thumbnailFastGPT,
    description: "从工作流上下文到日志数据库的可追溯链路",
  },
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
    title: "Step1X-3D · ARM64 服务器部署",
    slug: "step1x-3d-deployment",
    thumbnail: "/notes/images/step1x-3d-arm64-deployment/generation-result.webp",
    description: "从单张图片到纹理与几何模型的端到端部署",
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
