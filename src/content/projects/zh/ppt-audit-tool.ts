import type { ProjectContent } from "../../types";

export default {
  title: "PPT 自动清洗 & 审核工具",
  theme: "light",
  tags: ["python", "automation"],
  description:
    "面向大量 PPT 素材的自动化处理工具，用于扫描小图标、背景图、敏感元素和版式问题，并生成可复查的 JSON 报告。<br/><br/>它服务于知识沉淀和对外展示前的内容治理，让人工审核从逐页检查变成“规则扫描 + 重点复核”。",
  components: [
    {
      type: "text",
      props: {
        title: "处理目标",
        text: "工具把 PPT 拆解为可分析的页面、图片和形状对象，按规则标记疑似问题并保留定位信息。输出报告用于批量回看、二次处理和统一风格管理。",
      },
    },
    {
      type: "list",
      props: {
        title: "能力清单",
        size: "lg",
        items: [
          "批量扫描 PPT 页面对象，识别小图标、背景图和疑似敏感元素。",
          "生成结构化 JSON 报告，便于后续人工复核或自动化流水线消费。",
          "围绕企业素材管理场景沉淀可复用规则，减少重复人工检查。",
        ],
      },
    },
  ],
} as const satisfies ProjectContent;
