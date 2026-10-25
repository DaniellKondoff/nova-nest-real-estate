import React from "react";
import { ChevronDown } from "lucide-react";
import DetailSection from "./DetailSection";

export interface PropertyDescriptionProps {
  description: string;
  /** Admin headline – a first paragraph that only repeats it is dropped */
  title?: string;
}

/** Longer texts are clamped behind a "show more" toggle */
const CLAMP_AFTER_CHARS = 700;

const normalize = (s: string) => s.toLocaleLowerCase("bg").replace(/[^\p{L}\p{N}]+/gu, "");

function toParagraphs(description: string, title?: string): string[] {
  const text = description.replace(/\r\n?/g, "\n").trim();
  // Blank lines separate paragraphs; texts without them are split per line
  const blocks = /\n\s*\n/.test(text) ? text.split(/\n\s*\n/) : text.split("\n");
  const paragraphs = blocks.map((b) => b.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
  if (title && paragraphs.length > 1 && normalize(paragraphs[0]) === normalize(title)) paragraphs.shift();
  return paragraphs;
}

/**
 * Description – server component. The full text is always in the HTML (indexed);
 * long texts are visually clamped with a CSS-only checkbox toggle, so it works without JS.
 */
export default function PropertyDescription({ description, title }: PropertyDescriptionProps): React.ReactElement | null {
  const paragraphs = toParagraphs(description ?? "", title);
  if (paragraphs.length === 0) return null;

  const clamp = paragraphs.join(" ").length > CLAMP_AFTER_CHARS;
  const body = (
    <div className="space-y-4 text-base leading-relaxed text-charcoal sm:text-lg">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-line break-words">
          {para}
        </p>
      ))}
    </div>
  );

  return (
    <DetailSection title="Описание на имота" id="description">
      {clamp ? (
        <div>
          <input type="checkbox" id="description-toggle" className="peer sr-only" />
          <div className="relative max-h-80 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)] peer-checked:max-h-none peer-checked:[mask-image:none]">
            {body}
          </div>
          <label
            htmlFor="description-toggle"
            className="mt-3 inline-flex min-h-11 cursor-pointer select-none items-center gap-1.5 rounded-lg font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 peer-checked:hidden peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
          >
            Покажи цялото описание
            <ChevronDown className="h-4 w-4" aria-hidden />
          </label>
          <label
            htmlFor="description-toggle"
            className="mt-3 hidden min-h-11 cursor-pointer select-none items-center gap-1.5 rounded-lg font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 peer-checked:inline-flex peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
          >
            Скрий описанието
            <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
          </label>
        </div>
      ) : (
        body
      )}
    </DetailSection>
  );
}
