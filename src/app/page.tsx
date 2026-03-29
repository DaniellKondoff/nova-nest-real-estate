import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";
import PropertyShowcase from "@/components/home/PropertyShowcase";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import ContactCTASection from "@/components/home/ContactCTASection";

export const metadata: Metadata = {
  title: "Имоти Стара Загора - Вашето Ново Гнездо | Nova Nest Real Estate",
  description:
    "Открийте най-добрите имоти в Стара Загора. Апартаменти, къщи и офиси за продажба и под наем с професионално обслужване от водещата агенция за недвижими имоти.",
  keywords: [
    "Nova Nest Real Estate",
    "Nova Nest",
    "Nova Nest Real Estate Стара Загора",
    "Nova Nest Real Estate Стара Загора",
    "Nova Nest Стара Загора",
    "Nova Nest Real Estate Стара Загора",
    "Nova Nest Real Estate Стара Загора",
    "Nova Nest Стара Загора",
    "Nova Nest Real Estate Стара Загора",
    "имоти Стара Загора",
    "недвижими имоти Стара Загора",
    "апартаменти Стара Загора",
    "къщи Стара Загора",
    "офиси Стара Загора",
    "продажба имоти",
    "наем имоти",
    "агенция за недвижими имоти",
    "квартали Стара Загора",
    "център Стара Загора",
    "нова нест",
    "нова нест real estate",
    "нова нест Стара Загора",
    ""
  ],
  openGraph: {
    title: "Nova Nest Real Estate - Имоти в Стара Загора",   
    description:
      "Открийте най-добрите имоти в Стара Загора. Апартаменти, къщи и офиси за продажба и под наем с професионално обслужване.",
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
      <WhyChooseUsSection />
      <TestimonialsSection />

      <ContactCTASection id="contact" />
    </main>
  );
}
