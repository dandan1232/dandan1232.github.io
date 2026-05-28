import videoPokedex from "../../../assets/videos/pokedex.mp4";

import pokedex0 from "../../../assets/images/projects/pokedex/pokedex-0.webp";
import pokedex1 from "../../../assets/images/projects/pokedex/pokedex-1.webp";
import pokedex2 from "../../../assets/images/projects/pokedex/pokedex-2.webp";
import pokedex3 from "../../../assets/images/projects/pokedex/pokedex-3.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "Pokédex",
  theme: "light",
  tags: ["javascript", "html", "css"],
  live: "https://pokedex.david-hckh.com/",
  source: "https://github.com/davidhckh/pokedex",
  videoBorder: true,
  description:
    "这是我早期的 Web 项目之一，用来练习 Web 开发的核心概念。Pokédex 是开源项目，希望其他开发者也能用同样的方式学习。<br/><br/>它还接入了公共 API，用来练习异步数据获取。",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoPokedex,
        caption: "Pokédex 应用",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: pokedex0,
        alt: "默认视图",
        caption: "默认视图",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: pokedex1,
        alt: "搜索功能",
        caption: "搜索功能",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: pokedex2,
        alt: "响应式设计",
        caption: "响应式设计",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: pokedex3,
        alt: "Lazy-Loading",
        caption: "Lazy-Loading",
      },
    },
  ],
} as const satisfies ProjectContent;
