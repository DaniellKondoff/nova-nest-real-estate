/**
 * HeroSection – server component.
 *
 * Mobile-first: headline, one-line lead and the quick-search card fit above the fold on a phone.
 * Desktop: two columns (copy left, search card right). The search form is a native GET form,
 * so the whole hero ships zero client JS.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, ShieldCheck } from "lucide-react";
import HeroSearchForm from "@/components/forms/HeroSearchForm";
import { getCachedPropertyCategories } from "@/lib/queries/categories";
import { getCachedNeighborhoods } from "@/lib/queries/neighborhoods";
import { getListingStats } from "@/lib/queries/listing-index";
import { containerClass } from "@/components/ui/section";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  id?: string;
}

export default async function HeroSection({ id }: HeroSectionProps): Promise<React.ReactElement> {
  const [categories, neighborhoods, stats] = await Promise.all([
    getCachedPropertyCategories().catch(() => []),
    getCachedNeighborhoods().catch(() => []),
    getListingStats(),
  ]);

  // Live, verifiable numbers only (no marketing percentages)
  const STATS = [
    { value: String(stats.total), label: stats.total === 1 ? "активна обява" : "активни обяви" },
    { value: String(stats.neighborhoods), label: stats.neighborhoods === 1 ? "квартал" : "квартала и села" },
    { value: "Пон–Съб", label: "на ваше разположение" },
  ];

  return (
    <section
      id={id}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-primary lg:min-h-[calc(100svh-var(--header-h))]"
    >
      {/* Background */}
      <Image
        src="/images/hero-building.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/95 lg:bg-gradient-to-r lg:from-primary/95 lg:via-primary/80 lg:to-primary/60" />

      <div className={cn(containerClass, "grid items-center gap-8 py-8 sm:py-14 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20")}>
        {/* Copy */}
        <div className="text-center animate-hero-fade-in lg:text-left">
          {/* The keyword line is part of the H1 so the heading says what the page is about */}
          <h1 id="hero-title" className="text-display font-bold tracking-tight text-white text-balance">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-normal text-white/85 backdrop-blur sm:text-sm">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              Агенция за недвижими имоти · {site.city}
            </span>
            <span className="block">
              Открийте своето <span className="text-accent">ново гнездо</span> в Стара Загора
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0 lg:text-xl">
            Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети.
          </p>

          {/* Desktop CTAs (on mobile the search card is the primary action) */}
          <div className="mt-8 hidden gap-3 lg:flex">
            <Link
              href="/properties/"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-primary transition-colors hover:bg-accent"
            >
              Всички имоти
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/25 px-6 font-semibold text-white transition-colors hover:border-accent hover:text-accent"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>
          </div>

          {stats.total > 0 && (
            <dl className="mt-10 hidden max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6 lg:grid">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-sm text-white/70">{s.label}</dt>
                  <dd className="order-first text-2xl font-bold text-accent">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Search */}
        <div className="animate-hero-fade-in-delayed lg:justify-self-end">
          <HeroSearchForm
            categories={categories.map(({ id, name_bg }) => ({ id, name_bg }))}
            neighborhoods={neighborhoods.map(({ id, name_bg }) => ({ id, name_bg }))}
            className="mx-auto w-full max-w-md lg:max-w-lg"
          />

          {/* Mobile: secondary actions + trust line under the search */}
          <div className="mx-auto mt-5 flex max-w-md items-center justify-between gap-3 text-sm text-white/80 lg:hidden">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              Персонален консултант
            </span>
            <Link href="/properties/" className="inline-flex min-h-11 items-center gap-1 font-semibold text-white">
              Всички имоти
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
