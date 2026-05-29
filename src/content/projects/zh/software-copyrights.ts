import type { ProjectContent } from "../../types";

export default {
  title: "软著资料",
  theme: "light",
  tags: ["automation", "gray"],
  live: "/notes/software-copyrights.html",
  description:
    "软件著作权资料与项目沉淀入口，集中整理已沉淀的系统、工具和 AI 应用相关资料。<br/><br/>这部分内容更偏资料归档和成果展示，所以项目详情会跳转到独立页面查看。",
  components: [
    {
      type: "text",
      props: {
        title: "资料入口",
        text: "软著页面用于集中展示软件著作权相关资料，也方便从作品集的精选项目区域直接访问。",
      },
    },
  ],
} as const satisfies ProjectContent;
