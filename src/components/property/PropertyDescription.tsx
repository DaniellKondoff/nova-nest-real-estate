import React from "react";
import DetailSection from "./DetailSection";

export interface PropertyDescriptionProps {
  description: string;
}

export default function PropertyDescription({ description }: PropertyDescriptionProps): React.ReactElement | null {
  if (!description) return null;
  return (
    <DetailSection title="Описание на имота" id="description">
      <div className="prose max-w-none whitespace-pre-line text-charcoal sm:prose-lg prose-p:leading-relaxed">
        {description}
      </div>
    </DetailSection>
  );
}
