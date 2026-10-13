import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";
import thumbnailFastGPT from "../../../assets/thumbnails/fastgpt-workflow.png";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "JobTailor · AI 简历诊断与岗位定制",
    slug: "jobtailor",
    thumbnail: "/notes/images/jobtailor/input-workspace.webp",
    description: "对照真实经历诊断岗位匹配，逐条审阅并采纳修改",
  },
  {
    title: "LearnSphere · AI 学习测验",
    slug: "learnsphere",
    thumbnail: "/notes/images/learnsphere/quiz-summary.png",
    description: "从文档章节到有原文依据的测验、评分与复盘",
  },
  {
    title: "AI 模型平台 · 异步计费治理",
    slug: "ai-model-platform",
    thumbnail: "/notes/images/video-model-async-billing-fixes/after-ledger.png",
    description: "联动三个服务，让视频预扣、退款与最终用量可核对",
  },
  {
    title: "FastGPT · 工作流调用追踪",
    slug: "fastgpt-workflow",
    thumbnail: thumbnailFastGPT,
    description: "保留应用与会话标识，从业务请求追踪到数据库记录",
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
