import type { ProjectContent } from "../../types";

export default {
  title: "ChatGPT on WeChat · 媒体增强版",
  theme: "dark",
  tags: ["python", "wechat", "minio", "llm"],
  description:
    "基于 ChatGPT on WeChat 的企业场景定制版本，接入公司知识与 MinIO 媒体库，让公众号回复不只停留在文本，而是能够按业务语义返回图片、视频和结构化内容。<br/><br/>项目重点在于真实运营链路：媒体识别、压缩转码、失败兜底、消息幂等和弱网条件下的稳定性。",
  components: [
    {
      type: "text",
      props: {
        title: "链路设计",
        text: "系统在收到用户消息后完成意图识别、知识检索、媒体匹配和回复组装。媒体资源通过 MinIO 管理，结合大小限制、格式转换和静默失败策略，让公众号回复尽量稳定可用。",
      },
    },
    {
      type: "list",
      props: {
        title: "工程取舍",
        size: "lg",
        items: [
          "将外部开源项目改造成适配企业知识与运营素材的内部工具。",
          "处理图片、视频、文件等非文本内容的检索、拼接与回传。",
          "补充重试去重、超时兜底和异常日志，降低线上消息链路的不确定性。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
