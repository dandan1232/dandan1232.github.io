import type { Locale } from "../../i18n/types";

interface CollectionProject {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  source: string;
  thumbnail: string;
  badge?: Record<Locale, string>;
}

export const projectCollection = [
  {
    title: { zh: "麦迹 · mai-recap", en: "Mai Recap" },
    description: {
      zh: "把近期麦当劳点餐记录变成五页回顾与分享卡，支持网页查询和本地生成。",
      en: "Turn recent McDonald's orders into a five-page recap and share card, online or locally.",
    },
    source: "https://github.com/dandan1232/mai-recap",
    thumbnail: "mai-recap",
  },
  {
    title: { zh: "层境 · LayerScape", en: "LayerScape" },
    description: {
      zh: "用中文课程、二维计算与三维模型，逐步看懂 Transformer。",
      en: "Explore Transformers through Chinese lessons, 2D calculations and 3D models.",
    },
    source: "https://github.com/dandan1232/transformer-layerscape",
    thumbnail: "layerscape",
  },
  {
    title: { zh: "声悦 · NarratorAI", en: "NarratorAI" },
    description: {
      zh: "有记忆、有性格、会成长的 AI 陪伴，关系随对话逐步积累。",
      en: "AI companionship with evolving characters, relationships and lasting memories.",
    },
    source: "https://github.com/dandan1232/NarratorAI",
    thumbnail: "narratorai",
  },
  {
    title: { zh: "小鲜知 · 智能到期提醒", en: "Fresh Reminder" },
    description: {
      zh: "集中管理食品保质期、证件、账单与纪念日的微信小程序。",
      en: "A WeChat mini program for expiry dates, documents, bills and anniversaries.",
    },
    source: "https://github.com/dandan1232/reminder-anything-uniapp",
    thumbnail: "reminder",
  },
  {
    title: { zh: "FlowGuard AI", en: "FlowGuard AI" },
    description: {
      zh: "对照标准操作流程审查装配视频，串联逐步证据、人工复核与返工。",
      en: "Audit assembly videos against SOPs, with step evidence, human review and rework.",
    },
    source: "https://github.com/SparkAgentForge/flowguard-ai/tree/main",
    thumbnail: "flowguard",
    badge: { zh: "黑客松", en: "Hackathon" },
  },
  {
    title: { zh: "LearnSphere", en: "LearnSphere" },
    description: {
      zh: "把文档和在线书籍变成章节测验，结合评分、原文证据与 AI 讲解复习。",
      en: "Turn documents into chapter quizzes with scoring, source evidence and AI explanations.",
    },
    source: "https://github.com/dandan1232/LearnSphere",
    thumbnail: "learnsphere",
  },
  {
    title: { zh: "CollabDocs", en: "CollabDocs" },
    description: {
      zh: "面向多人实时协作与内容创作的在线文档工作室。",
      en: "An online document studio for real-time collaborative writing and content creation.",
    },
    source: "https://github.com/dandan1232/CollabDocs",
    thumbnail: "collabdocs",
  },
  {
    title: { zh: "物证档案局", en: "Evidence Bureau" },
    description: {
      zh: "观察三维物证、归档线索、串联证据，调查《消失的住客》。",
      en: "Examine 3D evidence and connect clues to investigate The Vanished Tenant.",
    },
    source: "https://github.com/dandan1232/evidence-bureau",
    thumbnail: "evidence-bureau",
  },
  {
    title: { zh: "JobTailor", en: "JobTailor" },
    description: {
      zh: "对照目标岗位分析简历，逐条审阅有依据的修改建议，再生成和导出。",
      en: "Review evidence-based resume suggestions for a target role, then generate and export.",
    },
    source: "https://github.com/dandan1232/JobTailor",
    thumbnail: "jobtailor",
  },
  {
    title: { zh: "ConvertKit", en: "ConvertKit" },
    description: {
      zh: "在浏览器本地批量转换文件格式，支持 EPUB 导出，文件无需上传。",
      en: "Convert files locally in the browser, with batch processing and EPUB export.",
    },
    source: "https://github.com/dandan1232/ConvertKit",
    thumbnail: "convertkit",
  },
  {
    title: { zh: "那就这样吧", en: "Just Like This" },
    description: {
      zh: "把晚饭选择、购物决策和解压小工具放在一起，让生活轻松一点。",
      en: "Everyday decision and relaxation tools, from dinner choices to shopping dilemmas.",
    },
    source: "https://github.com/dandan1232/Just-Like-This",
    thumbnail: "just-like-this",
  },
  {
    title: { zh: "HeartCloud Live", en: "HeartCloud Live" },
    description: {
      zh: "学生提交英文单词，大屏实时汇成彩色爱心词云，让课堂互动被看见。",
      en: "Turn students' submitted words into a live heart-shaped word cloud for the classroom.",
    },
    source: "https://github.com/dandan1232/heartcloud-live",
    thumbnail: "heartcloud",
  },
  {
    title: { zh: "雷神自动暂停", en: "Raiden Auto Pause" },
    description: {
      zh: "检测游戏或 Steam 退出后尝试暂停雷神加速器，减少忘记暂停的时长消耗。",
      en: "Try to pause the Raiden accelerator when a game or Steam exits to save unused time.",
    },
    source: "https://github.com/dandan1232/raiden_pause",
    thumbnail: "raiden",
  },
] satisfies CollectionProject[];
