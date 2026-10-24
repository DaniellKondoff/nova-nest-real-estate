import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { containerClass } from "@/components/ui/section";
import { getLandingData } from "@/lib/queries/landing-data";
import { countByNeighborhood } from "@/lib/queries/listing-index";
import { OPERATION_LANDINGS, filterListings, neighborhoodPath, operationCategoryPath, operationPath } from "@/lib/seo/landing";
import { cn } from "@/lib/utils";
import FooterBackToTopClient from "./FooterBackToTopClient";

interface FooterLink {
  label: string;
  href: string;
}

const QUICK_LINKS: FooterLink[] = [
  { label: "Начало", href: "/" },
  { label: "Всички имоти", href: "/properties/" },
  { label: "За нас", href: "/#about" },
  { label: "Услуги", href: "/#services" },
  { label: "Контакти", href: "/#contact" },
];

/**
 * Site-wide internal links to the keyword landing pages and the busiest neighborhoods.
 * Only pages that currently have listings are linked (empty ones are 404/noindex).
 */
async function getSeoLinks(): Promise<{ searches: FooterLink[]; neighborhoods: FooterLink[] }> {
  try {
    const { categories, neighborhoods, listings } = await getLandingData();
    const searches: FooterLink[] = [];
    for (const operation of ["sale", "rent"] as const) {
      if (filterListings(listings, { operationType: operation }).length === 0) continue;
      searches.push({ label: `${OPERATION_LANDINGS[operation].title}`, href: operationPath(operation) });
      for (const c of categories) {
        if (filterListings(listings, { operationType: operation, categoryId: c.id }).length > 0) {
          searches.push({ label: `${c.plural} ${OPERATION_LANDINGS[operation].label}`, href: operationCategoryPath(operation, c) });
        }
      }
    }
    const counts = countByNeighborhood(listings);
    const topNeighborhoods = neighborhoods
      .filter((n) => (counts.get(n.id) ?? 0) > 0)
      .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
      .slice(0, 8)
      .map((n) => ({ label: `Имоти в ${n.name_bg}`, href: neighborhoodPath(n) }));
    return { searches: searches.slice(0, 8), neighborhoods: topNeighborhoods };
  } catch {
    return { searches: [], neighborhoods: [] };
  }
}

function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent md:mb-4">{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center text-[15px] text-white/75 transition-colors hover:text-accent md:min-h-9"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Footer – Nova Nest Real Estate (server component)
 * - Brand + contact block, quick links and neighborhood links (internal links for SEO)
 * - Mobile-first: two compact link columns side by side; contact rows are large tap targets
 */
export default async function Footer() {
  const { searches, neighborhoods: neighborhoodLinks } = await getSeoLinks();
  const currentYear = new Date().getFullYear();

  const contactRows = [
    { icon: Phone, label: site.contact.phoneDisplay, href: `tel:${site.contact.phone}` },
    { icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: MapPin, label: site.contact.address, href: undefined },
  ];

  return (
    <footer className="bg-primary text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Информация за Nova Nest</h2>

      {/* Gold hairline */}
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className={cn(containerClass, "pt-12 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pt-16")}>
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-5">
            <p className="text-2xl font-bold tracking-tight">
              Nova Nest <span className="text-accent">Real Estate</span>
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/75">
              Професионални услуги в областта на недвижимите имоти в {site.city}. Вашият доверен партньор за
              намиране на перфектното гнездо.
            </p>

            <ul className="mt-6 space-y-1">
              {contactRows.map(({ icon: Icon, label, href }) => {
                const content = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] text-white/85">{label}</span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="-mx-2 flex min-h-12 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-white/5 hover:text-accent"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="-mx-2 flex min-h-12 items-center gap-3 px-2">{content}</div>
                    )}
                  </li>
                );
              })}
              <li className="-mx-2 flex min-h-12 items-center gap-3 px-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <Clock className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                </span>
                <span className="text-[15px] text-white/85">
                  Пон–Пет {site.contact.businessHours.weekdays} · Съб {site.contact.businessHours.saturday}
                </span>
              </li>
            </ul>
          </div>

          {/* Link columns: side by side even on mobile (short lists, big tap targets) */}
          <div className="grid grid-cols-2 gap-6 lg:col-span-7 lg:col-start-6 lg:grid-cols-3">
            <FooterLinkColumn title="Бързи връзки" links={QUICK_LINKS} />
            {searches.length > 0 && <FooterLinkColumn title="Популярни търсения" links={searches} />}
            {neighborhoodLinks.length > 0 && <FooterLinkColumn title="Квартали" links={neighborhoodLinks} />}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Nova Nest Real Estate. Всички права запазени.</p>
          <p>Недвижими имоти в {site.city}</p>
        </div>
      </div>

      <FooterBackToTopClient />
    </footer>
  );
}
