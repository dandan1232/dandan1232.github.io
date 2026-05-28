export const LOCALES = {
  zh: {
    iso: "zh-CN",
    name: "中文",
  },
  en: {
    iso: "en-US",
    name: "English",
  },
} as const satisfies Record<
  string,
  {
    name: string;
    iso: string;
  }
>;

export const LOCALE_DEFAULT: keyof typeof LOCALES = "zh";
