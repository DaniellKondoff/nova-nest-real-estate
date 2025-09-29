import React from "react";
import { Inter } from "next/font/google";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { Banknote, Home, Key, DoorOpen, Scale, Gavel } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export interface ServiceItem {
  id: string;
  icon: string; // Lucide icon name
  title_bg: string;
  description_bg: string;
  link?: string;
}

const ICONS: Record<string, LucideIconType> = {
  Banknote,
  Home,
  Key,
  DoorOpen,
  Scale,
  Gavel,
};

const services: ServiceItem[] = [
  {
    id: "sell",
    icon: "Banknote",
    title_bg: "Продажба на имоти",
    description_bg:
      "Пълна маркетингова стратегия, професионални снимки и прецизно договаряне за най-добра цена.",
  },
  {
    id: "buy",
    icon: "Home",
    title_bg: "Покупка на имоти",
    description_bg:
      "Персонализирано търсене, огледи и експертна оценка, за да изберете правилния дом.",
  },
  {
    id: "rent_out",
    icon: "Key",
    title_bg: "Отдаване под наем",
    description_bg:
      "Подбор на надеждни наематели, изготвяне на договори и управление на целия процес.",
  },
  {
    id: "rent",
    icon: "DoorOpen",
    title_bg: "Наемане на имоти",
    description_bg:
      "Актуални оферти, бърза комуникация и прозрачни условия за спокойно наемане.",
  },
  {
    id: "valuation",
    icon: "Scale",
    title_bg: "Оценка на имоти",
    description_bg:
      "Пазарен анализ и професионална оценка за продажба, наем или финансиране.",
  },
  {
    id: "legal",
    icon: "Gavel",
    title_bg: "Юридическо съдействие",
    description_bg:
      "Пълна правна проверка, подготовка на документация и подкрепа до финализиране на сделката.",
  },
];

function getIconComponent(name: string): LucideIconType {
  return ICONS[name] ?? Home;
}

export default function ServicesSection(): React.ReactElement {
  return (
    <section
      aria-labelledby="services-heading"
      className={[
        inter.variable,
        "w-full bg-[#1a2642] py-16 md:py-24",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            id="services-heading"
            className="text-4xl md:text-5xl font-semibold text-white mb-4"
          >
            Нашите услуги
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-16">
            Професионални решения за всички ваши нужди
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item) => {
            const Icon = getIconComponent(item.icon);
            const titleId = `service-${item.id}-title`;
            return (
              <article
                key={item.id}
                aria-labelledby={titleId}
                className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10 text-white">
                    <Icon aria-hidden className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 id={titleId} className="text-xl font-semibold text-white mb-2">
                      {item.title_bg}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {item.description_bg}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


