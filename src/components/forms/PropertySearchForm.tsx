"use client";

/**
 * PropertySearchForm component
 *
 * Purpose: Interactive search form for filtering properties by type, operation,
 * price range, and neighborhood (Stara Zagora). Validates inputs and navigates
 * to the properties results page with query parameters.
 */

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Search, Home, DollarSign, MapPin } from "lucide-react";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import { getAllNeighborhoods } from "@/lib/queries/neighborhoods";
import type { Database } from "@/types/database.generated";

// Types
type PropertyCategory = Database["public"]["Tables"]["property_categories"]["Row"];
type Neighborhood = Database["public"]["Tables"]["neighborhoods"]["Row"];
type OperationType = "sale" | "rent";

interface PropertySearchFormData {
  propertyType: string; // category slug or empty string
  operationType: OperationType;
  minPrice: string; // store as string for input control; coerce on validate
  maxPrice: string; // store as string for input control; coerce on validate
  neighborhood: string; // neighborhood slug or empty string
}

// Static operation options
const OPERATION_OPTIONS: { label: string; value: OperationType }[] = [
  { label: "Продажба", value: "sale" },
  { label: "Наем", value: "rent" },
];

// Zod schema for validation (coerces empty strings to undefined)
const toOptionalNumber = (val: unknown) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed.replace(/\s|\u00A0|,/g, ""));
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return val as number | undefined;
};

