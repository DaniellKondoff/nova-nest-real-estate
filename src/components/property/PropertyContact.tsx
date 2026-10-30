import React from "react";
import Image from "next/image";
import { Clock, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { site } from "@/config/site";
import { viberHref } from "@/lib/contact-links";
import PropertyInquiryForm from "./PropertyInquiryForm";

export interface PropertyContactProps {
  propertyId: number;
  propertyTitle: string;
  /** Pre-filled Viber message (e.g. with the listing URL) */
  viberDraft?: string;
}

/**
 * Agent card (server-rendered) + inquiry form (client island).
 * Rendered in the sticky sidebar on xl, inline on smaller screens.
 */
export default function PropertyContact({ propertyId, propertyTitle, viberDraft }: PropertyContactProps): React.ReactElement {
  return (
    <aside aria-labelledby="contact-agent-title" className="rounded-card border border-border bg-white p-5 shadow-card sm:p-6">
      {/* Agent */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src="/images/ceo.jpg"
            alt="Атанаска Кондова – управител на Nova Nest"
            fill
            sizes="64px"
            className="rounded-full object-cover ring-2 ring-accent ring-offset-2"
          />
        </div>
        <div className="min-w-0">
          <p id="contact-agent-title" className="text-lg font-bold text-primary">
            Атанаска Кондова
          </p>
          <p className="text-sm text-charcoal/70">Управител · Nova Nest Real Estate</p>
        </div>
      </div>

      <a
        href={`tel:${site.contact.phone}`}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-light"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        {site.contact.phoneDisplay}
      </a>
      <a
        href={viberHref(viberDraft)}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-viber font-semibold text-white transition-opacity hover:opacity-90"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Пишете ни във Viber
      </a>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-charcoal/75">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        Пон–Пет {site.contact.businessHours.weekdays} · Съб {site.contact.businessHours.saturday}
      </p>

      {/* Inquiry form */}
      <div className="mt-6 border-t border-border pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-primary">
          <MessageSquare className="h-5 w-5 text-accent-dark" aria-hidden="true" />
          Изпратете запитване
        </h2>
        <PropertyInquiryForm propertyId={propertyId} propertyTitle={propertyTitle} />
      </div>
    </aside>
  );
}
