import type { Metadata } from "next";
import { Clock, MapPin, Navigation } from "lucide-react";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { getStaticPageBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { ORGANIZATION_ID, absoluteUrl } from "@/lib/seo/config";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, containerClass } from "@/components/ui/section";
import ContactCTASection from "@/components/home/ContactCTASection";
import OfficeMap from "@/components/contact/OfficeMap";
import { site } from "@/config/site";

const PATH = site.pages.contact;
const { contact } = site;

export const metadata: Metadata = buildMetadata({
  title: "Контакти – агенция за имоти в Стара Загора",
  description: `Свържете се с Nova Nest: ${contact.phoneDisplay}, Viber или имейл. Офис: ${contact.address}. Пон–Пет ${contact.businessHours.weekdays}, Съб ${contact.businessHours.saturday}.`,
  path: PATH,
});

/** The full RealEstateAgent schema (NAP, hours, geo) lives in the root layout – reference it, don't repeat it */
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: absoluteUrl(PATH),
  name: "Контакти – Nova Nest Real Estate",
  inLanguage: "bg-BG",
  mainEntity: { "@id": ORGANIZATION_ID },
};

const HOURS = [
  { days: "Понеделник – Петък", hours: contact.businessHours.weekdays },
  { days: "Събота", hours: contact.businessHours.saturday },
  { days: "Неделя", hours: contact.businessHours.sunday },
];

export default function ContactPage() {
  const breadcrumbs = getStaticPageBreadcrumbs("Контакти", PATH);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.mapQuery)}`;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />

      <div className={containerClass}>
        <Breadcrumbs items={breadcrumbs} className="min-h-11 py-2" />
      </div>

      <ContactCTASection headingAs="h1" eyebrow="Контакти" title="Свържете се с Nova Nest" />

      <Section aria-labelledby="find-us-heading">
        <SectionHeading
          id="find-us-heading"
          eyebrow="Офис"
          title="Как да ни намерите"
          description="Заповядайте в офиса ни в Стара Загора – за оглед, консултация или подписване на документи. Обадете се предварително, за да ви посрещнем."
        />

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <OfficeMap query={contact.mapQuery} className="lg:col-span-3" />

          <div className="space-y-8 lg:col-span-2">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                <MapPin className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                Адрес
              </h3>
              <address className="mt-2 not-italic leading-relaxed text-charcoal/85">{contact.address}</address>
              <Button asChild variant="secondary" className="mt-4 w-full sm:w-auto">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                  Навигация до офиса
                </a>
              </Button>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                <Clock className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                Работно време
              </h3>
              <dl className="mt-3 divide-y divide-border rounded-card border border-border">
                {HOURS.map(({ days, hours }) => (
                  <div key={days} className="flex min-h-11 items-center justify-between gap-4 px-4 py-2">
                    <dt className="text-charcoal/75">{days}</dt>
                    <dd className="font-semibold tabular-nums text-primary">{hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
