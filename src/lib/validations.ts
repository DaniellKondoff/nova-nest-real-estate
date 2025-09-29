import { z } from "zod";
import type { Property, PropertyCondition, PropertyStatus, HeatingType, PropertyType, Currency, Location, PropertyFeatures, BulgarianFeatures, PropertyImage } from "@/types/property";
import type { Database } from "@/types/database.generated";

// Bulgarian phone: +359 XX XXX XXXX or 08X XXX XXXX
export const bgPhoneRegex = /^(?:\+359\s?\d{2}\s?\d{3}\s?\d{4}|0?8\d\s?\d{3}\s?\d{3})$/;

// Email: allow common TLDs incl. .bg, .com, .eu
export const emailRegex = /^[^\s@]+@[^\s@]+\.(?:bg|com|eu|net|org)$/i;

// Currency validator
export const currencySchema = z.union([z.literal("BGN"), z.literal("EUR")]);

// Image upload constraints
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const imageUploadSchema = z.object({
  file: z
    .custom<File>((v) => v instanceof File, {
      message: "Invalid file",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as any), {
      message: "Невалиден тип на файл (jpg, jpeg, png, webp) / Invalid file type",
    })
    .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, {
      message: "Файлът е твърде голям (макс. 5MB) / File too large (max 5MB)",
    }),
  alt_text: z
    .string()
    .min(3, "Добавете алтернативен текст / Provide alt text"),
});

// Bulgarian address validation (postal codes 6000-6999 for Stara Zagora region)
export const bgPostalCodeRegex = /^(6\d{3})$/;
export const bulgarianAddressSchema = z.object({
  address: z.string().min(3, "Адресът е задължителен / Address required"),
  city: z.string().min(2).default("Stara Zagora"),
  postal_code: z.string().regex(bgPostalCodeRegex, "Пощенски код 6000-6999 / Postal code 6000-6999"),
});

// Property nested schemas based on types
const propertyFeaturesSchema: z.ZodType<PropertyFeatures> = z.object({
  rooms: z.number().int().min(0),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area_sqm: z.number().min(0),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).nullable(),
  floor: z.number().int().min(0).nullable(),
  total_floors: z.number().int().min(0).nullable(),
});

const bulgarianFeaturesSchema: z.ZodType<BulgarianFeatures> = z.object({
  parking_spots: z.number().int().min(0),
  has_balcony: z.boolean(),
  has_terrace: z.boolean(),
  has_basement: z.boolean(),
  has_attic: z.boolean(),
  has_elevator: z.boolean(),
});

const locationSchema: z.ZodType<Location> = z.object({
  address: z.string().min(3),
  neighborhood_id: z.string().uuid().or(z.string().min(1)),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  city: z.string().min(2),
});

const propertyImageSchema: z.ZodType<PropertyImage> = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  alt_text: z.string().min(3),
  is_primary: z.boolean(),
  order: z.number().int().min(0),
});

// Property create/validate schema
export const propertySchema: z.ZodType<Property> = z.object({
  id: z.string().min(1),
  title: z.string().min(3, "Заглавието е задължително / Title is required"),
  description: z.string().min(10, "Описание е задължително / Description is required"),
  price: z.number().min(0),
  currency: currencySchema as z.ZodType<Currency>,
  type: z.enum(["APARTMENT", "HOUSE", "OFFICE", "GARAGE", "PLOT", "COMMERCIAL"]) as unknown as z.ZodType<PropertyType>,
  status: z.enum(["SALE", "RENT", "SOLD", "RENTED", "RESERVED"]) as unknown as z.ZodType<PropertyStatus>,
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "NEEDS_RENOVATION", "UNDER_CONSTRUCTION"]) as unknown as z.ZodType<PropertyCondition>,
  heating: z.enum(["CENTRAL", "INDIVIDUAL_GAS", "ELECTRIC", "SOLID_FUEL", "NONE"]) as unknown as z.ZodType<HeatingType>,
  features: propertyFeaturesSchema,
  bg_features: bulgarianFeaturesSchema,
  location: locationSchema,
  images: z.array(propertyImageSchema).min(1, "Добавете поне 1 снимка / Add at least 1 image"),
  created_at: z.date(),
  updated_at: z.date(),
  is_active: z.boolean(),
  view_count: z.number().int().min(0),
});

