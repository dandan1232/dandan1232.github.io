import type { ProjectContent } from "../../types";

export default {
  title: "FastGPT · Workflow Call Tracing",
  theme: "dark",
  tags: ["fastgpt", "llm", "postgresql", "docker"],
  live: "/notes/fastgpt-workflow-identifiers.html",
  liveLabel: "Read the tracing case study",
  description:
    "Connecting a model call to its FastGPT application and conversation. I carried appId and chatId through FastGPT, AI Proxy, llm-router, and new-api into the log database, addressing proxy forwarding, legacy formats, and deployment troubleshooting.",
  components: [
    {
      type: "text",
      props: {
        title: "The problem",
        text: "Proxies rebuild model requests, so custom identifiers do not survive automatically. Gateways can also filter legacy underscore headers, leaving downstream values empty. Application and conversation identifiers needed to travel with each request and reach the correct log database so business calls could be associated and failures investigated.",
      },
    },
    {
      type: "list",
      props: {
        title: "My contribution",
        size: "lg",
        items: [
          "Read appId and chatId from the FastGPT workflow context and sent them as X-App-Id and X-Chat-Id.",
          "Explicitly forwarded business headers after proxy request reconstruction, retained legacy underscore compatibility, and applied a forwarding allowlist to the Chat Completions path.",
          "Recorded inbound values after new-api authentication, persisted logs.app_id and logs.chat_id, and distinguished the main database from the separate LOG_DB.",
          "Added inbound, outbound, and pre-write diagnostics with credential sanitization, and documented hop-by-hop checks for Docker networking, image versions, and gateway filtering.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/fastgpt-workflow-identifiers/new-api-identifiers-received.png",
        alt: "new-api logs receiving application and conversation identifiers",
        caption: "Reception record example: new-api receives nonempty application and conversation identifiers.",
      },
    },
    {
      type: "list",
      props: {
        title: "Implemented results",
        size: "lg",
        items: [
          "Connected identifier forwarding across four services; hyphenated headers restored downstream reception.",
          "Persisted app_id and chat_id in the log database, providing a basis for associating call records with applications and conversations.",
          "Documented the implementation, sample logs, and hop-by-hop troubleshooting to locate where identifiers are lost.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/fastgpt-workflow-identifiers/log-db-workflow-identifiers.png",
        alt: "app_id and chat_id fields in the log database",
        caption: "Persistence record example: the separate log database stores app_id and chat_id.",
      },
    },
  ],
} as const satisfies ProjectContent;
