import { Inter } from "next/font/google";
import React from "react";
import CompanyValues from "@/components/home/CompanyValues";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export interface AboutSectionProps {
  /** Optional additional class names for the section wrapper */
  className?: string;
  /** Override default paragraphs; falls back to site content */
  paragraphs?: string[];
  /** Optional id to enable anchor navigation */
  id?: string;
}

/**
 * AboutSection – Nova Nest Real Estate
 * Server Component rendering the About content with brand-compliant styling.
 *
 * Accessibility: Uses semantic elements with proper heading hierarchy.
 */
export default function AboutSection(props: AboutSectionProps): React.ReactElement {
  const { className, paragraphs, id } = props;

  // Default content sourced from existing site copy
  const defaultParagraphs: string[] = [
    // src/app/(site)/za-nas/page.tsx
    "Nova Nest — модерна агенция за недвижими имоти в Стара Загора.",
    // src/components/home/HeroSection.tsx
    "Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети",
    // src/app/layout.tsx metadata.description
    "Модерна агенция за недвижими имоти в Стара Загора. Продажби, наеми и консултации.",
  ];

  const allParagraphs = paragraphs?.length ? paragraphs : defaultParagraphs;
  // Show 2–3 introductory paragraphs depending on availability
  const introCount = allParagraphs.length >= 3 ? 3 : Math.min(2, allParagraphs.length);
  const intro = allParagraphs.slice(0, introCount);
  const remaining = allParagraphs.slice(introCount);

  // Fallback content to balance columns if remaining content is insufficient
  const storyFallback: string[] = [
    "Основана в Стара Загора, Nova Nest израсна от малък екип ентусиасти до надежден партньор за десетки клиенти. Нашият път се гради върху доверие, локална експертиза и последователни резултати.",
    "С времето усъвършенствахме процесите си – от първата консултация до финализиране на сделката – за да осигурим яснота, спокойствие и увереност на всеки етап.",
  ];

  const missionFallback: string[] = [
    "Нашата мисия е да помагаме на хората да откриват своето място, като предлагаме прозрачна комуникация, точен пазарен анализ и индивидуални стратегии за покупка, продажба или наем.",
    "Вярваме в дългосрочните отношения – работим с грижа, уважение и внимание към детайла, за да постигнем най-добрия възможен резултат за нашите клиенти.",
  ];

  const half = Math.ceil(remaining.length / 2);
  const story = remaining.length ? remaining.slice(0, half) : storyFallback;
  const mission = remaining.length ? remaining.slice(half) : missionFallback;

  return (
    <section
      id={id}
      aria-labelledby="about-heading"
      className={[
        inter.variable,
        "w-full bg-[#1a2642] py-16 md:py-24 scroll-mt-[80px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h2
            id="about-heading"
            className="text-4xl md:text-5xl font-semibold text-white mb-6"
          >
            Nova Nest Real Estate - Вашият надежден партньор
          </h2>

          <div className="space-y-6">
            {intro.map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed text-white/90">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Нашата история</h3>
              <div className="space-y-4">
                {story.map((paragraph, index) => (
                  <p key={index} className="text-lg leading-relaxed text-white/90">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Нашата мисия</h3>
              <div className="space-y-4">
                {mission.map((paragraph, index) => (
                  <p key={index} className="text-lg leading-relaxed text-white/90">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Company Values grid */}
        <div className="mt-16">
          <CompanyValues />
        </div>
      </div>
    </section>
  );
}


