import React from "react";
import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-schema";
import { absoluteUrl } from "@/lib/seo/config";
import { getPropertyHref } from "@/components/property/PropertyCard";
import PropertyGrid from "@/components/property/PropertyGrid";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Section, containerClass } from "@/components/ui/section";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export interface LandingLink {
  href: string;
  label: string;
  count?: number;
}

export interface LandingLinkGroup {
  title: string;
  links: LandingLink[];
}

export interface LandingPageProps {
  h1: string;
  /** Lead paragraph – unique, factual text for this page */
  intro: string;
  breadcrumbs: BreadcrumbItem[];
  /** Key figures shown under the intro, e.g. { label: "Средна цена", value: "95 000 €" } */
  facts: Array<{ label: string; value: string }>;
  properties: PropertyWithDetails[];
  total: number;
  /** Filterable /properties/ URL with the same scope (for "see all" and the empty state) */
  allHref: string;
  linkGroups: LandingLinkGroup[];
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * Server-rendered keyword landing page: H1 + unique intro + listings + related searches.
 * Shared by the operation, category and neighborhood/category landing routes.
 */
export default function LandingPage({
  h1,
  intro,
  breadcrumbs,
  facts,
  properties,
  total,
  allHref,
  linkGroups,
  emptyTitle,
  emptyDescription,
}: LandingPageProps): React.ReactElement {
  const groups = linkGroups.filter((g) => g.links.length > 0);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema name={h1} urls={properties.map((p) => absoluteUrl(getPropertyHref(p.property)))} />

      <section className="border-b border-border bg-white">
        <div className={cn(containerClass, "py-6 md:py-10")}>
          <Breadcrumbs items={breadcrumbs} className="mb-3" />
          <h1 className="text-h2 font-bold tracking-tight text-primary text-balance">{h1}</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-charcoal/75">{intro}</p>

          {facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-xl border border-border bg-gray-light px-4 py-3 sm:min-w-40">
                  <dt className="text-xs font-medium text-charcoal/75 sm:text-sm">{fact.label}</dt>
                  <dd className="mt-0.5 text-lg font-bold text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <Section tone="muted" aria-labelledby="landing-listings">
        <h2 id="landing-listings" className="sr-only">
          Обяви
        </h2>
        <PropertyGrid
          properties={properties}
          priorityCount={2}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyAction={{ href: "/#contact", label: "Свържете се с нас" }}
        />
        {total > properties.length && (
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href={allHref}>
                Всички {total} обяви с филтри
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}
      </Section>

      {groups.length > 0 && (
        <Section spacing="tight" aria-label="Свързани търсения">
          <div className="grid gap-8 md:grid-cols-2">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-lg font-bold text-primary">{group.title}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/5"
                      >
                        {link.label}
                        {typeof link.count === "number" && (
                          <span className="rounded-full bg-gray-light px-2 py-0.5 text-xs font-semibold text-charcoal/70">
                            {link.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </Section>
      )}

      <Section tone="navy" spacing="tight">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-h3 font-bold sm:text-3xl">Не намирате точния имот?</h2>
            <p className="mt-2 max-w-xl text-white/75">
              Кажете ни какво търсите – ще ви изпратим подходящи оферти, включително такива, които още не са публикувани.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={`tel:${site.contact.phone}`}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                Обадете се
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="w-full sm:w-auto">
              <Link href="/#contact">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Изпратете запитване
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
