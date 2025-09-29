import React from "react";
import type { LucideIcon as LucideIconType } from "lucide-react";
import { Home, Search, KeyRound, Building, ClipboardCheck, Scale } from "lucide-react";

export interface ServiceCardProps {
  icon: string;
  title_bg: string;
  description_bg: string;
  href?: string;
}

const ICON_MAP: Record<string, LucideIconType> = {
  Home,
  Search,
  KeyRound,
  Building,
  ClipboardCheck,
  Scale,
};

function getIcon(name: string): LucideIconType {
  return ICON_MAP[name] ?? Home;
}

export default function ServiceCard(props: ServiceCardProps): React.ReactElement {
  const { icon, title_bg, description_bg } = props;
  const Icon = getIcon(icon);
  const titleId = React.useId();

  return (
    <article
      aria-labelledby={titleId}
      className="h-full rounded-xl border-2 border-white/20 bg-transparent p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:bg-white/5 transform"
    >
      <div className="mb-6">
        <Icon aria-hidden className="h-14 w-14 text-[#d4af37]" />
      </div>

      <h3 id={titleId} className="mb-4 text-2xl font-semibold text-white">
        {title_bg}
      </h3>
      <p className="text-base leading-relaxed text-white/80">
        {description_bg}
      </p>
    </article>
  );
}


