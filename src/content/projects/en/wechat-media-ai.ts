import type { ProjectContent } from "../../types";

export default {
  title: "ChatGPT on WeChat · Media Extension",
  theme: "dark",
  tags: ["python", "wechat", "minio", "llm"],
  description:
    "An enterprise-focused customization of ChatGPT on WeChat, connected to company knowledge and a MinIO media library so public-account replies can include images, videos, and structured content instead of plain text only.<br/><br/>The engineering focus is the real operations pipeline: media matching, compression, transcoding, fallback behavior, message idempotency, and stability under unreliable networks.",
  components: [
    {
      type: "text",
      props: {
        title: "Pipeline Design",
        text: "Incoming messages go through intent detection, knowledge retrieval, media matching, and reply assembly. MinIO stores media resources, while size limits, format conversion, and silent fallback rules keep the public-account experience stable.",
      },
    },
    {
      type: "list",
      props: {
        title: "Engineering Choices",
        size: "lg",
        items: [
          "Adapted an open-source project into an internal tool for company knowledge and operations assets.",
          "Handled image, video, and file retrieval, composition, and delivery.",
          "Added retry dedupe, timeout fallback, and exception logging to reduce uncertainty in production.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
