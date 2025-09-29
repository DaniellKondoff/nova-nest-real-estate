import React from "react";
import { Inter } from "next/font/google";
import ServiceCard from "@/components/home/ServiceCard";

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

const services: ServiceItem[] = [
  {
    id: "sell",
    icon: "Home",
    title_bg: "Продажба на имоти",
    description_bg:
      "Професионална оценка, маркетинг стратегия и пълно съпровождане на процеса на продажба. Осигуряваме максимална видимост на вашия имот и привличаме сериозни купувачи.",
  },
  {
    id: "buy",
    icon: "Search",
    title_bg: "Покупка на имоти",
    description_bg:
      "Помагаме ви да намерите идеалния имот според вашите нужди и бюджет. Предоставяме детайлна информация за всеки имот и организираме огледи.",
  },
  {
    id: "rent_out",
    icon: "KeyRound",
    title_bg: "Отдаване под наем",
    description_bg:
      "Намираме надежди наематели за вашия имот. Проверяваме референции, подготвяме договори и осигуряваме спокойствие.",
  },
  {
    id: "rent",
    icon: "Building",
    title_bg: "Наемане на имоти",
    description_bg:
      "Богата база данни с имоти под наем в различни квартали на града. Съдействие при преговори и сключване на договор.",
  },
  {
    id: "valuation",
    icon: "ClipboardCheck",
    title_bg: "Оценка на имоти",
    description_bg:
      "Професионална оценка на пазарната стойност на вашия имот от лицензирани оценители.",
  },
  {
    id: "legal",
    icon: "Scale",
    title_bg: "Юридическо съдействие",
    description_bg:
      "Пълна правна поддръжка на сделките - проверка на документи, подготовка на договори, съдействие при нотариални процедури.",
  },
];

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
          {services.map((item) => (
            <ServiceCard
              key={item.id}
              icon={item.icon}
              title_bg={item.title_bg}
              description_bg={item.description_bg}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


