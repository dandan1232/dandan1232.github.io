import type { ProjectContent } from "../../types";

export default {
  title: "Step1X-3D · ARM64 Server Deployment",
  theme: "light",
  tags: ["python", "docker", "automation"],
  live: "/notes/step1x-3d-arm64-deployment.html",
  liveLabel: "Read the deployment notes",
  description:
    "Deployed the official StepFun Step1X-3D model in a container on a remote NVIDIA GB10 ARM64 server, generating geometry and textured models from a single image.<br/><br/>My work focused on hardware and dependency compatibility, native extension builds, local model loading, and serving, with actual generation and file downloads used to verify the inference workflow.",
  components: [
    {
      type: "text",
      props: {
        title: "The Problem",
        text: "The official dependencies could not be used unchanged on ARM64 and GB10: some CUDA extensions had no compatible wheels, CuPy did not match the container's CUDA version, and model loading included implicit online downloads. Even after generation succeeded, Gradio's file path restrictions could prevent the page from returning results.",
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/step1x-3d-arm64-deployment/generation-result.webp",
        alt: "Step1X-3D textured and geometry results generated from one image",
        caption: "Textured and geometry models generated from one image; addresses are blurred.",
      },
    },
    {
      type: "list",
      props: {
        title: "My Work",
        size: "lg",
        items: [
          "Preserved the NVIDIA PyTorch container's CUDA 13 baseline, built nvdiffrast, PyTorch3D, and project extensions from source, and resolved CuPy, graphics library, and Python dependency incompatibilities.",
          "Obtained runtime source and complete model weights separately, configuring Step1X, CLIP, DINOv2, SDXL, VAE, BiRefNet, and U2Net to load locally.",
          "Configured Gradio, allowed result file paths, and SSH tunneling; diagnosed page errors, download failures, and local proxy issues, and documented startup and restart recovery.",
        ],
      },
    },
    {
      type: "list",
      props: {
        title: "Results",
        size: "lg",
        items: [
          "Verified PyTorch and CUDA on ARM64/GB10, with all four compiled extensions importing successfully.",
          "Generated geometry and textured GLB files from an input image. The service homepage and Gradio download endpoints for both files returned HTTP 200.",
          "Confirmed that Gradio API endpoints could be listed and published environment setup, compatibility fixes, generation checks, and recovery steps with sensitive addresses and paths sanitized.",
        ],
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        presentation: "screenshot",
        src: "/notes/images/step1x-3d-arm64-deployment/gradio-api.webp",
        alt: "Step1X-3D Gradio API documentation",
        caption: "Python calling example provided by Gradio; addresses and example links are blurred.",
      },
    },
  ],
} as const satisfies ProjectContent;
