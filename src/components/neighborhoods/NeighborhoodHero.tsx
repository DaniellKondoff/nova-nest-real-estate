import React from "react";
import Link from "next/link";
import { ArrowDown, Building2, Phone } from "lucide-react";
import type { Neighborhood } from "@/lib/queries/neighborhoods";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-schema";
import { containerClass } from "@/components/ui/section";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

interface NeighborhoodHeroProps {
  neighborhood: Neighborhood;
  propertyCount: number;
  breadcrumbs: BreadcrumbItem[];
}

/** Compact navy hero for neighborhood landing pages – server component (plain anchor links). */
export default function NeighborhoodHero({ neighborhood, propertyCount, breadcrumbs }: NeighborhoodHeroProps) {
  const description = neighborhood.description
    ? neighborhood.description.substring(0, 200) + (neighborhood.description.length > 200 ? "…" : "")
    : `Квартал ${neighborhood.name_bg} в Стара Загора предлага разнообразни жилищни възможности.`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      <div className={cn(containerClass, "relative py-8 sm:py-14 lg:py-20")}>
        <Breadcrumbs
          items={breadcrumbs}
          className="mb-6 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-accent [&_span]:text-white"
        />
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {propertyCount === 1 ? "1 активна обява" : `${propertyCount} активни обяви`}
          </p>
          <h1 className="text-display font-bold tracking-tight text-balance">
            Имоти в <span className="text-accent">{neighborhood.name_bg}</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#properties"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light"
            >
              Разгледай обявите
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/25 px-6 font-semibold text-white transition-colors hover:border-accent hover:text-accent"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Консултация
            </a>
          </div>
        </div>
      </div>
      <Link href="/properties/" className="sr-only">
        Всички имоти в Стара Загора
      </Link>
    </section>
  );
}
