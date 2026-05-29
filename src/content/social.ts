export const social = [
  { name: "wechat", qr: "/images/wechat-qr.jpg", account: "waitu1232" },
  { url: "mailto:danbao1108@foxmail.com", name: "mail" },
  { url: "https://github.com/dandan1232", name: "github" },
  { url: "https://blog.csdn.net/weixin_45092728?spm=1000.2115.3001.10640", name: "csdn" },
] as const satisfies (
  | { url: string; name: "mail" | "github" | "csdn" | "instagram" | "linkedin" | "x" }
  | { name: "wechat"; qr: string; account: string }
)[];
