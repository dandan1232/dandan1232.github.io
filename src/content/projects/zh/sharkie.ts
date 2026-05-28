import videoSharkie from "../../../assets/videos/sharkie.mp4";

import sharkie0 from "../../../assets/images/projects/sharkie/sharkie-0.webp";
import sharkie1 from "../../../assets/images/projects/sharkie/sharkie-1.webp";
import sharkie2 from "../../../assets/images/projects/sharkie/sharkie-2.webp";
import sharkie3 from "../../../assets/images/projects/sharkie/sharkie-3.webp";
import sharkie4 from "../../../assets/images/projects/sharkie/sharkie-4.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "Sharkie",
  theme: "light",
  tags: ["javascript", "html", "css"],
  live: "https://sharkie.david-hckh.com/",
  source: "https://github.com/davidhckh/sharkie-game",
  description:
    "Sharkie 是一款使用原生 JavaScript 和 HTML5 Canvas 开发的 2D 海底冒险游戏。<br/><br/>项目基于面向对象编程原则，为角色、敌人和游戏系统设计了自定义类，并加入了流畅动画、战斗机制和多层视差背景。",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoSharkie,
        caption: "Gameplay",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie0,
        alt: "角色与地图设计",
        caption: "角色与地图设计",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie1,
        alt: "Boss 战",
        caption: "Boss 战",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie2,
        alt: "Mission",
        caption: "Mission",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie3,
        alt: "胜利界面",
        caption: "胜利界面",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie4,
        alt: "失败界面",
        caption: "失败界面",
      },
    },
  ],
} as const satisfies ProjectContent;
