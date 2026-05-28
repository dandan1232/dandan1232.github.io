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
    "Sharkie ist ein 2D-Unterwasser-Abenteuerspiel, entwickelt mit Vanilla JavaScript und HTML5 Canvas.<br/><br/>Das Projekt basiert auf objektorientierten Programmierprinzipien und nutzt eigene Klassen für Spielfiguren, Gegner und Spielsysteme, ergänzt durch flüssige Animationen, Kampfsysteme und mehrschichtige Parallax-Hintergründe.",
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
        alt: "Spielfiguren und Karten-Design",
        caption: "Spielfiguren und Karten-Design",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie1,
        alt: "Boss-Kampf",
        caption: "Boss-Kampf",
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
        alt: "Sieg-Screen",
        caption: "Sieg-Screen",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: sharkie4,
        alt: "Todes-Screen",
        caption: "Todes-Screen",
      },
    },
  ],
} as const satisfies ProjectContent;
