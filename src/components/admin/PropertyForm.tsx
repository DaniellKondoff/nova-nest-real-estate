"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Extended schema for form with additional fields
const PropertyFormSchema = z.object({
  title_bg: z.string().min(3, "Въведете заглавие.").max(200, "Максимум 200 символа"),
  title_en: z.string().max(200, "Максимум 200 символа").optional().nullable(),
  description_bg: z.string().min(20, "Минимум 20 символа").max(5000, "Максимум 5000 символа"),
  description_en: z.string().max(5000, "Максимум 5000 символа").optional().nullable(),
  address_bg: z.string().min(3, "Въведете адрес"),
  price_eur: z.number().min(1, "Цената трябва да е поне 1 EUR"),
  price_bgn: z.number().min(0).optional().nullable(),
  operation_type: z.enum(["sale", "rent"]),
  status: z.enum(["available", "under_offer", "sold", "rented", "archived"]),
  category_id: z.number().int().positive(),
  neighborhood_id: z.number().int().positive(),
  area_sqm: z.number().min(0).optional().nullable(),
  rooms: z.number().int().min(1).max(20).optional().nullable(),
  bedrooms: z.number().int().min(0).max(10).optional().nullable(),
  bathrooms: z.number().int().min(0).max(10).optional().nullable(),
  floor: z.number().int().min(-5).max(100).optional().nullable(),
  total_floors: z.number().int().min(1).max(100).optional().nullable(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

type PropertyFormData = z.infer<typeof PropertyFormSchema>;

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>;
  defaultValues?: Partial<PropertyFormData>;
  isLoading?: boolean;
}

export default function PropertyForm({
  onSubmit,
  defaultValues,
  isLoading = false,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      operation_type: "sale",
      status: "available",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Основна информация
        </h2>

        <div className="space-y-6">
          {/* Title (Bulgarian) */}
          <div>
            <label
              htmlFor="title_bg"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Заглавие (BG) <span className="text-red-500">*</span>
            </label>
            <input
              id="title_bg"
              type="text"
              {...register("title_bg")}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="Например: Тристаен апартамент в центъра"
            />
            {errors.title_bg && (
              <p className="mt-1 text-sm text-red-600">{errors.title_bg.message}</p>
            )}
          </div>

          {/* Title (English) */}
          <div>
            <label
              htmlFor="title_en"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Заглавие (EN)
            </label>
            <input
              id="title_en"
              type="text"
              {...register("title_en")}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="Example: Three-room apartment in the center"
            />
            {errors.title_en && (
              <p className="mt-1 text-sm text-red-600">{errors.title_en.message}</p>
            )}
          </div>

          {/* Description (Bulgarian) */}
          <div>
            <label
              htmlFor="description_bg"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Описание (BG) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description_bg"
              rows={5}
              {...register("description_bg")}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm resize-y"
              placeholder="Въведете подробно описание на имота..."
            />
            {errors.description_bg && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description_bg.message}
              </p>
            )}
          </div>

          {/* Description (English) */}
          <div>
            <label
              htmlFor="description_en"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Описание (EN)
            </label>
            <textarea
              id="description_en"
              rows={5}
              {...register("description_en")}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm resize-y"
              placeholder="Enter detailed property description..."
            />
            {errors.description_en && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description_en.message}
              </p>
            )}
          </div>

          {/* Address (Bulgarian) */}
          <div>
            <label
              htmlFor="address_bg"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Адрес (BG) <span className="text-red-500">*</span>
            </label>
            <input
              id="address_bg"
              type="text"
              {...register("address_bg")}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="Например: ул. Цар Симеон Велики 15"
            />
            {errors.address_bg && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address_bg.message}
              </p>
            )}
          </div>

          {/* Price (EUR) */}
          <div>
            <label
              htmlFor="price_eur"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Цена (EUR) <span className="text-red-500">*</span>
            </label>
            <input
              id="price_eur"
              type="number"
              step="0.01"
              min="1"
              {...register("price_eur", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="50000"
            />
            {errors.price_eur && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price_eur.message}
              </p>
            )}
          </div>

          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Тип операция <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sale"
                  {...register("operation_type")}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 focus:ring-[#D4AF37]"
                />
                <span className="ml-2 text-sm text-gray-700">Продажба</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="rent"
                  {...register("operation_type")}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 focus:ring-[#D4AF37]"
                />
                <span className="ml-2 text-sm text-gray-700">Наем</span>
              </label>
            </div>
            {errors.operation_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.operation_type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Детайли за имота
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Area (m²) */}
          <div>
            <label
              htmlFor="area_sqm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Площ (м²)
            </label>
            <input
              id="area_sqm"
              type="number"
              step="0.01"
              {...register("area_sqm", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="85"
            />
            {errors.area_sqm && (
              <p className="mt-1 text-sm text-red-600">
                {errors.area_sqm.message}
              </p>
            )}
          </div>

          {/* Rooms */}
          <div>
            <label
              htmlFor="rooms"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Брой стаи
            </label>
            <input
              id="rooms"
              type="number"
              min="1"
              max="20"
              {...register("rooms", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="3"
            />
            {errors.rooms && (
              <p className="mt-1 text-sm text-red-600">
                {errors.rooms.message}
              </p>
            )}
          </div>

          {/* Bedrooms */}
          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Спални
            </label>
            <input
              id="bedrooms"
              type="number"
              min="0"
              max="10"
              {...register("bedrooms", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="2"
            />
            {errors.bedrooms && (
              <p className="mt-1 text-sm text-red-600">
                {errors.bedrooms.message}
              </p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label
              htmlFor="bathrooms"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Бани
            </label>
            <input
              id="bathrooms"
              type="number"
              min="0"
              max="10"
              {...register("bathrooms", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="1"
            />
            {errors.bathrooms && (
              <p className="mt-1 text-sm text-red-600">
                {errors.bathrooms.message}
              </p>
            )}
          </div>

          {/* Floor */}
          <div>
            <label
              htmlFor="floor"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Етаж
            </label>
            <input
              id="floor"
              type="number"
              min="-5"
              max="100"
              {...register("floor", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="3"
            />
            {errors.floor && (
              <p className="mt-1 text-sm text-red-600">
                {errors.floor.message}
              </p>
            )}
          </div>

          {/* Total Floors */}
          <div>
            <label
              htmlFor="total_floors"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Общо етажи
            </label>
            <input
              id="total_floors"
              type="number"
              min="1"
              max="100"
              {...register("total_floors", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="6"
            />
            {errors.total_floors && (
              <p className="mt-1 text-sm text-red-600">
                {errors.total_floors.message}
              </p>
            )}
          </div>

          {/* Year Built */}
          <div>
            <label
              htmlFor="year_built"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Година на строителство
            </label>
            <input
              id="year_built"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              {...register("year_built", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              placeholder="2010"
            />
            {errors.year_built && (
              <p className="mt-1 text-sm text-red-600">
                {errors.year_built.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit button will be added later */}
    </form>
  );
}