// Create dynamic Zod schema based on loaded data
const createPropertySearchZodSchema = (categories: PropertyCategory[], neighborhoods: Neighborhood[]) => {
  const categorySlugs = categories.map(c => c.slug);
  const neighborhoodSlugs = neighborhoods.map(n => n.slug);
  
  return z
    .object({
      propertyType: z
        .union([
          z.literal(""),
          ...categorySlugs.map(slug => z.literal(slug))
        ])
        .optional(),
      operationType: z.enum(["sale", "rent"]),
      minPrice: z.preprocess(toOptionalNumber, z.number().int().min(0).optional()),
      maxPrice: z.preprocess(toOptionalNumber, z.number().int().min(0).optional()),
      neighborhood: z
        .union([
          z.literal(""),
          ...neighborhoodSlugs.map(slug => z.literal(slug))
        ])
        .optional(),
    })
    .refine((data) => {
      if (typeof data.minPrice === "number" && typeof data.maxPrice === "number") {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    }, {
      message: "Минималната цена не може да е по-голяма от максималната.",
      path: ["minPrice"],
    });
};

type FormErrors = {
  propertyType?: string;
  operationType?: string;
  minPrice?: string;
  maxPrice?: string;
  neighborhood?: string;
};

export default function PropertySearchForm(): React.ReactElement {
  const router = useRouter();
  const [form, setForm] = useState<PropertySearchFormData>({
    propertyType: "",
    operationType: "sale",
    minPrice: "",
    maxPrice: "",
    neighborhood: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State for loaded data
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load categories and neighborhoods on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const [categoriesData, neighborhoodsData] = await Promise.all([
          getAllPropertyCategories(),
          getAllNeighborhoods()
        ]);
        
        setCategories(categoriesData);
        setNeighborhoods(neighborhoodsData);
      } catch (error) {
        console.error('Failed to load form data:', error);
        setLoadError('Неуспешно зареждане на данни за формата.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  function handleChange<K extends keyof PropertySearchFormData>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as any }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function buildQueryParams(validData: any): string {
    const params = new URLSearchParams();
    
    // Convert category slug to ID
    if (typeof validData.propertyType === "string" && validData.propertyType !== "") {
      const category = categories.find(c => c.slug === validData.propertyType);
      if (category) {
        params.set("category", String(category.id));
      }
    }
    
    params.set("operation", validData.operationType);
    
    if (typeof validData.minPrice === "number") params.set("minPrice", String(validData.minPrice));
    if (typeof validData.maxPrice === "number") params.set("maxPrice", String(validData.maxPrice));
    
    // Convert neighborhood slug to ID
    if (typeof validData.neighborhood === "string" && validData.neighborhood !== "") {
      const neighborhood = neighborhoods.find(n => n.slug === validData.neighborhood);
      if (neighborhood) {
        params.set("neighborhood", String(neighborhood.id));
      }
    }
    
    const qs = params.toString();
    return qs ? `/properties?${qs}` : "/properties";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Create dynamic schema based on loaded data
    const schema = createPropertySearchZodSchema(categories, neighborhoods);
    
    const parsed = schema.safeParse({
      propertyType: form.propertyType,
      operationType: form.operationType,
      minPrice: form.minPrice,
      maxPrice: form.maxPrice,
      neighborhood: form.neighborhood,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message || "Невалидна стойност.";
      }
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const url = buildQueryParams(parsed.data);
    router.push(url);
    setIsSubmitting(false);
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-lg p-6 w-full max-w-lg border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-6 w-6 text-[#d4af37]" />
          <h3 className="text-xl font-bold text-gray-800">
            Бърза търсене
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
          <span className="ml-3 text-gray-600">Зареждане...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="backdrop-blur-sm bg-white/95 rounded-lg shadow-lg p-6 w-full max-w-lg border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-6 w-6 text-[#d4af37]" />
          <h3 className="text-xl font-bold text-gray-800">
            Бърза търсене
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-[#d4af37] hover:underline"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Property search form"
      className="backdrop-blur-sm bg-white/95 rounded-lg shadow-lg p-6 w-full max-w-lg border border-white/20"
    >
      {/* Header with title and icon */}
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-[#d4af37]" />
        <h3 className="text-xl font-bold text-gray-800">
          Бърза търсене
        </h3>
      </div>
      
      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Property Type - Top Left */}
        <div>
          <label htmlFor="propertyType" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Home className="h-4 w-4" />
            Тип имот
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={form.propertyType}
            onChange={handleChange("propertyType")}
            aria-invalid={Boolean(errors.propertyType)}
            aria-describedby={errors.propertyType ? "propertyType-error" : undefined}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
            disabled={isSubmitting}
          >
            <option value="">Всички типове</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name_bg}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p id="propertyType-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.propertyType}
            </p>
          )}
        </div>

        {/* Operation Type - Top Right */}
        <div>
          <label htmlFor="operationType" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4" />
            Операция
          </label>
          <select
            id="operationType"
            name="operationType"
            value={form.operationType}
            onChange={handleChange("operationType")}
            aria-invalid={Boolean(errors.operationType)}
            aria-describedby={errors.operationType ? "operationType-error" : undefined}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
            disabled={isSubmitting}
          >
            {OPERATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.operationType && (
            <p id="operationType-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.operationType}
            </p>
          )}
        </div>

        {/* Price Limit - Bottom Left */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Ценова граница (лв.)
          </label>
          <input
            type="number"
            inputMode="numeric"
            id="maxPrice"
            name="maxPrice"
            placeholder="Максимална цена"
            value={form.maxPrice}
            onChange={handleChange("maxPrice")}
            aria-invalid={Boolean(errors.maxPrice)}
            aria-describedby={errors.maxPrice ? "maxPrice-error" : undefined}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
            min={0}
            disabled={isSubmitting}
          />
          {errors.maxPrice && (
            <p id="maxPrice-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.maxPrice}
            </p>
          )}
        </div>

        {/* Region - Bottom Right */}
        <div>
          <label htmlFor="neighborhood" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4" />
            Район
          </label>
          <select
            id="neighborhood"
            name="neighborhood"
            value={form.neighborhood}
            onChange={handleChange("neighborhood")}
            aria-invalid={Boolean(errors.neighborhood)}
            aria-describedby={errors.neighborhood ? "neighborhood-error" : undefined}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
            disabled={isSubmitting}
          >
            <option value="">Всички квартали</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.slug} value={neighborhood.slug}>
                {neighborhood.name_bg}
              </option>
            ))}
          </select>
          {errors.neighborhood && (
            <p id="neighborhood-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.neighborhood}
            </p>
          )}
        </div>
      </div>

      {/* Search button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1a2642] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#2c3e50] transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        aria-label={isSubmitting ? "Търсене..." : "Търси имоти"}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Търсене...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            Търси имоти
          </span>
        )}
      </button>
    </form>
  );
}


