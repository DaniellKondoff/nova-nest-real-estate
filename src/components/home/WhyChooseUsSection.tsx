"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Award, Smartphone, CheckCircle } from "lucide-react";
import { Heading, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/design-tokens";

interface Advantage {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const advantages: Advantage[] = [
  {
    icon: MapPin,
    title: "Местна експертиза",
    description:
      "Дълбоко познаване на пазара в Стара Загора и всички нюанси на местните квартали.",
  },
  {
    icon: Users,
    title: "Персонален подход",
    description:
      "Всеки клиент получава индивидуално внимание и решения, съобразени с неговите специфични нужди.",
  },
  {
    icon: Award,
    title: "Професионален екип",
    description:
      "Сертифицирани специалисти с дългогодишен опит в сферата на недвижимите имоти.",
  },
  {
    icon: Smartphone,
    title: "Модерни технологии",
    description:
      "Използваме най-новите технологии за маркетинг, оценка и управление на имоти.",
  },
  {
    icon: CheckCircle,
    title: "Пълно съпровождане",
    description:
      "От първата консултация до подписване на договора - ние сме с вас на всяка стъпка.",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export interface WhyChooseUsSectionProps extends React.HTMLAttributes<HTMLElement> {}

export default function WhyChooseUsSection({ className, ...rest }: WhyChooseUsSectionProps): React.ReactElement {
  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className={cn(
        // Navy background with subtle gradient to enrich depth
        "w-full bg-[#1a2642] text-white",
        "bg-gradient-to-b from-[#1a2642] to-[#1a2642]/95",
        // Generous vertical spacing
        "py-16 md:py-24",
        className
      )}
      {...rest}
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <Heading
            as="h2"
            id="why-choose-us-heading"
            size="h2"
            weight="semibold"
            color="white"
            className="mb-4"
          >
            Защо да изберете Nova Nest
          </Heading>
          <Text as="p" size="lg" color="white" align="center" className="text-white/80">
            Вашият надежден партньор за недвижими имоти в Стара Загора
          </Text>
        </motion.div>

        <motion.ul
          className="mt-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          aria-label="Предимства на Nova Nest"
        >
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            // For the 2-3 desktop split: span 2 columns for first two items on lg screens
            const desktopSpanClass = index < 2 ? "lg:col-span-1 lg:[&:nth-child(-n+2)]:col-span-1 lg:[&:nth-child(-n+2)]:col-span-1" : "";
            return (
              <motion.li
                key={advantage.title}
                variants={itemVariants}
                className={cn(
                  "group relative rounded-lg border p-6 transition-all duration-200 ease-out",
                  "border-white/20 hover:scale-[1.01] hover:border-[#d4af37]/50",
                  "bg-transparent",
                  desktopSpanClass
                )}
              >
                <Icon className="mb-4 h-10 w-10 text-[#d4af37]" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-white mb-2">{advantage.title}</h3>
                <p className="text-base text-white/90 leading-relaxed">{advantage.description}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}


