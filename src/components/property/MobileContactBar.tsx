"use client";

import React from "react";
import { Phone, MessageSquare } from "lucide-react";

interface MobileContactBarProps {
  phoneNumber: string;
  phoneDisplay: string;
}

export default function MobileContactBar({ phoneNumber, phoneDisplay }: MobileContactBarProps): React.ReactElement {
  const scrollToContact = () => {
    const el = document.getElementById("contact-sidebar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex gap-3">
      <a
        href={`tel:${phoneNumber}`}
        className="flex-1 flex items-center justify-center gap-2 bg-[#1a2642] hover:bg-[#2a3a5c] text-white font-semibold py-3 rounded-xl transition-colors duration-200"
      >
        <Phone className="h-5 w-5" aria-hidden />
        <span>{phoneDisplay}</span>
      </a>
      <button
        onClick={scrollToContact}
        className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c49d2f] text-white font-semibold py-3 rounded-xl transition-colors duration-200"
      >
        <MessageSquare className="h-5 w-5" aria-hidden />
        <span>Изпратете запитване</span>
      </button>
    </div>
  );
}
