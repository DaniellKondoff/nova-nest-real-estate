import { z } from "zod";
import type { OperationType } from "@/types/property";

// Contact Inquiry
export const ContactInquiryFormSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(6).max(20).optional().nullable(),
  subject: z.string().min(2).max(150).optional().nullable(),
  message: z.string().min(5).max(2000),
  property_id: z.number().int().positive().optional().nullable(),
});
export type ContactInquiryForm = z.infer<typeof ContactInquiryFormSchema>;

// Property Filter Form
export const PropertyFilterFormSchema = z.object({
  operationType: z.enum(["sale", "rent"]).optional(),
  categoryId: z.number().int().positive().optional(),
  neighborhoodId: z.number().int().positive().optional(),
  minPriceEur: z.number().int().nonnegative().optional(),
  maxPriceEur: z.number().int().nonnegative().optional(),
  minArea: z.number().int().nonnegative().optional(),
  maxArea: z.number().int().nonnegative().optional(),
  minBedrooms: z.number().int().nonnegative().optional(),
  minBathrooms: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  searchTerm: z.string().max(200).optional(),
});
export type PropertyFilterForm = z.infer<typeof PropertyFilterFormSchema>;

// Admin Property Form
export const AdminPropertyFormSchema = z.object({
  title_bg: z.string().min(3).max(200),
  description_bg: z.string().max(5000).optional().nullable(),
  operation_type: z.enum(["sale", "rent"]) as unknown as z.ZodType<OperationType>,
  status: z.enum(["available", "under_offer", "sold", "rented", "archived"]).optional(),
  category_id: z.number().int().positive(),
  neighborhood_id: z.number().int().positive(),
  address_bg: z.string().max(300).optional().nullable(),
  price_eur: z.number().nonnegative().optional().nullable(),
  price_bgn: z.number().nonnegative().optional().nullable(),
  area_sqm: z.number().nonnegative().optional().nullable(),
  rooms: z.number().int().nonnegative().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  floor: z.number().int().optional().nullable(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  seo_title: z.string().max(120).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
  seo_keywords: z.string().max(300).optional().nullable(),
  og_image: z.string().url().optional().nullable(),
  featureIds: z.array(z.number().int().positive()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt_text_bg: z.string().max(160).optional().nullable(),
        is_primary: z.boolean().optional(),
        sort_order: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});
export type AdminPropertyForm = z.infer<typeof AdminPropertyFormSchema>;

// Testimonial Form
export const TestimonialFormSchema = z.object({
  client_name: z.string().min(2).max(100),
  content_bg: z.string().min(5).max(2000),
  rating: z.number().int().min(1).max(5),
  property_id: z.number().int().positive().optional().nullable(),
  is_featured: z.boolean().optional(),
});
export type TestimonialForm = z.infer<typeof TestimonialFormSchema>;


