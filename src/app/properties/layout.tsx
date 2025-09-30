import type { Metadata } from "next";
import React from "react";
import { appConfig, buildCanonicalUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Имоти в Стара Загора | Nova Nest Real Estate",
  description:
    "Открийте най-добрите имоти за продажба и под наем в Стара Загора. Апартаменти, къщи, офиси и парцели с професионално обслужване.",
  alternates: {
    canonical: buildCanonicalUrl("/properties"),
  },
  keywords: [
    "имоти стара загора",
    "апартаменти стара загора",
    "къщи стара загора",
    "офиси стара загора",
    "имоти под наем стара загора",
    "недвижими имоти стара загора",
    "агенция имоти стара загора",
  ],
  openGraph: {
    title: "Имоти в Стара Загора | Nova Nest Real Estate",
    description:
      "Открийте най-добрите имоти за продажба и под наем в Стара Загора. Апартаменти, къщи, офиси и парцели с професионално обслужване.",
    url: buildCanonicalUrl("/properties"),
    siteName: appConfig.siteName,
    locale: "bg_BG",
    type: "website",
  },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return <>{children}</>;
}


