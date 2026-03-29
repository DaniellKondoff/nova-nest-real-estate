import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { FAQSchema } from "@/components/seo/StructuredData";
import { SEO_CONFIG } from "@/lib/seo/config";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection, { SERVICES_DATA } from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhyChooseUsSection, { advantages } from "@/components/home/WhyChooseUsSection";
import ContactCTASection from "@/components/home/ContactCTASection";

export const metadata = buildMetadata({
  title: "Имоти в Стара Загора",
  description:
    "Открийте най-добрите имоти в Стара Загора — апартаменти, къщи, офиси за продажба и под наем. Персонализирано обслужване от Nova Nest Real Estate.",
  path: "/",
  keywords: [
    "имоти Стара Загора",
    "апартаменти за продажба Стара Загора",
    "къщи под наем Стара Загора",
    "агенция недвижими имоти Стара Загора",
    "Nova Nest Real Estate",
    "офиси Стара Загора",
    "недвижими имоти Стара Загора",
  ],
});

const offerCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Услуги за недвижими имоти - Nova Nest Real Estate",
  provider: {
    "@id": `${SEO_CONFIG.siteUrl}#organization`,
  },
  itemListElement: SERVICES_DATA.map((service, index) => ({
    "@type": "Offer",
    position: index + 1,
    itemOffered: {
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: {
        "@id": `${SEO_CONFIG.siteUrl}#organization`,
      },
    },
  })),
};

const faqItems = advantages.map((a) => ({
  question: `Защо да изберете Nova Nest — ${a.title}?`,
  answer: a.description,
}));

export default function Home(): React.ReactElement {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema, null, 0) }}
      />
      <FAQSchema faqs={faqItems} />
      <HeroSection id="home" />
      <AboutSection />
      <ServicesSection id="services" />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <ContactCTASection id="contact" />
    </main>
  );
}
