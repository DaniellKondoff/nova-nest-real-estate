import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { getStaticPageBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { ORGANIZATION_ID, absoluteUrl } from "@/lib/seo/config";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, containerClass } from "@/components/ui/section";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import { site } from "@/config/site";
import { viberHref } from "@/lib/contact-links";

const PATH = site.pages.about;
const { manager } = site;

export const metadata: Metadata = buildMetadata({
  title: "За нас – агенция за недвижими имоти в Стара Загора",
  description: `Nova Nest е агенция за недвижими имоти в ${site.city} с личен подход към всеки клиент. Запознайте се с екипа, ценностите и услугите ни.`,
  path: PATH,
});

/** Organization details come from the root-layout RealEstateAgent schema; only public manager info here */
const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      url: absoluteUrl(PATH),
      name: "За нас – Nova Nest Real Estate",
      inLanguage: "bg-BG",
      mainEntity: { "@id": ORGANIZATION_ID },
    },
    {
      "@type": "Person",
      name: manager.name,
      jobTitle: manager.role,
      image: absoluteUrl(manager.photo),
      worksFor: { "@id": ORGANIZATION_ID },
    },
  ],
};

export default function AboutPage() {
  const breadcrumbs = getStaticPageBreadcrumbs("За нас", PATH);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />

      <div className={containerClass}>
        <Breadcrumbs items={breadcrumbs} className="min-h-11 py-2" />
      </div>

      <AboutSection headingAs="h1" contactHref={site.pages.contact} />

      {/* Manager */}
      <Section aria-labelledby="team-heading" spacing="tight">
        <SectionHeading id="team-heading" eyebrow="Екип" title="Хората зад Nova Nest" />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-card border border-border bg-white p-6 text-center shadow-card sm:flex-row sm:p-8 sm:text-left">
          <div className="relative h-40 w-40 shrink-0 sm:h-48 sm:w-48">
            <Image
              src={manager.photo}
              alt={`${manager.name} – ${manager.role.toLowerCase()} на Nova Nest`}
              fill
              sizes="(min-width: 640px) 192px, 160px"
              className="rounded-full object-cover object-top ring-2 ring-accent ring-offset-4"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-primary">{manager.name}</h3>
            <p className="mt-1 text-charcoal/75">{manager.role} · Nova Nest Real Estate</p>
            <p className="mt-4 leading-relaxed text-charcoal/85">
              Свържете се директно с управителя на агенцията – по телефон или във Viber.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <a href={`tel:${site.contact.phone}`}>
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Обадете се
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={viberHref()}>
                  <MessageCircle className="h-5 w-5 text-viber" aria-hidden="true" />
                  Пишете във Viber
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-charcoal/75">
              Или{" "}
              <Link href={site.pages.contact} className="font-medium text-primary underline decoration-accent underline-offset-4">
                изпратете запитване
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <WhyChooseUsSection />
      <ServicesSection contactHref={site.pages.contact} />
    </>
  );
}
