import videoCubeWar from "../../../assets/videos/cubewar.mp4";

import cubewar0 from "../../../assets/images/projects/cubewar/cubewar-0.webp";
import cubewar1 from "../../../assets/images/projects/cubewar/cubewar-1.webp";
import cubewar2 from "../../../assets/images/projects/cubewar/cubewar-2.webp";
import cubewar3 from "../../../assets/images/projects/cubewar/cubewar-3.webp";
import cubewar4 from "../../../assets/images/projects/cubewar/cubewar-4.webp";
import cubewar5 from "../../../assets/images/projects/cubewar/cubewar-5.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "CubeWar",
  theme: "dark",
  tags: ["three", "node", "websockets", "redis"],
  videoBorder: false,
  live: "https://cubewar.io",
  description:
    "CubeWar 是一款基于浏览器的多人游戏，玩家操控方块角色参与快节奏的策略对战。<br/><br/>我独立完成了完整技术栈，包括游戏引擎、客户端时间轴系统，以及基于 Redis 匹配的实时网络层，以支持流畅的高并发玩法。",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoCubeWar,
        caption: "Gameplay",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar0,
        alt: "Tutorial",
        caption: "Tutorial",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar1,
        alt: "地图主题",
        caption: "地图主题",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar2,
        alt: "身份验证",
        caption: "身份验证",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar3,
        alt: "响应式设计",
        caption: "响应式设计",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar4,
        alt: "多种游戏模式",
        caption: "多种游戏模式",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: cubewar5,
        alt: "Party-System",
        caption: "Party-System",
      },
    },
  ],
} as const satisfies ProjectContent;
