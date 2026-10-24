import React from "react";
import { cn } from "@/lib/utils";

/** White content card with the shared "gold bar + navy title" heading used on the property page. */
export default function DetailSection({
  title,
  id,
  children,
  className,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn("rounded-card border border-border bg-white p-5 shadow-card sm:p-8", className)}
    >
      <h2
        id={id ? `${id}-title` : undefined}
        className="mb-5 flex items-center gap-3 text-xl font-bold text-primary sm:mb-6 sm:text-2xl"
      >
        <span aria-hidden="true" className="h-1 w-8 rounded-full bg-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}
