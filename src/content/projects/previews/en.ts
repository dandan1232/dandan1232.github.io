import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";
import thumbnailFastGPT from "../../../assets/thumbnails/fastgpt-workflow.png";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "JobTailor · Evidence-Based Resume Review",
    slug: "jobtailor",
    thumbnail: "/notes/images/jobtailor/input-workspace.webp",
    description: "Review role fit against real experience and apply suggestions individually",
  },
  {
    title: "LearnSphere · AI Learning Quizzes",
    slug: "learnsphere",
    thumbnail: "/notes/images/learnsphere/quiz-summary.png",
    description: "Source-grounded quizzes, scoring and review from selected document chapters",
  },
  {
    title: "AI Model Platform · Async Billing",
    slug: "ai-model-platform",
    thumbnail: "/notes/images/video-model-async-billing-fixes/after-ledger.png",
    description: "Reconcile video precharges, refunds and final usage across three services",
  },
  {
    title: "FastGPT · Workflow Call Tracing",
    slug: "fastgpt-workflow",
    thumbnail: thumbnailFastGPT,
    description: "Keep app and chat identifiers from business requests to database records",
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
