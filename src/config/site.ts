export const site = {
  name: "Nova Nest",
  url: "https://novanest.bg",
  locale: "bg",
  city: "Стара Загора",
  brand: {
    primary: "#1a2642",
    accent: "#d4af37",
  },
  contact: {
    phone: "+359899897776", // Replace with actual phone number
    phoneDisplay: "+359 899 897 776", // Display format
    email: "novanestrealestatebg@gmail.com",
    address: "Стара Загора, Дом на Строителя ул. Св. Княз Борис 93, ет. 11",
    /** What Google Maps pins/routes to (no floor – it confuses geocoding) */
    mapQuery: "Дом на Строителя, ул. Св. Княз Борис 93, Стара Загора",
    businessHours: {
      weekdays: "9:00 - 18:00",
      saturday: "10:00 - 15:00",
      sunday: "Почивен ден",
    },
  },
  /** Public info pages – link here instead of home-page anchors */
  pages: {
    contact: "/kontakti/",
    about: "/za-nas/",
    /** "Избрани имоти" – device-only saved listings (noindex) */
    saved: "/izbrani/",
  },
  /** Agency manager – shown on property pages and /za-nas/ (public info only) */
  manager: {
    name: "Атанаска Кондова",
    role: "Управител",
    photo: "/images/ceo.jpg",
  },
  /** Data controller details for the privacy policy (GDPR Art. 13) */
  legal: {
    companyName: "НОВА НЕСТ РЕАЛ ЕСТЕЙТ ЕООД",
    eik: "", // ЕИК – shown on the privacy page once filled in
    privacyEmail: "novanestrealestatebg@gmail.com",
    inquiryRetentionMonths: 12,
    privacyPolicyPath: "/politika-za-poveritelnost/",
    privacyPolicyUpdated: "2026-11-05",
  },
} as const;


