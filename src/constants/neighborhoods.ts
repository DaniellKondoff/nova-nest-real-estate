export interface Neighborhood {
  id: string;
  name: string;
  name_bg: string;
  slug: string;
  description: string;
  description_bg: string;
  coordinates: { lat: number; lng: number };
  characteristics: string[];
  amenities: string[];
  transport_links: string[];
  avg_price_range: { min: number; max: number; currency: "BGN" };
}

export const STARA_ZAGORA_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: "nbh-center",
    name: "Center",
    name_bg: "Център",
    slug: "centar",
    description: "Central location with historical buildings, shopping, and business district.",
    description_bg: "Централна локация с исторически сгради, магазини и бизнес зона.",
    coordinates: { lat: 42.4258, lng: 25.6345 },
    characteristics: ["central", "historical", "vibrant"],
    amenities: ["shopping", "restaurants", "banks", "cultural venues"],
    transport_links: ["bus hub", "railway access", "main boulevards"],
    avg_price_range: { min: 1800, max: 2800, currency: "BGN" },
  },
  {
    id: "nbh-samara",
    name: "Samara",
    name_bg: "Самара",
    slug: "samara",
    description: "Residential area with parks and schools, family-friendly.",
    description_bg: "Жилищен квартал с паркове и училища, подходящ за семейства.",
    coordinates: { lat: 42.4332, lng: 25.6042 },
    characteristics: ["residential", "green", "family-friendly"],
    amenities: ["parks", "schools", "supermarkets"],
    transport_links: ["bus lines", "easy boulevard access"],
    avg_price_range: { min: 1200, max: 2000, currency: "BGN" },
  },
  {
    id: "nbh-zheleznik",
    name: "Zheleznik",
    name_bg: "Железник",
    slug: "zheleznik",
    description: "Industrial-influenced area with lower prices and developing infrastructure.",
    description_bg: "Индустриален район с по-ниски цени и развиваща се инфраструктура.",
    coordinates: { lat: 42.4035, lng: 25.6032 },
    characteristics: ["developing", "affordable", "spacious"],
    amenities: ["local shops", "workshops"],
    transport_links: ["bus lines", "ring road"],
    avg_price_range: { min: 900, max: 1600, currency: "BGN" },
  },
  {
    id: "nbh-tri-chuchura",
    name: "Tri Chuchura",
    name_bg: "Три чучура",
    slug: "tri-chuchura",
    description: "Suburban area with newer constructions and quieter streets.",
    description_bg: "Квартал с по-нова застрояване и по-тихи улици.",
    coordinates: { lat: 42.4251, lng: 25.653 },
    characteristics: ["suburban", "newer buildings", "quiet"],
    amenities: ["playgrounds", "small malls", "parking"],
    transport_links: ["bus lines", "quick access to center"],
    avg_price_range: { min: 1100, max: 1900, currency: "BGN" },
  },
  {
    id: "nbh-kazanski",
    name: "Kazanski",
    name_bg: "Казански",
    slug: "kazanski",
    description: "Mixed residential/commercial area with good transport.",
    description_bg: "Смесен жилищно-търговски район с добър транспорт.",
    coordinates: { lat: 42.4148, lng: 25.6388 },
    characteristics: ["mixed-use", "convenient", "active"],
    amenities: ["markets", "cafes", "services"],
    transport_links: ["major bus lines", "boulevard network"],
    avg_price_range: { min: 1200, max: 2100, currency: "BGN" },
  },
  {
    id: "nbh-industrial-north",
    name: "Industrial North",
    name_bg: "Индустриален север",
    slug: "industrial-north",
    description: "Commercial zone with warehouses and light industry.",
    description_bg: "Търговска зона със складове и лека промишленост.",
    coordinates: { lat: 42.4555, lng: 25.6265 },
    characteristics: ["commercial", "logistics", "warehouses"],
    amenities: ["wholesale", "fuel stations"],
    transport_links: ["E85", "ring road", "truck access"],
    avg_price_range: { min: 700, max: 1400, currency: "BGN" },
  },
  {
    id: "nbh-industrial-south",
    name: "Industrial South",
    name_bg: "Индустриален юг",
    slug: "industrial-south",
    description: "Factories and logistics with larger plots.",
    description_bg: "Фабрики и логистика с по-големи площи.",
    coordinates: { lat: 42.3955, lng: 25.6338 },
    characteristics: ["industrial", "logistics", "developing"],
    amenities: ["logistics centers", "service stations"],
    transport_links: ["access to Trakia", "ring road"],
    avg_price_range: { min: 650, max: 1300, currency: "BGN" },
  },
  {
    id: "nbh-operata",
    name: "Operata",
    name_bg: "Операта",
    slug: "operata",
    description: "Cultural district near the opera house, prestigious and central.",
    description_bg: "Културен район до операта, престижен и централен.",
    coordinates: { lat: 42.4259, lng: 25.6295 },
    characteristics: ["prestigious", "cultural", "central"],
    amenities: ["opera house", "galleries", "fine dining"],
    transport_links: ["walkable center", "bus lines"],
    avg_price_range: { min: 1900, max: 3000, currency: "BGN" },
  },
];

export function getNeighborhoodBySlug(slug: string): Neighborhood | undefined {
  return STARA_ZAGORA_NEIGHBORHOODS.find((n) => n.slug === slug);
}

export function getNeighborhoodById(id: string): Neighborhood | undefined {
  return STARA_ZAGORA_NEIGHBORHOODS.find((n) => n.id === id);
}

export function getAllNeighborhoodSlugs(): string[] {
  return STARA_ZAGORA_NEIGHBORHOODS.map((n) => n.slug);
}


