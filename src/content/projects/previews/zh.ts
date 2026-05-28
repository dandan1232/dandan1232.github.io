import thumbnailCubeWar from "../../../assets/thumbnails/cubewar.webp";
import thumbnailQuibbo from "../../../assets/thumbnails/quibbo.webp";
//import thumbnailParticles from "../../../assets/thumbnails/particles.webp";
import thumbnailPokedex from "../../../assets/thumbnails/pokedex.webp";
import thumbnailSharkie from "../../../assets/thumbnails/sharkie.webp";
import thumbnailStreakon from "../../../assets/thumbnails/streakon.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "StreakOn",
    slug: "streakon",
    thumbnail: thumbnailStreakon,
    description: "每日习惯追踪应用",
  },
  {
    title: "CubeWar",
    slug: "cubewar",
    thumbnail: thumbnailCubeWar,
    description: "多人策略游戏",
  },
  {
    title: "Quibbo",
    slug: "quibbo",
    thumbnail: thumbnailQuibbo,
    description: "多人游戏平台",
  },
  {
    title: "Sharkie",
    slug: "sharkie",
    thumbnail: thumbnailSharkie,
    description: "2D 冒险游戏",
  },
  /**  {
    title: "WebGL 粒子",
    slug: "particles",
    thumbnail: thumbnailParticles,
    description: "动态 3D 粒子",
  }, */
  {
    title: "Pokédex",
    slug: "pokedex",
    thumbnail: thumbnailPokedex,
    description: "开源学习项目",
  },
] as const satisfies ProjectPreview[];
