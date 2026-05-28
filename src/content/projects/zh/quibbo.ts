import videoQuibbo from "../../../assets/videos/quibbo.mp4";

import quibbo0 from "../../../assets/images/projects/quibbo/quibbo-0.webp";
import quibbo1 from "../../../assets/images/projects/quibbo/quibbo-1.webp";
import quibbo2 from "../../../assets/images/projects/quibbo/quibbo-2.webp";
import quibbo3 from "../../../assets/images/projects/quibbo/quibbo-3.webp";
import quibbo4 from "../../../assets/images/projects/quibbo/quibbo-4.webp";
import quibbo5 from "../../../assets/images/projects/quibbo/quibbo-5.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "Quibbo",
  theme: "light",
  tags: ["three", "node", "kubernetes", "redis", "postgresql"],
  videoBorder: true,
  description:
    "Quibbo 是一个面向快节奏回合制多人游戏的平台，整合了匹配机制、可自定义 3D 头像、账号系统，以及基于 ELO 的排位奖励。<br/><br/>这个项目最初是一个技术实验，后来发展成可扩展的系统，用于测试新的游戏创意。",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoQuibbo,
        caption: "用户界面",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo0,
        alt: "头像创建器",
        caption: "头像创建器",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo1,
        alt: "多人井字棋",
        caption: "多人井字棋",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo2,
        alt: "多种小游戏",
        caption: "多种小游戏",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo3,
        alt: "头像变体",
        caption: "头像变体",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo4,
        alt: "响应式设计",
        caption: "响应式设计",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo5,
        alt: "深色模式",
        caption: "深色模式",
      },
    },
  ],
} as const satisfies ProjectContent;
