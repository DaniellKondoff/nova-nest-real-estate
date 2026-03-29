import * as React from "react";
import { MapPin, Users, Award, Smartphone, Headphones, TrendingUp } from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/design-tokens";
import AboutSectionClient from "@/components/home/AboutSectionClient";
import WhyChooseUsCTAButtons from "@/components/home/WhyChooseUsCTAButtons";

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

export interface WhyChooseUsSectionProps extends React.HTMLAttributes<HTMLElement> {}

export default function WhyChooseUsSection({ className, ...rest }: WhyChooseUsSectionProps): React.ReactElement {
  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className={cn(
        "py-20 bg-gradient-to-br from-gray-100 to-white",
        className
      )}
      {...rest}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <AboutSectionClient delay={0}>
          <div className="text-center mb-16">
            <Heading
              as="h2"
              id="why-choose-us-heading"
              size="h1"
              weight="semibold"
              className="text-4xl md:text-5xl font-bold text-primary mb-6"
              style={{ color: '#1a2642' }}
            >
              Защо да изберете Nova Nest?
            </Heading>
            <Text as="p" size="xl" className="text-xl text-gray-700 max-w-2xl mx-auto">
              Ние не сме просто агенция - ние сме вашите партньори в намирането на перфектния дом
            </Text>
          </div>
        </AboutSectionClient>

        {/* Advantage cards */}
        <AboutSectionClient delay={100}>
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            aria-label="Предимства на Nova Nest"
          >
            {advantages.map((advantage) => {
              const Icon = advantage.icon;
              return (
                <div
                  key={advantage.title}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500 ease-out" />

                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-out">
                      <div style={{ color: '#1a2642' }}>
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-primary mb-1" style={{ color: '#1a2642' }}>{advantage.title}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{advantage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </AboutSectionClient>

        {/* CTA box */}
        <AboutSectionClient delay={200}>
          <div className="mt-16 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-200">
              <h3 className="text-2xl font-bold text-primary mb-4" style={{ color: '#1a2642' }}>
                Готови да започнем заедно?
              </h3>
              <p className="text-gray-700 mb-6 max-w-xl mx-auto">
                Нека ви помогнем да намерите вашето ново гнездо или да продадете сегашния ви имот на най-добра цена
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#1a2642] text-white rounded-lg font-semibold hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
                >
                  Безплатна консултация
                </a>
                <WhyChooseUsCTAButtons />
              </div>
            </div>
          </div>
        </AboutSectionClient>
      </div>
    </section>
  );
}
