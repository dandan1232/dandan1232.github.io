import videoParticles from "../../../assets/videos/particles.mp4";

import particles0 from "../../../assets/images/projects/particles/particles-0.webp";
import particles1 from "../../../assets/images/projects/particles/particles-1.webp";
import particles2 from "../../../assets/images/projects/particles/particles-2.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "WebGL Particles",
  theme: "dark",
  tags: ["ogl", "javascript", "glsl"],
  live: "https://particles.david-hckh.com/",
  videoBorder: false,
  description:
    "一个使用 OGL.js 构建的实验性 WebGL 项目，通过数学公式和噪声函数驱动粒子动画。<br/><br/>粒子会在不同 3D 形态之间平滑流动和过渡。",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoParticles,
        caption: "动态粒子系统",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles0,
        alt: "环结形态",
        caption: "环结形态",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles1,
        alt: "圆环形态",
        caption: "圆环形态",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles2,
        alt: "球体形态",
        caption: "球体形态",
      },
    },
  ],
} as const satisfies ProjectContent;
