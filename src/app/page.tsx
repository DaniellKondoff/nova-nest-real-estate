import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";

export const metadata: Metadata = {
  title: "Nova Nest Real Estate - Имоти в Стара Загора",
  description:
    "Професионални услуги за недвижими имоти в Стара Загора. Апартаменти, къщи, офиси за продажба и под наем.",
  keywords: [
    "имоти",
    "Стара Загора",
    "апартаменти",
    "къщи",
    "офиси",
    "продажба",
    "наем",
    "агенция за недвижими имоти",
  ],
  openGraph: {
    title: "Nova Nest Real Estate - Имоти в Стара Загора",
    description:
      "Професионални услуги за недвижими имоти в Стара Загора. Апартаменти, къщи, офиси за продажба и под наем.",
    type: "website",
    locale: "bg_BG",
  },
};

export default function Home(): React.ReactElement {
  return (
    <main>
      {/* 1) Hero Section */}
      <HeroSection />

      {/* 2) About Section */}
      <AboutSection />
      {/* 3) ServicesSection - to be added */}
      {/* 4) PropertyShowcase - to be added */}
      {/* 5) TestimonialsSection - to be added */}
      {/* 6) WhyChooseUsSection - to be added */}
      {/* 7) Contact/CTA Section - to be added */}
    </main>
  );
}
