import * as React from "react";
import { Award, Headphones, MapPin, Smartphone, TrendingUp, Users } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

interface Advantage {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const advantages: Advantage[] = [
  {
    icon: MapPin,
    title: "Местна експертиза",
    description: "Дълбоко познаване на пазара в Стара Загора и всичките й райони",
  },
  {
    icon: Users,
    title: "Личен подход",
    description: "Индивидуално внимание и персонализирани решения за всеки клиент",
  },
  {
    icon: Award,
    title: "Професионален екип",
    description: "Сертифицирани специалисти с богат опит в недвижимите имоти",
  },
  {
    icon: Smartphone,
    title: "Модерни технологии",
    description: "Най-новите инструменти за търсене, оценка и представяне на имоти",
  },
  {
    icon: Headphones,
    title: "Пълна подкрепа",
    description: "Съпровождане през целия процес от първата среща до подписването",
  },
  {
    icon: TrendingUp,
    title: "Доказани резултати",
    description: "Успешно реализирани сделки с максимална стойност за клиентите",
  },
];

/** Why choose us – navy band, server component. */
export default function WhyChooseUsSection(): React.ReactElement {
  return (
    <Section tone="navy" aria-labelledby="why-choose-us-heading" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <SectionHeading
        id="why-choose-us-heading"
        eyebrow="Предимства"
        title="Защо да изберете Nova Nest?"
        description="Не сме просто агенция – ние сме вашите партньори в намирането на перфектния дом."
        inverted
        className="reveal relative"
      />

      <ul className="relative grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6" aria-label="Предимства на Nova Nest">
        {advantages.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="reveal flex gap-4 rounded-card border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-accent/40 hover:bg-white/[0.07] sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-1 leading-relaxed text-white/70">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
