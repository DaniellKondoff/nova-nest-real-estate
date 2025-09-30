import React from "react";

export interface PropertyDescriptionProps {
  description: string;
}

export default function PropertyDescription({ description }: PropertyDescriptionProps): React.ReactElement | null {
  if (!description) return null;
  return (
    <section className="py-12">
      <h2 className="text-[#1a2642] font-semibold text-2xl mb-4">Описание</h2>
      <div className="max-w-3xl text-[#2d3748] text-base md:text-lg leading-relaxed whitespace-pre-line">
        {description}
      </div>
    </section>
  );
}


