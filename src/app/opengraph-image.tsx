import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-image";

export const alt = "Nova Nest – недвижими имоти в Стара Загора";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Default social preview for every page without its own image */
export default function Image() {
  return renderOgCard({
    eyebrow: "Агенция за недвижими имоти",
    title: "Апартаменти, къщи и парцели в Стара Загора",
    facts: ["Продажба", "Наем", "Оценка"],
  });
}
