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
    "Quibbo ist eine Plattform für schnelle, rundenbasierte Multiplayer-Spiele. Sie verbindet Matchmaking, anpassbare 3D-Avatare und Account-Integration mit einem Rangsystem auf ELO-Basis.<br/><br/>Das Projekt begann als technisches Experiment und entwickelte sich zu einem skalierbaren System, um neue Spielideen auszuprobieren.",
  components: [
    {
      type: "media",
      props: {
        type: "video",
        src: videoQuibbo,
        caption: "Benutzeroberfläche",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo0,
        alt: "Avatar Ersteller",
        caption: "Avatar Ersteller",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo1,
        alt: "Mehrspieler Tic-Tac-Toe",
        caption: "Mehrspieler Tic-Tac-Toe",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo2,
        alt: "Verschiedene Minispiele",
        caption: "Verschiedene Minispiele",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo3,
        alt: "Avatar Variationen",
        caption: "Avatar Variationen",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo4,
        alt: "Responsives Design",
        caption: "Responsives Design",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: quibbo5,
        alt: "Dunkles Design",
        caption: "Dunkles Design",
      },
    },
  ],
} as const satisfies ProjectContent;
