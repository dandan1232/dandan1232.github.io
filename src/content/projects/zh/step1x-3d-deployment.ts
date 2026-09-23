import type { ProjectContent } from "../../types";

export default {
  title: "Step1X-3D · ARM64 服务器部署",
  theme: "light",
  tags: ["python", "docker", "automation"],
  live: "/notes/step1x-3d-arm64-deployment.html",
  description:
    "在 NVIDIA GB10、ARM64 远程服务器上完成 StepFun Step1X-3D 的容器化部署，实现单张图片到几何模型与纹理模型的端到端生成。<br/><br/>实践覆盖 CUDA 13 环境适配、ARM64 原生扩展编译、百 GB 级模型本地加载、Gradio 服务启动、SSH 隧道与公开访问安全处理。",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/step1x-3d-arm64-deployment/generation-result.webp",
        alt: "Step1X-3D 图生 3D 的纹理模型与几何模型结果",
        caption: "单图生成纹理模型与几何模型",
      },
    },
    {
      type: "text",
      props: {
        title: "部署路径",
        text: "以 NVIDIA PyTorch 容器保留 GB10 所需的 CUDA/PyTorch 基线，在 ARM64 环境中从源码编译 nvdiffrast、PyTorch3D 与项目自带扩展，再把 Step1X、CLIP、DINOv2、SDXL、VAE、BiRefNet 和 U2Net 全部改为本地路径加载。",
      },
    },
    {
      type: "list",
      props: {
        title: "工程成果",
        size: "lg",
        items: [
          "解决 ARM64 缺少 CUDA 预编译包、CuPy 运行时不匹配和图形系统库缺失等兼容问题。",
          "完成 Gradio 页面与 Python API 两条调用链路，并验证几何 GLB、纹理 GLB 均可正常返回。",
          "将真实公网地址、主机信息、私钥路径和本地目录脱敏，沉淀为可公开复现的部署笔记。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: "/notes/images/step1x-3d-arm64-deployment/gradio-api.webp",
        alt: "Step1X-3D Gradio API 调用文档",
        caption: "Gradio 自动生成的 Python API 调用说明",
      },
    },
  ],
} as const satisfies ProjectContent;
