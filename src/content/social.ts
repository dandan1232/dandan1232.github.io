export const social = [
  { url: "mailto:danbao1108@foxmail.com", name: "mail" },
  { url: "https://github.com/dandan1232", name: "github" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
