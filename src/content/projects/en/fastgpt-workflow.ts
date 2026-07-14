import type { ProjectContent } from "../../types";

export default {
  title: "FastGPT Workflow Identifier Tracing",
  theme: "dark",
  tags: ["fastgpt", "llm", "postgresql", "docker"],
  live: "/notes/fastgpt-workflow-identifiers.html",
  description:
    "An end-to-end tracing path for FastGPT workflow appId and chatId across FastGPT, AI Proxy, llm-router, new-api, and the log database.<br/><br/>The work covers allowlisted header forwarding after request reconstruction, legacy header compatibility, sanitized diagnostics, LOG_DB persistence, and hop-by-hop troubleshooting in a multi-container deployment.",
  components: [
    {
      type: "text",
      props: {
        title: "Pipeline design",
        text: "X-App-Id and X-Chat-Id form the shared tracing contract. FastGPT injects values from workflow context, both proxies forward an explicit allowlist, and new-api records the authenticated inbound values before persisting them to logs.app_id and logs.chat_id.",
      },
    },
    {
      type: "list",
      props: {
        title: "Engineering outcomes",
        size: "lg",
        items: [
          "Connected workflow identifiers across four services while retaining compatibility with legacy underscore headers.",
          "Added inbound, outbound, and pre-write diagnostics with credential sanitization.",
          "Documented Docker networking, image-version drift, gateway filtering, and LOG_DB troubleshooting.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
