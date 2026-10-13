import type { ProjectContent } from "../../types";

export default {
  title: "FastGPT · 工作流调用追踪",
  theme: "dark",
  tags: ["fastgpt", "llm", "postgresql", "docker"],
  live: "/notes/fastgpt-workflow-identifiers.html",
  liveLabel: "阅读链路复盘",
  description:
    "让一次模型调用能够对应到具体的 FastGPT 应用和对话。我围绕 appId 与 chatId，打通 FastGPT、AI Proxy、llm-router、new-api 到日志数据库的追踪链路，处理代理转发、旧格式兼容和部署排障。",
  components: [
    {
      type: "text",
      props: {
        title: "解决的问题",
        text: "模型请求经过多个服务时，代理会重新构造请求，自定义标识不会自动保留；旧下划线请求头还可能被网关过滤，导致下游收到空值。需要让应用和对话标识随请求传递，并在正确的日志数据库中保存，便于关联业务调用与排查故障。",
      },
    },
    {
      type: "list",
      props: {
        title: "我的工作",
        size: "lg",
        items: [
          "从 FastGPT 工作流上下文读取 appId、chatId，统一使用 X-App-Id 和 X-Chat-Id 发送。",
          "在代理重建请求后显式转发业务头，兼容旧下划线格式；为 Chat Completions 链路设置透传白名单。",
          "在 new-api 鉴权后记录接收值，写入 logs.app_id / logs.chat_id，并区分主数据库与独立 LOG_DB。",
          "补充入站、出站、写库前的诊断日志和凭证脱敏，整理 Docker 网络、镜像版本与网关过滤的逐跳排障方法。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/fastgpt-workflow-identifiers/new-api-identifiers-received.png",
        alt: "new-api 日志中收到应用和对话标识",
        caption: "接收记录示例：new-api 收到非空的应用和对话标识。",
      },
    },
    {
      type: "list",
      props: {
        title: "实现结果",
        size: "lg",
        items: [
          "打通四个服务之间的工作流标识传递，改用连字符请求头后恢复下游接收。",
          "日志数据库能够保存 app_id 和 chat_id，为按应用、对话关联调用记录提供依据。",
          "沉淀实现说明、日志示例与逐跳排障手册，便于检查标识在哪一段丢失。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/fastgpt-workflow-identifiers/log-db-workflow-identifiers.png",
        alt: "日志数据库中的 app_id 和 chat_id 字段",
        caption: "落库记录示例：独立日志数据库保存了 app_id 和 chat_id。",
      },
    },
  ],
} as const satisfies ProjectContent;
