"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Phone, RotateCcw } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { viberHref } from "@/lib/contact-links";

/** Public-site error boundary (e.g. the database is slow or down): retry, or reach us directly. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section aria-labelledby="error-title" className="text-center">
      <h1 id="error-title" className="text-h2 font-bold text-primary">
        Нещо се обърка
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-charcoal/75">
        Страницата не можа да се зареди. Опитайте отново след малко или се свържете с нас директно –
        ще ви помогнем да намерите имота, който търсите.
      </p>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Опитайте отново
        </Button>
        <Button asChild size="lg" variant="secondary">
          <a href={`tel:${site.contact.phone}`}>
            <Phone className="h-5 w-5" aria-hidden="true" />
            {site.contact.phoneDisplay}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={viberHref()}>
            <MessageCircle className="h-5 w-5 text-viber" aria-hidden="true" />
            Viber
          </a>
        </Button>
      </div>

      <p className="mt-6">
        <Link href="/" className="font-semibold text-primary underline decoration-accent underline-offset-4">
          Към началната страница
        </Link>
      </p>
    </Section>
  );
}
