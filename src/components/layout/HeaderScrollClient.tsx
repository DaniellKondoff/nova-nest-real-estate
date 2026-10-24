"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Adds a scroll-based box-shadow to the containing <header> element.
 * Renders an absolutely-positioned overlay so the RSC <header> stays server-rendered.
 */
export default function HeaderScrollClient() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-shadow duration-300",
        isScrolled ? "shadow-[0_8px_24px_rgba(0,0,0,0.25)]" : "shadow-none"
      )}
    />
  );
}
