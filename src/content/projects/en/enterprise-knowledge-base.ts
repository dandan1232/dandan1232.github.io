import type { ProjectContent } from "../../types";

export default {
  title: "Enterprise Knowledge Base · GraphRAG",
  theme: "dark",
  tags: ["python", "fastapi", "postgresql", "neo4j", "rag"],
  description:
    "A GraphRAG system for internal enterprise Q&A, connecting PDFs, structured databases, graph data, vector retrieval, and traceable LLM answers into one workflow.<br/><br/>The goal is not just answering questions, but making complex business answers explainable through data flow design, entity relationships, retrieval strategy, and output constraints.",
  components: [
    {
      type: "text",
      props: {
        title: "System Focus",
        text: "Knowledge is organized across entity, relationship, and text layers. Retrieval combines high- and low-level keywords, vector recall, graph expansion, and reranking, while answer generation keeps source boundaries and evidence traceability explicit.",
      },
    },
    {
      type: "list",
      props: {
        title: "Responsibilities",
        size: "lg",
        items: [
          "Designed FastAPI service interfaces, task flows, and knowledge ingestion pipelines.",
          "Connected PostgreSQL, Neo4j, vector retrieval, and LLM workflows into a maintainable loop.",
          "Documented retrieval strategy, prompt constraints, and evaluation feedback for iteration.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
