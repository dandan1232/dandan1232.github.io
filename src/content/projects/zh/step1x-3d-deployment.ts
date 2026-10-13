import type { ProjectContent } from "../../types";

export default {
  title: "Step1X-3D · ARM64 服务器部署",
  theme: "light",
  tags: ["python", "docker", "automation"],
  live: "/notes/step1x-3d-arm64-deployment.html",
  liveLabel: "阅读部署笔记",
  description:
    "基于 StepFun 官方 Step1X-3D，在 NVIDIA GB10、ARM64 远程服务器上完成容器化部署，让单张图片能够生成几何模型与带纹理模型。<br/><br/>我的工作集中在硬件与依赖兼容、扩展编译、本地模型加载和服务部署，并通过实际生成与文件下载验证整套推理流程。",
  components: [
    {
      type: "text",
      props: {
        title: "解决的问题",
        text: "官方依赖不能直接照搬到 ARM64 与 GB10 环境：部分 CUDA 扩展没有适用的预编译包，CuPy 与容器的 CUDA 版本不匹配，模型还存在隐式在线下载依赖。即使生成成功，Gradio 的文件路径限制也可能阻止页面返回结果。",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/step1x-3d-arm64-deployment/generation-result.webp",
        alt: "Step1X-3D 图生 3D 的纹理模型与几何模型结果",
        caption: "单图生成纹理模型与几何模型；截图中的地址已做模糊处理。",
      },
    },
    {
      type: "list",
      props: {
        title: "我的工作",
        size: "lg",
        items: [
          "保留 NVIDIA PyTorch 容器的 CUDA 13 基线，从源码编译 nvdiffrast、PyTorch3D 和项目自带扩展，处理 CuPy、图形库与 Python 依赖兼容问题。",
          "分别获取运行源码和真实模型权重，将 Step1X、CLIP、DINOv2、SDXL、VAE、BiRefNet 与 U2Net 配置为本地加载。",
          "配置 Gradio 服务、生成文件允许路径与 SSH 隧道，定位首页异常、结果下载和本机代理问题，并整理启动与重启恢复步骤。",
        ],
      },
    },
    {
      type: "list",
      props: {
        title: "实现结果",
        size: "lg",
        items: [
          "验证 ARM64/GB10 环境中的 PyTorch 与 CUDA 可用，四个编译扩展可以正常导入。",
          "完成从输入图片到几何 GLB、纹理 GLB 的实际生成；服务首页和两个生成文件的 Gradio 下载接口均返回 HTTP 200。",
          "确认 Gradio API 可枚举，并将环境配置、兼容修复、生成验证与恢复步骤整理成公开部署笔记，敏感地址和路径已脱敏。",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/step1x-3d-arm64-deployment/gradio-api.webp",
        alt: "Step1X-3D Gradio API 调用文档",
        caption: "Gradio 提供的 Python 调用示例；地址与示例链接已做模糊处理。",
      },
    },
  ],
} as const satisfies ProjectContent;
