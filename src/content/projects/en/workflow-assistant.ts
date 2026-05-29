import type { ProjectContent } from "../../types";

export default {
  title: "Internal AI Assistant · Workflow Design",
  theme: "dark",
  tags: ["fastgpt", "llm", "rag"],
  description:
    "Workflow design for an internal AI assistant, covering knowledge domains, prompt conventions, and node responsibilities: intent detection, domain selection, retrieval, constrained answering, fallback, and escalation.<br/><br/>The goal is to reduce hallucination, improve answer stability, and make every node understandable for future maintenance.",
  components: [
    {
      type: "text",
      props: {
        title: "Design Principle",
        text: "The workflow avoids pushing every problem into one large prompt. Complex tasks are split into observable, debuggable, replaceable nodes with explicit inputs and outputs, making iteration and incident analysis easier.",
      },
    },
    {
      type: "list",
      props: {
        title: "Implementation Direction",
        size: "lg",
        items: [
          "Defined prompt conventions, knowledge-domain boundaries, and answer formats.",
          "Composed retrieval, decision, answering, and fallback nodes for more controllable behavior.",
          "Used FastGPT-style platform capabilities to create reusable templates and reduce configuration work.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
