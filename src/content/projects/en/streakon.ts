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
    "StreakOn helps small groups stay consistent with daily habits through shared streaks and simple check-ins.<br/><br/>The app was designed around low friction interactions, mobile usability, and lightweight social features, using Next.js, Node.js, PostgreSQL, and Redis.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: streakon0,
        alt: "Solo and group streaks",
        caption: "Solo and group streaks",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon1,
        alt: "Streak progress",
        caption: "Streak progress",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon2,
        alt: "Cheer for friends",
        caption: "Cheer for friends",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: streakon3,
        alt: "Invite Flow",
        caption: "Invite Flow",
      },
    },
  ],
} as const satisfies ProjectContent;
