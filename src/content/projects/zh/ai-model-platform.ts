import type { ProjectContent } from "../../types";

export default {
  title: "AI 模型平台 · 异步计费治理",
  theme: "dark",
  tags: ["python", "next", "llm", "docker"],
  live: "/notes/video-model-async-billing-fixes.html",
  liveLabel: "阅读计费复盘",
  description:
    "围绕 new-api、llm-router 和 amax-router 的业务定制与联调，将视频任务的预扣、实际结算和退款串成可核对的账单。<br/><br/>工作覆盖视频参数适配、异步状态判断、日志查询和前端展示，让费用明细与最终消费汇总采用一致的口径。",
  components: [
    {
      type: "text",
      props: {
        title: "解决的问题",
        text: "视频生成在提交时先按预计规格扣费，真正的用量要等任务完成后才能确定。原有页面把预扣当作最终消费，后台生成的退款记录又被查询条件过滤，用户难以解释扣款与余额之间的差异。",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/video-model-async-billing-fixes/before-precharge.png",
        alt: "修复前的视频请求日志，只显示费用而没有区分预扣与最终消费",
        caption: "修复前的记录示例：预扣费用被展示为普通消费，缺少退款与最终结算说明。",
      },
    },
    {
      type: "list",
      props: {
        title: "我的工作",
        size: "lg",
        items: [
          "联动三个服务校验视频分辨率、时长与参考视频参数，处理不同上游协议及级联网关的状态映射。",
          "调整日志查询，放行属于视频用量重算的异步退款，并保留普通资金流水的可见边界。",
          "区分预扣与退款的账单字段，在前端展示资金方向和实际计费用量，统一明细、净消费与跨天统计规则。",
          "补充状态与查询回归测试，对照后台事实日志核对页面上的预扣、退款、实际用量和消费汇总。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/video-model-async-billing-fixes/after-ledger.png",
        alt: "修复后的账单，分别展示视频预扣费、异步退款和实际计费 Token",
        caption: "修复后的记录示例：预扣、退款和实际计费用量分别展示，截图金额仅为该次任务数据。",
      },
    },
    {
      type: "list",
      props: {
        title: "实现结果",
        size: "lg",
        items: [
          "形成“预扣—任务查询—实际用量结算—差额退款—用户核对”的处理流程。",
          "用户可以核对预扣和退款两类流水，最终消费按净额汇总，退款不会被重复计算为模型请求。",
          "沉淀跨服务排障记录，明确参数、任务状态、计费事实与页面统计各自的检查位置。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
