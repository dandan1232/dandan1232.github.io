import type { ProjectContent } from "../../types";

export default {
  title: "PPT Cleanup & Review Tool",
  theme: "light",
  tags: ["python", "automation"],
  description:
    "An automation tool for large presentation libraries, scanning small icons, background images, sensitive elements, and layout issues while generating reviewable JSON reports.<br/><br/>It turns manual slide-by-slide checks into rule-based scanning plus targeted human review for knowledge management and external presentation readiness.",
  components: [
    {
      type: "text",
      props: {
        title: "Processing Goal",
        text: "The tool decomposes presentations into analyzable pages, images, and shape objects, flags suspicious content with location metadata, and emits reports for batch review, post-processing, and style governance.",
      },
    },
    {
      type: "list",
      props: {
        title: "Capabilities",
        size: "lg",
        items: [
          "Batch scan slide objects and detect small icons, background images, and sensitive elements.",
          "Generate structured JSON reports for review or downstream automation.",
          "Capture reusable rules for enterprise asset governance and reduce repeated manual checks.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
