"use client";

import { useEffect, useRef } from "react";

/**
 * Toggles `data-scrolled` on the containing <header> so the RSC header can style
 * its scrolled state with `data-scrolled:` variants (solid background + shadow).
 */
export default function HeaderScrollClient() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = ref.current?.closest("header");
    if (!header) return;
    const handleScroll = () => header.toggleAttribute("data-scrolled", window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <span ref={ref} hidden />;
}
