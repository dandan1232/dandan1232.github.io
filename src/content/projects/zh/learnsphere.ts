import type { ProjectContent } from "../../types";

export default {
  title: "LearnSphere · AI 学习测验",
  theme: "light",
  tags: ["next", "react", "llm"],
  live: "/notes/learnsphere-ai-active-recall.html",
  liveLabel: "阅读项目复盘",
  source: "https://github.com/dandan1232/LearnSphere",
  description:
    "把公开技术文档转成有原文依据的学习测验，帮助读者从阅读进入主动回忆与复盘。<br/><br/>基于 Next.js、React 和 TypeScript，实现文档解析、章节选择、混合题型生成、作答评分和逐题 AI 追问，学习记录保存在用户当前浏览器中。",
  components: [
    {
      type: "text",
      props: {
        title: "解决的问题",
        text: "读完文档并不等于能独立回答问题。通用 AI 出题容易脱离原文，整本在线书籍又难以控制练习范围，评分理由也不够清楚。LearnSphere 让用户先选择章节，再生成绑定原文证据的题目，并在作答后查看具体评分依据。",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/learnsphere/source-inspection.png",
        alt: "LearnSphere 识别 Docsify 在线书籍并列出可选章节",
        caption: "实际链接识别结果：发现 Hello-Agents 在线书籍的 18 个章节，用户可以选择本次学习范围。",
        presentation: "screenshot",
      },
    },
    {
      type: "list",
      props: {
        title: "我的工作",
        size: "lg",
        items: [
          "实现 Docsify、GitHub Markdown 和通用文档的解析适配，统一章节与正文片段，让每道题能够追溯到原文位置。",
          "构建单选、多选、判断和简答混合题库，通过结构校验、答案检查和失败重试处理模型输出中的缺项、错位及虚构出处。",
          "客观题由程序按固定规则计分；简答题按逐项评分标准（Rubric）评阅，再由程序校验分值并汇总。",
          "实现与题目绑定的 AI 追问：作答时提供思考提示，出分后结合答案、评分结果和原文证据进行复盘。",
          "使用浏览器本地存储保存来源、题库、作答快照和对话，让用户再次打开同一道题时可以继续学习。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/learnsphere/quiz-summary.png",
        alt: "LearnSphere 生成完成后的测验概览，展示总分、题量和题型分布",
        caption: "实际测验概览：开始作答前展示总分、题量、难度、预计时长和各题型数量。",
        presentation: "screenshot",
      },
    },
    {
      type: "text",
      props: {
        title: "实现结果",
        text: "形成“导入文档—选择章节—生成测验—作答评分—逐题复盘”的完整流程。题目保留原文位置与证据片段，用户能查看客观题解析和简答题逐项得分，再围绕具体题目继续追问。历史记录保存当时的题目与评分依据，方便重新检查自己的理解。",
      },
    },
  ],
} as const satisfies ProjectContent;
