import type { ProjectContent } from "../../types";

export default {
  title: "LearnSphere · AI Learning Quizzes",
  theme: "light",
  tags: ["next", "react", "llm"],
  live: "/notes/learnsphere-ai-active-recall.html",
  liveLabel: "Read the case study",
  source: "https://github.com/dandan1232/LearnSphere",
  description:
    "Turn public technical documentation into quizzes grounded in source evidence, supporting active recall and review after reading.<br/><br/>Built with Next.js, React and TypeScript, the app covers document parsing, chapter selection, mixed question types, scoring and question-specific AI follow-ups. Learning records stay in the user's current browser.",
  components: [
    {
      type: "text",
      props: {
        title: "The problem",
        text: "Reading documentation does not guarantee that a learner can answer questions independently. Generic AI quizzes can drift from the source, entire online books make it difficult to define a manageable scope, and grading can lack clear reasons. LearnSphere lets users select chapters, generate questions tied to source evidence and inspect the reasoning behind their scores.",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/learnsphere/source-inspection.png",
        alt: "LearnSphere recognizes a Docsify online book and lists selectable chapters",
        caption:
          "Actual source inspection: 18 chapters discovered in the Hello-Agents online book, ready for the learner to select a scope.",
        presentation: "screenshot",
      },
    },
    {
      type: "list",
      props: {
        title: "My contribution",
        size: "lg",
        items: [
          "Implemented adapters for Docsify, GitHub Markdown and general documentation, with consistent chapters and source sections so each question can trace back to its original location.",
          "Built quizzes with single-choice, multiple-choice, true-or-false and short-answer questions, using schema validation, answer checks and retries to handle missing fields, mismatched answers and invented references.",
          "Scored objective questions with fixed program rules and evaluated short answers against individual rubric criteria, validating awarded points and calculating totals in code.",
          "Added AI follow-ups tied to each question: guided hints during an attempt, then review using the answer, grading results and source evidence after scoring.",
          "Stored sources, quizzes, attempt snapshots and conversations in the browser so learners can reopen a question and continue their review.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/learnsphere/quiz-summary.png",
        alt: "LearnSphere quiz summary showing total points, question count and question types",
        caption:
          "Actual quiz summary: total points, question count, difficulty, estimated time and question type breakdown are visible before an attempt.",
        presentation: "screenshot",
      },
    },
    {
      type: "text",
      props: {
        title: "The result",
        text: "Delivered a complete flow from importing documents and selecting chapters to quiz generation, scoring and question-by-question review. Questions retain source locations and evidence excerpts; learners can inspect objective answer explanations and rubric scores, then ask follow-up questions. Historical attempts preserve the original questions and grading evidence for later review.",
      },
    },
  ],
} as const satisfies ProjectContent;
