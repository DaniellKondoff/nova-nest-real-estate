import Link from "next/link";
import { Home, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundContentProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

/** Shared 404 body used by the root and per-route not-found pages. */
export default function NotFoundContent({
  title = "Страницата не е намерена",
  description = "Страницата, която търсите, не съществува или е преместена.",
  icon: Icon = Home,
}: NotFoundContentProps) {
  return (
    <section className="flex min-h-[60svh] items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/30">
          <Icon className="h-8 w-8 text-accent-dark" aria-hidden="true" />
        </div>
        <h1 className="text-h2 font-bold text-primary">{title}</h1>
        <p className="mt-3 text-charcoal/75">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/properties/">Разгледайте имотите</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Начална страница</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
