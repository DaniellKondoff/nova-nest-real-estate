import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";
import PropertyShowcase from "@/components/home/PropertyShowcase";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import ContactCTASection from "@/components/home/ContactCTASection";

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
      <HeroSection id="home" />
      <AboutSection />
      <ServicesSection id="services" />
      <PropertyShowcase />
      <TestimonialsSection />
      <WhyChooseUsSection />
      <ContactCTASection id="contact" />
    </main>
  );
}
