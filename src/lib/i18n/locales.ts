export const locales = ["bg"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bg";

export const t = (key: string, locale: Locale = defaultLocale): string => {
  const dict: Record<string, Record<string, string>> = {
    bg: {
      explore_listings: "Разгледай имоти",
      contact_us: "Свържи се с нас",
    },
  };
  return dict[locale]?.[key] ?? key;
};


