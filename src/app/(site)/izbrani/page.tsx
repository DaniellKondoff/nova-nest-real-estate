import type { Metadata } from "next";
import { Smartphone } from "lucide-react";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import SavedListingsClient from "./SavedListingsClient";

// Personal, device-only list: never indexed and not in the sitemap
export const metadata: Metadata = buildMetadata({
  title: "Избрани имоти",
  description: "Запазените от вас имоти в Стара Загора – сравнете ги по цена, площ, стаи и етаж.",
  path: site.pages.saved,
  noIndex: true,
});

/** Static shell; the list itself comes from localStorage + the renderSavedListings server action */
export default function SavedListingsPage() {
  return (
    <Section tone="muted" spacing="none" className="min-h-[70svh] py-6 md:py-12" aria-labelledby="saved-title">
      <header className="mb-6 md:mb-8">
        <h1 id="saved-title" className="text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] font-bold leading-tight text-primary">
          Избрани имоти
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/70">
          <Smartphone className="h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true" />
          Списъкът се пази само на това устройство – без регистрация.
        </p>
      </header>
      <SavedListingsClient />
    </Section>
  );
}
