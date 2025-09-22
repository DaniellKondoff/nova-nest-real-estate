/**
 * Core property types for Nova Nest Real Estate (Stara Zagora, Bulgaria).
 * These enums and interfaces capture the most common property attributes
 * used on the Bulgarian market, including local specifics like heating types
 * and building features frequently referenced in listings.
 */

/**
 * Supported listing currencies in Bulgaria.
 * BGN is common for rentals; EUR is widely used for sales.
 */
export type Currency = "BGN" | "EUR";

/**
 * Primary categorization of properties seen in Bulgarian listings.
 */
export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  OFFICE = "OFFICE",
  GARAGE = "GARAGE",
  PLOT = "PLOT",
  COMMERCIAL = "COMMERCIAL",
}

/**
 * Market status commonly used by Bulgarian agencies.
 */
export enum PropertyStatus {
  SALE = "SALE",
  RENT = "RENT",
  SOLD = "SOLD",
  RENTED = "RENTED",
  RESERVED = "RESERVED",
}

/**
 * Condition descriptors reflecting Bulgarian market terminology.
 */
export enum PropertyCondition {
  NEW = "NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  NEEDS_RENOVATION = "NEEDS_RENOVATION",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
}

/**
 * Typical heating systems referenced in Bulgarian listings (e.g., TЕЦ for central).
 */
export enum HeatingType {
  CENTRAL = "CENTRAL", // Central heating (TЕЦ)
  INDIVIDUAL_GAS = "INDIVIDUAL_GAS",
  ELECTRIC = "ELECTRIC",
  SOLID_FUEL = "SOLID_FUEL",
  NONE = "NONE",
}

/**
 * Minimal set of fields present on every property record.
 */
export interface PropertyBase {
  /** Unique identifier (UUID or database id as string). */
  id: string;
  /** Listing title shown on cards and detail pages. */
  title: string;
  /** Marketing description; may include Bulgarian language content. */
  description: string;
  /** Numeric price; currency defined separately. */
  price: number;
  /** Currency used for price (BGN or EUR in Bulgaria). */
  currency: Currency;
}

/**
 * Core quantitative features used for search filters in Bulgaria.
 */
export interface PropertyFeatures {
  /** Total number of rooms incl. living room; used in BG as "стаи". */
  rooms: number;
  /** Number of bedrooms; often called "спални". */
  bedrooms: number;
  /** Number of bathrooms/WCs; "баня/тоалетна". */
  bathrooms: number;
  /** Built area in square meters (кв.м). */
  area_sqm: number;
  /** Year of construction; null when unknown. */
  year_built: number | null;
  /** Floor of the unit; null for houses/plots. */
  floor: number | null;
  /** Total floors in the building; null for houses/plots. */
  total_floors: number | null;
}

/**
 * Geographic and administrative location details.
 */
export interface Location {
  /** Street and number or descriptive address in Bulgarian. */
  address: string;
  /** Internal taxonomy id for neighborhoods in Stara Zagora. */
  neighborhood_id: string;
  /** Latitude in WGS84; null when not geocoded. */
  latitude: number | null;
  /** Longitude in WGS84; null when not geocoded. */
  longitude: number | null;
  /** City name. Default is "Stara Zagora" in this system. */
  city: string;
}

/**
 * Image metadata for property galleries.
 */
export interface PropertyImage {
  id: string;
  url: string;
  /** Accessible alt text, Bulgarian allowed. */
  alt_text: string;
  /** True when displayed as cover image. */
  is_primary: boolean;
  /** Order index for gallery sorting (ascending). */
  order: number;
}

/**
 * Bulgarian-specific amenities frequently found in local listings.
 */
export interface BulgarianFeatures {
  /** Number of dedicated parking spots or garage places. */
  parking_spots: number;
  /** Presence of balcony (балкон/лоджия). */
  has_balcony: boolean;
  /** Presence of terrace (тераса), often larger outdoor space. */
  has_terrace: boolean;
  /** Basement/cellar (мазе). */
  has_basement: boolean;
  /** Attic space (таванско помещение). */
  has_attic: boolean;
  /** Elevator/lift (асансьор) in the building. */
  has_elevator: boolean;
}

/**
 * Main property entity combining common Bulgarian real estate attributes.
 */
export interface Property extends PropertyBase {
  /** Category such as APARTMENT, HOUSE, OFFICE, etc. */
  type: PropertyType;
  /** Market status (e.g., SALE, RENT). */
  status: PropertyStatus;
  /** Physical/renovation condition. */
  condition: PropertyCondition;
  /** Primary heating system. */
  heating: HeatingType;
  /** Quantitative features. */
  features: PropertyFeatures;
  /** Bulgarian-specific amenities. */
  bg_features: BulgarianFeatures;
  /** Location details; city defaults to Stara Zagora at creation time. */
  location: Location;
  /** Gallery images. */
  images: PropertyImage[];
  /** Creation timestamp. */
  created_at: Date;
  /** Last update timestamp. */
  updated_at: Date;
  /** Visibility flag for publishing. */
  is_active: boolean;
  /** Aggregate view counter for analytics. */
  view_count: number;
}

export type { Property as NovaNestProperty };