// Search filters
export const searchFiltersSchema = z.object({
  property_type: z
    .enum(["APARTMENT", "HOUSE", "OFFICE", "GARAGE", "PLOT", "COMMERCIAL"]) 
    .optional(),
  status: z.enum(["SALE", "RENT"]).optional(),
  price_range: z
    .object({ min: z.number().min(0).optional(), max: z.number().min(0).optional(), currency: currencySchema.optional() })
    .partial()
    .optional(),
  neighborhood_id: z.string().optional(),
  rooms_min: z.number().int().min(0).optional(),
  rooms_max: z.number().int().min(0).optional(),
  area_min: z.number().min(0).optional(),
  area_max: z.number().min(0).optional(),
});

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(2, "Името е задължително / Name is required"),
  email: z.string().regex(emailRegex, "Невалиден email / Invalid email"),
  phone_bg: z.string().regex(bgPhoneRegex, "Невалиден български телефон / Invalid BG phone"),
  message: z.string().min(10, "Съобщението е твърде кратко / Message too short"),
  inquiry_type: z.enum(["VIEWING", "INFO", "CALLBACK"]),
  property_id: z.string().optional(),
});

// User registration
export const userRegistrationSchema = z.object({
  email: z.string().regex(emailRegex, "Невалиден email / Invalid email"),
  password: z
    .string()
    .min(8, "Минимум 8 символа / Minimum 8 characters")
    .regex(/[A-Z]/, "Поне една главна буква / At least one uppercase letter")
    .regex(/[a-z]/, "Поне една малка буква / At least one lowercase letter")
    .regex(/\d/, "Поне една цифра / At least one number"),
  full_name: z.string().min(2, "Име и фамилия / Full name required"),
  phone_bg: z.string().regex(bgPhoneRegex, "Невалиден български телефон / Invalid BG phone"),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]),
});

// Price helper
export const priceSchema = z.object({
  amount: z.number().min(0),
  currency: currencySchema,
});

export type PropertyFormInput = z.infer<typeof propertySchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

export const validators = {
  bgPhoneRegex,
  emailRegex,
  bgPostalCodeRegex,
  priceSchema,
  imageUploadSchema,
};

// New requested schemas
export const PropertySearchSchema = z.object({
  searchTerm: z.string().trim().min(1).optional(),
  categoryId: z.number().int().positive().optional(),
  neighborhoodId: z.number().int().positive().optional(),
  operationType: z.enum(["sale", "rent"]) as unknown as z.ZodType<Database["public"]["Enums"]["property_operation_type"]>,
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  minArea: z.number().int().min(0).optional(),
  maxArea: z.number().int().min(0).optional(),
}).refine((val) => (val.minPrice && val.maxPrice ? val.minPrice <= val.maxPrice : true), {
  message: "Минималната цена не може да е по-голяма от максималната.",
  path: ["minPrice"],
}).refine((val) => (val.minArea && val.maxArea ? val.minArea <= val.maxArea : true), {
  message: "Минималната площ не може да е по-голяма от максималната.",
  path: ["minArea"],
});

export const ContactInquirySchema = z.object({
  fullName: z.string().min(2, "Въведете име."),
  email: z.string().regex(emailRegex, "Невалиден email."),
  phone: z.string().regex(bgPhoneRegex, "Невалиден български телефон."),
  message: z.string().min(10, "Съобщението е твърде кратко."),
  propertyId: z.number().int().positive().optional(),
});

export const AdminPropertySchema = z.object({
  title_bg: z.string().min(3, "Въведете заглавие."),
  description_bg: z.string().min(10, "Въведете описание."),
  category_id: z.number().int().positive(),
  neighborhood_id: z.number().int().positive(),
  operation_type: z.enum(["sale", "rent"]) as unknown as z.ZodType<Database["public"]["Enums"]["property_operation_type"]>,
  status: z.enum(["available", "under_offer", "sold", "rented", "archived"]) as unknown as z.ZodType<Database["public"]["Enums"]["property_status"]>,
  price_eur: z.number().min(0).nullable().optional(),
  price_bgn: z.number().min(0).nullable().optional(),
  area_sqm: z.number().min(0).nullable().optional(),
  rooms: z.number().int().min(0).nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  floor: z.number().int().min(0).nullable().optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});


// ==========================
// Contact Form (Public Site)
// ==========================

// Bulgarian-specific phone pattern per requirements
export const bulgarianPhoneRegex = /^(\+359|0)\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/;

export const ContactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Моля, въведете вашето име")
    .min(2, "Името трябва да бъде поне 2 символа")
    .max(100, "Името е твърде дълго (максимум 100 символа)")
    .regex(/^[а-яА-Яa-zA-Z\s\-]+$/, "Невалидни символи в името"),

  email: z
    .string()
    .trim()
    .min(1, "Моля, въведете имейл адрес")
    .email("Моля, въведете валиден имейл адрес")
    .toLowerCase(),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || bulgarianPhoneRegex.test(val.trim()),
      {
        message: "Моля, въведете валиден телефонен номер",
      }
    ),

  message: z
    .string()
    .trim()
    .min(1, "Моля, въведете съобщение")
    .min(10, "Съобщението трябва да бъде поне 10 символа")
    .max(1000, "Съобщението е твърде дълго (максимум 1000 символа)"),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;


