import type { ProjectContent } from "../../types";

export default {
  title: "AI Model Platform · Async Billing",
  theme: "dark",
  tags: ["python", "next", "llm", "docker"],
  live: "/notes/video-model-async-billing-fixes.html",
  liveLabel: "Read the billing case study",
  description:
    "Business customization and integration across new-api, llm-router and amax-router, connecting video task precharges, final settlement and refunds into a ledger users can reconcile.<br/><br/>The work covers video parameter adaptation, asynchronous status handling, log queries and frontend presentation, aligning transaction details with consumption summaries.",
  components: [
    {
      type: "text",
      props: {
        title: "The problem",
        text: "Video generation charges an estimate when a task is submitted; actual usage becomes available after completion. The original interface presented precharges as final spending, while query filters excluded background refund records. Users could not reconcile displayed charges with their balance.",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/video-model-async-billing-fixes/before-precharge.png",
        alt: "Video request logs before the fix, without separate precharge and settlement labels",
        caption: "Before: a precharge appears as ordinary spending, without refund or final settlement context.",
      },
    },
    {
      type: "list",
      props: {
        title: "My work",
        size: "lg",
        items: [
          "Coordinated video resolution, duration and reference-video validation across three services, including upstream protocol differences and nested gateway status mapping.",
          "Adjusted log queries to include refunds from video usage recalculation while preserving visibility boundaries for other financial transactions.",
          "Separated precharge and refund fields, displayed their money direction and billed usage, and aligned transaction details, net consumption and cross-day aggregation.",
          "Added status and query regression coverage, and compared frontend precharges, refunds, billed usage and summaries against backend ledger records.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/video-model-async-billing-fixes/after-ledger.png",
        alt: "Updated ledger with separate video precharge, async refund and billed token fields",
        caption:
          "After: precharges, refunds and billed usage are shown separately. Amounts belong to this example task.",
      },
    },
    {
      type: "list",
      props: {
        title: "Results",
        size: "lg",
        items: [
          "Connected precharging, task polling, actual usage settlement, difference refunds and user reconciliation.",
          "Users can inspect both transaction types. Consumption summaries use net amounts, and refunds do not count as additional model requests.",
          "Documented cross-service troubleshooting with clear checks for request parameters, task status, billing records and frontend aggregation.",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
