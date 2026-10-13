import type { ProjectContent } from "../../types";

export default {
  title: "JobTailor · Evidence-Based AI Resume Editing",
  theme: "light",
  tags: ["next", "react", "llm", "docker"],
  live: "/notes/jobtailor-evidence-based-resume.html",
  liveLabel: "Read the case study",
  source: "https://github.com/dandan1232/JobTailor",
  description:
    "A resume workspace that compares existing facts with a target role and lets users decide on each proposed change.<br/><br/>My work connected file parsing, streamed suggestions, deterministic updates, and exports so users can review suggestions, choose changes, and apply them accurately to the final version.",
  components: [
    {
      type: "text",
      props: {
        title: "The Problem",
        text: "Asking AI to rewrite an entire resume can hide the editing process, introduce unsupported experience, or overwrite changes the user has already approved. JobTailor presents the original text, suggested replacement, and rationale together, connecting review with final generation so users can understand what changes and why.",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/jobtailor/input-workspace.webp",
        alt: "JobTailor resume and job description input workspace",
        caption: "Parse a resume and enter the target job description; the filename is blurred.",
      },
    },
    {
      type: "list",
      props: {
        title: "My Work",
        size: "lg",
        items: [
          "Connected PDF/DOCX parsing, role matching, suggestion review, continued editing, and file exports, including handling empty and non-JSON upload responses.",
          "Improved stream parsing to display each complete suggestion as it arrives. Applied accepted changes in code, checking unique source matches and rejecting overlapping edits.",
          "Fixed missing dynamic PDF dependencies in the Docker standalone build and verified the core flow with regression and end-to-end tests.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/jobtailor/revision-review.webp",
        alt: "JobTailor review view comparing original text and suggested edits",
        caption: "Suggestion review example; AI drafts still require human fact-checking.",
      },
    },
    {
      type: "list",
      props: {
        title: "Results",
        size: "lg",
        items: [
          "Completed the flow from file upload, diagnosis, and human review to an editable resume and PDF/DOCX export.",
          "Only accepted suggestions are applied, without a second full AI rewrite. Missing or repeated source text and overlapping edits produce explicit errors.",
          "Kept a local rules preview for installations without a configured model, and verified the deployment fix by uploading a real PDF in an isolated standalone environment.",
        ],
      },
    },
    {
      type: "text",
      props: {
        title: "Current Scope",
        text: "The editor works with plain text and does not preserve complex document layouts or recognize text in scanned PDFs. Accounts and cloud version storage are outside the current scope. Users still need to verify AI suggestions, and the local rules preview has limited support for non-technical roles.",
      },
    },
  ],
} as const satisfies ProjectContent;
