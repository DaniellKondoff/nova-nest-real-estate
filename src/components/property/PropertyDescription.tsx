import React from "react";

export interface PropertyDescriptionProps {
  description: string;
}

export default function PropertyDescription({ description }: PropertyDescriptionProps): React.ReactElement | null {
  if (!description) return null;
  return (
    <section>
      <h2 className="text-[#1a2642] font-bold text-2xl mb-6 flex items-center gap-3">
        <div className="h-1 w-8 bg-[#d4af37] rounded-full"></div>
        Описание на имота
      </h2>
      <div className="prose prose-lg max-w-none text-[#2d3748] leading-relaxed whitespace-pre-line">
        {description}
      </div>
    </section>
  );
}


