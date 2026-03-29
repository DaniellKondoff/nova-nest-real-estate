'use client';

import { ArrowRight } from 'lucide-react';

export function HeroScrollButton() {
  const handleClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
      aria-label="Свържи се с нас"
    >
      <span>Свържи се с нас</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
