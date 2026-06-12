# dandan1232.github.io

Echo Lin 的个人作品集与技术笔记站点。技术栈 Vue 3 + TypeScript + Vite + Three.js + GSAP + Lenis。

## 本站结构

- 主页（Vue SPA）：项目案例展示、3D / 着色器交互
- `/notes/`：AI / LLM / RAG / FastGPT / Docker 等技术笔记（独立的 HTML，存放于 `public/notes/`）
- 静态资源：`public/images/`、`public/meta/` 等

## 本地开发

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器（端口 3000） |
| `npm run build` | 类型检查后打包到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run typecheck` | 仅类型检查 |

## 部署

推送到 `main` 分支后，由 `.github/workflows/deploy.yml` 自动构建并部署到 GitHub Pages。

仓库 **Settings → Pages → Build and deployment → Source** 需设置为 **GitHub Actions**。

## 内容定义位置

- 项目数据：`src/content/projects/{en,de}/<slug>.ts`
- 项目 ID 列表：`src/content/projects/index.ts`
- 列表预览资源：`src/content/projects/previews/`
- 标签样式/文案：`src/components/tagVariants.ts`
