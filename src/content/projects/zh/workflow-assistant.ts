import type { ProjectContent } from "../../types";

export default {
  title: "内部 AI 助手 · Workflow 设计",
  theme: "dark",
  tags: ["fastgpt", "llm", "rag"],
  description:
    "为内部 AI 助手设计知识域、提示词规范和 Workflow 节点，将业务问题拆解成可控的流程：识别意图、选择知识域、检索资料、约束回答、必要时转人工或返回边界说明。<br/><br/>目标是在实际业务场景中减少幻觉，提高回答稳定性，并让后续维护人员能清楚理解每个节点的职责。",
  components: [
    {
      type: "text",
      props: {
        title: "设计原则",
        text: "Workflow 不追求把所有问题一次性塞进大模型，而是将复杂任务拆成可观察、可调试、可替换的节点。每个节点都有明确输入输出，便于后续定位问题和迭代策略。",
      },
    },
    {
      type: "list",
      props: {
        title: "落地方向",
        size: "lg",
        items: [
          "梳理提示词规范、知识域边界和问答输出格式。",
          "设计检索、判断、回答、兜底等节点组合，提升流程可控性。",
          "结合 FastGPT 等平台能力沉淀可复用模板，减少重复配置成本。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
