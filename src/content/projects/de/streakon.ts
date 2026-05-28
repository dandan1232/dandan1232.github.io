import streakon0 from "../../../assets/images/projects/streakon/streakon-0.webp";
import streakon1 from "../../../assets/images/projects/streakon/streakon-1.webp";
import streakon2 from "../../../assets/images/projects/streakon/streakon-2.webp";
import streakon3 from "../../../assets/images/projects/streakon/streakon-3.webp";

import type { ProjectContent } from "../../types";

export default {
  title: "StreakOn",
  theme: "dark",
  tags: ["next", "node", "postgresql", "redis"],
  videoBorder: false,
  live: "https://www.streakon.app",
  description:
    "StreakOn unterstützt kleine Gruppen dabei, durch gemeinsame Streaks und einfache Check-ins bei täglichen Gewohnheiten dranzubleiben.<br/><br/>Die App wurde mit Fokus auf geringe Interaktionshürden, mobile Nutzung und leichte soziale Funktionen entwickelt – mit Next.js, Node.js, PostgreSQL und Redis.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: streakon0,
        alt: "Solo- und Gruppen-Streaks",
        caption: "Solo- und Gruppen-Streaks",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon1,
        alt: "Streak-Fortschritt",
        caption: "Streak-Fortschritt",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon2,
        alt: "Freunde anfeuern",
        caption: "Freunde anfeuern",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon3,
        alt: "Einladungs-Flow",
        caption: "Einladungs-Flow",
      },
    },
  ],
} as const satisfies ProjectContent;
