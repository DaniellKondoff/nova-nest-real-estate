"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function FooterBackToTopClient() {
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const scrollTickingRef = useRef<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        setShowBackToTop(window.scrollY > 300);
        scrollTickingRef.current = false;
      });
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      aria-label="Върни се в началото"
      className={[
        "fixed z-40",
        "right-5 bottom-5 lg:right-8 lg:bottom-8",
        "rounded-full border border-white/20 shadow-lg",
        "bg-[#d4af37] text-white",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#d4af37]",
        "w-11 h-11 lg:w-12 lg:h-12",
        showBackToTop ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
        "hover:-translate-y-1 hover:shadow-xl active:scale-95 active:opacity-80 active:-translate-y-0.5 active:shadow-md",
      ].join(" ")}
    >
      <ChevronUp className="w-6 h-6 mx-auto" aria-hidden="true" />
    </button>
  );
}
