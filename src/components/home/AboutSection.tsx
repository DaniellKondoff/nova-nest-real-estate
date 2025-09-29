import { Inter } from "next/font/google";
import React from "react";

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
}

/**
 * AboutSection – Nova Nest Real Estate
 * Server Component rendering the About content with brand-compliant styling.
 *
 * Accessibility: Uses semantic elements with proper heading hierarchy.
 */
export default function AboutSection(props: AboutSectionProps): React.ReactElement {
  const { className, paragraphs } = props;

  // Default content sourced from existing site copy
  const defaultParagraphs: string[] = [
    // src/app/(site)/za-nas/page.tsx
    "Nova Nest — модерна агенция за недвижими имоти в Стара Загора.",
    // src/components/home/HeroSection.tsx
    "Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети",
    // src/app/layout.tsx metadata.description
    "Модерна агенция за недвижими имоти в Стара Загора. Продажби, наеми и консултации.",
  ];

  const content = (paragraphs?.length ? paragraphs : defaultParagraphs).slice(0, 3);

  return (
    <section
      aria-labelledby="about-heading"
      className={[
        inter.variable,
        "w-full bg-[#1a2642] py-16 md:py-24",
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
            {content.map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed text-white/90">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


