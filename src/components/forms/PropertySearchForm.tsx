"use client";

/**
 * PropertySearchForm component
 *
 * Purpose: Interactive search form for filtering properties by type, operation,
 * price range, and neighborhood (Stara Zagora). Validates inputs and navigates
 * to the properties results page with query parameters.
 */

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Search } from "lucide-react";

// Types
const PROPERTY_TYPE_VALUES = [
  "apartment",
  "house",
  "office",
  "garage",
  "plot",
  "commercial",
] as const;
type PropertyTypeSlug = typeof PROPERTY_TYPE_VALUES[number];
type OperationType = "sale" | "rent";
const NEIGHBORHOOD_VALUES = [
  "centar",
  "samara",
  "zheleznik",
  "ayazmoto",
  "kazanski",
  "tri-chuchura",
  "industrialna-zona",
] as const;
type NeighborhoodSlug = typeof NEIGHBORHOOD_VALUES[number];

interface PropertySearchFormData {
  propertyType: PropertyTypeSlug | "";
  operationType: OperationType;
  minPrice: string; // store as string for input control; coerce on validate
  maxPrice: string; // store as string for input control; coerce on validate
  neighborhood: NeighborhoodSlug | "";
}

// UI option maps
const PROPERTY_TYPE_OPTIONS: { label: string; value: PropertyTypeSlug | "" }[] = [
  { label: "Всички типове", value: "" },
  { label: "Апартамент", value: "apartment" },
  { label: "Къща", value: "house" },
  { label: "Офис", value: "office" },
  { label: "Гараж", value: "garage" },
  { label: "Парцел", value: "plot" },
  { label: "Склад", value: "commercial" },
];

const OPERATION_OPTIONS: { label: string; value: OperationType }[] = [
  { label: "Продажба", value: "sale" },
  { label: "Наем", value: "rent" },
];

const NEIGHBORHOOD_OPTIONS: { label: string; value: NeighborhoodSlug | "" }[] = [
  { label: "Всички квартали", value: "" },
  { label: "Център", value: "centar" },
  { label: "Самара", value: "samara" },
  { label: "Железник", value: "zheleznik" },
  { label: "Аязмото", value: "ayazmoto" },
  { label: "Казански", value: "kazanski" },
  { label: "Три чучура", value: "tri-chuchura" },
  { label: "Индустриална зона", value: "industrialna-zona" },
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

const PropertySearchZodSchema = z
  .object({
    propertyType: z
      .union([
        z.literal(""),
        z.enum(PROPERTY_TYPE_VALUES),
      ])
      .optional(),
    operationType: z.enum(["sale", "rent"]),
    minPrice: z.preprocess(toOptionalNumber, z.number().int().min(0).optional()),
    maxPrice: z.preprocess(toOptionalNumber, z.number().int().min(0).optional()),
    neighborhood: z
      .union([
        z.literal(""),
        z.enum(NEIGHBORHOOD_VALUES),
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

type FormErrors = Partial<Record<keyof z.infer<typeof PropertySearchZodSchema>, string>> & {
  minPrice?: string;
  maxPrice?: string;
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

  function handleChange<K extends keyof PropertySearchFormData>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as any }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function buildQueryParams(validData: z.infer<typeof PropertySearchZodSchema>): string {
    const params = new URLSearchParams();
    if (typeof validData.propertyType === "string" && validData.propertyType !== "") {
      params.set("category", String(validData.propertyType));
    }
    params.set("operation", validData.operationType);
    if (typeof validData.minPrice === "number") params.set("minPrice", String(validData.minPrice));
    if (typeof validData.maxPrice === "number") params.set("maxPrice", String(validData.maxPrice));
    if (typeof validData.neighborhood === "string" && validData.neighborhood !== "") {
      params.set("neighborhood", String(validData.neighborhood));
    }
    const qs = params.toString();
    return qs ? `/properties?${qs}` : "/properties";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const parsed = PropertySearchZodSchema.safeParse({
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

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Property search form"
      className="mx-auto max-w-5xl bg-white rounded-xl shadow-2xl p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
            Тип имот
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={form.propertyType}
            onChange={handleChange("propertyType")}
            aria-invalid={Boolean(errors.propertyType)}
            aria-describedby={errors.propertyType ? "propertyType-error" : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            disabled={isSubmitting}
          >
            {PROPERTY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p id="propertyType-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.propertyType}
            </p>
          )}
        </div>

        {/* Operation Type */}
        <div>
          <label htmlFor="operationType" className="block text-sm font-medium text-gray-700 mb-2">
            Операция
          </label>
          <select
            id="operationType"
            name="operationType"
            value={form.operationType}
            onChange={handleChange("operationType")}
            aria-invalid={Boolean(errors.operationType)}
            aria-describedby={errors.operationType ? "operationType-error" : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
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

        {/* Price Min */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Цена (EUR) — От
          </label>
          <input
            type="number"
            inputMode="numeric"
            id="minPrice"
            name="minPrice"
            placeholder="От (EUR)"
            value={form.minPrice}
            onChange={handleChange("minPrice")}
            aria-invalid={Boolean(errors.minPrice)}
            aria-describedby={errors.minPrice ? "minPrice-error" : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            min={0}
            disabled={isSubmitting}
          />
          {errors.minPrice && (
            <p id="minPrice-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.minPrice}
            </p>
          )}
        </div>

        {/* Price Max */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Цена (EUR) — До
          </label>
          <input
            type="number"
            inputMode="numeric"
            id="maxPrice"
            name="maxPrice"
            placeholder="До (EUR)"
            value={form.maxPrice}
            onChange={handleChange("maxPrice")}
            aria-invalid={Boolean(errors.maxPrice)}
            aria-describedby={errors.maxPrice ? "maxPrice-error" : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            min={0}
            disabled={isSubmitting}
          />
          {errors.maxPrice && (
            <p id="maxPrice-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.maxPrice}
            </p>
          )}
        </div>

        {/* Neighborhood */}
        <div className="md:col-span-1 lg:col-span-1">
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
            Квартал
          </label>
          <select
            id="neighborhood"
            name="neighborhood"
            value={form.neighborhood}
            onChange={handleChange("neighborhood")}
            aria-invalid={Boolean(errors.neighborhood)}
            aria-describedby={errors.neighborhood ? "neighborhood-error" : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            disabled={isSubmitting}
          >
            {NEIGHBORHOOD_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.neighborhood && (
            <p id="neighborhood-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.neighborhood}
            </p>
          )}
        </div>

        {/* Search button */}
        <div className="flex items-end md:col-span-2 lg:col-span-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#d4af37] text-white font-semibold px-8 py-4 rounded-lg hover:bg-[#c09d2f] transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
            aria-label={isSubmitting ? "Търсене..." : "Търси имоти"}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Търсене...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5" aria-hidden="true" />
                Търси имоти
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}


