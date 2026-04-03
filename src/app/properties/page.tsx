import { Suspense } from "react";
import type { Metadata } from "next";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import BeautifulLoader from "@/magic/components/BeautifulLoader";
import PropertiesPageContent from "./PropertiesPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Имоти в Стара Загора",
  description:
    "Разгледайте актуални оферти за продажба и наем на имоти в Стара Загора. Апартаменти, къщи, офиси и търговски площи.",
  path: "/properties/",
  keywords: [
    "имоти Стара Загора",
    "продажба имоти Стара Загора",
    "наем имоти Стара Загора",
    "апартаменти за продажба",
    "къщи под наем",
    "агенция недвижими имоти",
  ],
});

export default function PropertiesPage() {
  return (
    <Suspense fallback={<BeautifulLoader fullscreen label="Зареждане на имоти..." />}>
      <PropertiesPageContent />
    </Suspense>
  );
}
