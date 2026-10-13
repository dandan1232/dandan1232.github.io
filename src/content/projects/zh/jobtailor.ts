import type { ProjectContent } from "../../types";

export default {
  title: "JobTailor · 基于证据的 AI 简历优化",
  theme: "light",
  tags: ["next", "react", "llm", "docker"],
  live: "/notes/jobtailor-evidence-based-resume.html",
  liveLabel: "阅读项目复盘",
  source: "https://github.com/dandan1232/JobTailor",
  description:
    "面向目标岗位的简历诊断与优化工作台，将原简历中的事实与岗位要求对照，再由用户逐条决定修改。<br/><br/>围绕文件解析、流式建议、确定性写回和导出完善使用流程，让 AI 的建议可核对、可选择，并准确写入最终版本。",
  components: [
    {
      type: "text",
      props: {
        title: "解决的问题",
        text: "直接让 AI 重写简历，容易掩盖修改过程、加入没有依据的经历，也可能覆盖用户已经确认的内容。JobTailor 将原文、建议和原因放在一起，把建议审阅与最终生成连接起来，让用户知道改了哪里、为什么改。",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/jobtailor/input-workspace.webp",
        alt: "JobTailor 简历与岗位描述输入工作区",
        caption: "解析简历并输入目标岗位描述；文件名已做模糊处理。",
      },
    },
    {
      type: "list",
      props: {
        title: "我的工作",
        size: "lg",
        items: [
          "串联 PDF/DOCX 解析、岗位匹配、建议审阅、继续编辑和文件导出，处理上传接口空响应与非 JSON 响应。",
          "完善流式解析：完整建议到达后逐条展示；生成阶段由程序替换已采纳内容，校验原文唯一性并拒绝重叠修改。",
          "处理 Docker standalone 部署中缺失的 PDF 解析动态依赖，并结合算法回归与端到端测试验证核心流程。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/jobtailor/revision-review.webp",
        alt: "JobTailor 原文与修改建议对照审阅界面",
        caption: "建议审阅示例，AI 候选内容仍需人工核对。",
      },
    },
    {
      type: "list",
      props: {
        title: "实现结果",
        size: "lg",
        items: [
          "完成从文件上传、诊断和人工决策，到优化版生成、继续编辑与 PDF/DOCX 导出的使用闭环。",
          "只将用户已采纳的建议写回原文，生成阶段无需模型二次全文改写；建议找不到原文、原文重复或修改重叠时明确报错。",
          "保留无模型配置的本地规则预览，并通过隔离 standalone 环境中的真实 PDF 上传验证部署修复。",
        ],
      },
    },
    {
      type: "text",
      props: {
        title: "当前边界",
        text: "当前以纯文本编辑为主，不保留原文件的复杂排版，也不支持扫描版 PDF 的文字识别。没有账号和云端版本保存；AI 建议仍需用户核对事实，本地规则预览对非技术岗位的支持有限。",
      },
    },
  ],
} as const satisfies ProjectContent;
