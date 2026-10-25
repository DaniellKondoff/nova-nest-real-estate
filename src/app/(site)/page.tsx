import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { ORGANIZATION_ID } from "@/lib/seo/config";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection, { SERVICES_DATA } from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import ContactCTASection from "@/components/home/ContactCTASection";

export const metadata = buildMetadata({
  title: "Недвижими имоти в Стара Загора – продажба и наем",
  description:
    "Агенция за недвижими имоти в Стара Загора. Апартаменти, къщи, офиси и парцели за продажба и под наем – актуални обяви, оценка и пълно съдействие до сделката.",
  path: "/",
});

const offerCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Услуги за недвижими имоти - Nova Nest Real Estate",
  provider: {
    "@id": ORGANIZATION_ID,
  },
  itemListElement: SERVICES_DATA.map((service, index) => ({
    "@type": "Offer",
    position: index + 1,
    itemOffered: {
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: {
        "@id": ORGANIZATION_ID,
      },
    },
  })),
};

export default function Home(): React.ReactElement {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema, null, 0) }}
      />
      <HeroSection id="home" />
      <AboutSection />
      <ServicesSection id="services" />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <ContactCTASection id="contact" />
    </>
  );
}
