import type { ProjectContent } from "../../types";

export default {
  title: "企业知识库 · GraphRAG 系统",
  theme: "dark",
  tags: ["python", "fastapi", "postgresql", "neo4j", "rag"],
  description:
    "面向企业内部知识问答的 GraphRAG 系统，将 PDF、结构化数据库、图数据库和向量检索统一到一套可追溯的问答链路中。<br/><br/>核心价值不只是“能回答”，而是把数据流、实体关系、检索策略和 LLM 输出约束组合起来，让复杂业务问题能够被稳定解释和持续迭代。",
  components: [
    {
      type: "text",
      props: {
        title: "系统重点",
        text: "系统按实体、关系、文本三层组织知识，并通过高低层关键词、向量召回、图谱扩展和重排策略组合检索结果。回答阶段强调来源引用、上下文边界和可回溯证据，降低幻觉风险。",
      },
    },
    {
      type: "list",
      props: {
        title: "负责内容",
        size: "lg",
        items: [
          "设计 FastAPI 服务接口、任务处理流程和知识入库链路。",
          "将 PostgreSQL、Neo4j、向量检索与 LLM 问答流程串联为可维护的业务闭环。",
          "整理检索策略、Prompt 约束和评估反馈机制，支持后续持续优化。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
