import type { ProjectContent } from "../../types";

export default {
  title: "FastGPT 工作流标识全链路透传",
  theme: "dark",
  tags: ["fastgpt", "llm", "postgresql", "docker"],
  live: "/notes/fastgpt-workflow-identifiers.html",
  description:
    "围绕 FastGPT 工作流的 appId 与 chatId，打通 FastGPT、AI Proxy、llm-router、new-api 到日志数据库的完整追踪链路。<br/><br/>实践重点不仅是传递两个请求头，还包括代理重建请求时的白名单透传、历史格式兼容、日志脱敏、独立 LOG_DB 落库，以及多容器环境下的逐跳排障。",
  components: [
    {
      type: "text",
      props: {
        title: "链路设计",
        text: "统一使用 X-App-Id 与 X-Chat-Id 作为业务追踪协议。FastGPT 从工作流上下文注入标识，AI Proxy 与 llm-router 显式白名单转发，new-api 在鉴权后记录入站值，并写入 logs.app_id / logs.chat_id。",
      },
    },
    {
      type: "list",
      props: {
        title: "工程成果",
        size: "lg",
        items: [
          "完成四个服务之间的工作流标识透传，并兼容旧下划线请求头。",
          "建立入站、出站、写库前的逐跳日志，敏感凭证统一脱敏。",
          "沉淀 Docker 网络、镜像版本、网关过滤与 LOG_DB 定位的完整排障手册。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
