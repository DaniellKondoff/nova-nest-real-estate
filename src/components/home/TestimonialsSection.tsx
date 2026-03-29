import * as React from "react";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/typography";
import { getApprovedTestimonialsStatic } from "@/lib/queries/testimonials";
import { TestimonialsCarousel, type TestimonialData } from "./TestimonialsCarousel";

interface TestimonialsSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  heading?: string;
  subheading?: string;
  autoplay?: boolean;
  className?: string;
}

export async function TestimonialsSection({
  heading = "Какво казват нашите клиенти",
  subheading = "Доверени от стотици доволни собственици и инвеститори",
  autoplay = true,
  className,
  ...rest
}: TestimonialsSectionProps) {
  const raw = await getApprovedTestimonialsStatic();

  const testimonials: TestimonialData[] = raw.slice(0, 12).map(t => ({
    id: t.id.toString(),
    name: t.client_name,
    role: "Клиент",
    rating: t.rating,
    quote: t.comment_text,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.client_name)}&background=1a2642&color=ffffff&size=150`,
    propertyType: "Недвижим имот",
  }));

  return (
    <Section
      tone="white"
      className={cn("w-full py-16 md:py-24 px-4 bg-gradient-to-br from-slate-50 to-gray-100", className)}
      aria-label="Testimonials section"
      {...rest}
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#1a2642]/10 border border-[#d4af37]/20">
            <Star className="h-4 w-4 fill-[#d4af37] text-[#d4af37]" />
            <span className="text-sm font-medium text-[#1a2642]">Клиентски отзиви</span>
          </div>
          <Heading as="h2" size="h2" weight="semibold" color="primary" className="tracking-wide mb-4">
            {heading}
          </Heading>
          <Text as="p" size="lg" color="gray" className="text-lg text-muted-foreground text-center">
            {subheading}
          </Text>
        </div>

        {testimonials.length === 0 ? (
          <div className="mt-4 rounded-md border p-6 text-center border-black/10 text-charcoal/70">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <p>Все още няма добавени отзиви.</p>
          </div>
        ) : (
          <TestimonialsCarousel testimonials={testimonials} autoplay={autoplay} />
        )}
      </div>
    </Section>
  );
}

export default TestimonialsSection;
