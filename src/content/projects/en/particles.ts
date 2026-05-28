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
    "An experimental WebGL project built with OGL.js, animating particles through mathematical formulas and noise functions.<br/><br/>The particles transition smoothly between multiple 3D shapes that blend into one another.",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoParticles,
        caption: "Animated Particle System",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles0,
        alt: "Knot Shape",
        caption: "Knot Shape",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles1,
        alt: "Donut Shape",
        caption: "Donut Shape",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: particles2,
        alt: "Sphere Shape",
        caption: "Sphere Shape",
      },
    },
  ],
} as const satisfies ProjectContent;
