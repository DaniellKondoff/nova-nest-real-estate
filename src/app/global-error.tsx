"use client";

import { useEffect } from "react";
import { site } from "@/config/site";
import "@/styles/globals.css";

/** Last-resort boundary when the root layout itself fails – renders its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="bg">
      <body className="flex min-h-svh items-center justify-center bg-white p-6 text-center font-sans">
        <main>
          <h1 className="text-2xl font-bold text-primary">Нещо се обърка</h1>
          <p className="mt-3 text-charcoal/75">Сайтът временно не може да се зареди. Опитайте отново или ни се обадете.</p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center rounded-xl bg-accent px-6 font-semibold text-primary"
            >
              Опитайте отново
            </button>
            <a href={`tel:${site.contact.phone}`} className="inline-flex min-h-11 items-center font-semibold text-primary underline">
              {site.contact.phoneDisplay}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
