import type { ProjectContent } from "../../types";

export default {
  title: "Software Copyrights",
  theme: "light",
  tags: ["automation", "gray"],
  live: "/notes/software-copyrights.html",
  description:
    "A dedicated entry for software copyright records and project assets related to systems, tools, and AI applications.<br/><br/>This item is more of an archive and showcase entry, so the detail page links to the standalone records page.",
  components: [
    {
      type: "text",
      props: {
        title: "Archive Entry",
        text: "The copyrights page keeps software copyright materials together and makes them reachable from the selected projects section.",
      },
    },
  ],
} as const satisfies ProjectContent;
