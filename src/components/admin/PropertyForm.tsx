"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { PropertyCategory, PropertyWithDetails } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import type { Tables } from "@/types/database.generated";
import ImageUpload from "./ImageUpload";
import { uploadPropertyImage } from "@/lib/storage";

type PropertyFeature = Tables<"property_features">;

// Use a constant for current year to avoid hydration issues
const CURRENT_YEAR = 2025;

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
  category_id: z.number().int().positive({ message: "Изберете тип имот" }),
  neighborhood_id: z.number().int().positive({ message: "Изберете квартал" }),
  area_sqm: z.number().min(0).optional().nullable(),
  rooms: z.number().int().min(1).max(20).optional().nullable(),
  bedrooms: z.number().int().min(0).max(10).optional().nullable(),
  bathrooms: z.number().int().min(0).max(10).optional().nullable(),
  floor: z.number().int().min(-5).max(100).optional().nullable(),
  total_floors: z.number().int().min(1).max(100).optional().nullable(),
  year_built: z.number().int().min(1800).max(CURRENT_YEAR).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  features: z.array(z.number()).optional(),
});

type PropertyFormData = z.infer<typeof PropertyFormSchema>;

interface PropertyFormProps {
  initialData?: PropertyWithDetails;
  categories: PropertyCategory[];
  neighborhoods: StaraZagoraNeighborhood[];
  features: PropertyFeature[];
  submitLabel?: string;
}

export default function PropertyForm({
  initialData,
  categories,
  neighborhoods,
  features,
  submitLabel = "Добави имот",
}: PropertyFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = !!initialData;

  // Get feature IDs from initialData
  const initialFeatureIds = initialData?.features?.map((f: any) => f.id) || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: initialData ? {
      title_bg: initialData.property.title_bg,
      title_en: (initialData.property as any).title_en || "",
      description_bg: initialData.property.description_bg || "",
      description_en: (initialData.property as any).description_en || "",
      address_bg: initialData.property.address_bg || "",
      price_eur: initialData.property.price_eur || undefined,
      price_bgn: initialData.property.price_bgn || undefined,
      operation_type: initialData.property.operation_type,
      status: initialData.property.status,
      category_id: initialData.property.category_id,
      neighborhood_id: initialData.property.neighborhood_id,
      area_sqm: initialData.property.area_sqm || undefined,
      rooms: initialData.property.rooms || undefined,
      bedrooms: initialData.property.bedrooms || undefined,
      bathrooms: initialData.property.bathrooms || undefined,
      floor: initialData.property.floor || undefined,
      total_floors: (initialData.property as any).total_floors || undefined,
      year_built: initialData.property.year_built || undefined,
      latitude: initialData.property.latitude || undefined,
      longitude: initialData.property.longitude || undefined,
      features: initialFeatureIds,
    } : {
      operation_type: "sale",
      status: "available",
      features: [],
    },
  });

  const handleFormSubmit = async (data: PropertyFormData) => {
    // Validate images (need at least one - existing or new)
    if (images.length === 0 && existingImages.length === 0) {
      setImageError("Моля, добавете поне една снимка");
      return;
    }

    setImageError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // UPDATE MODE
        const propertyId = initialData.property.id;

        // Step 1: Update property
        const response = await fetch(`/api/admin/properties/${propertyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Грешка при обновяване на имота");
        }

        // Step 2: Delete removed images
        if (imagesToDelete.length > 0) {
          await fetch(`/api/admin/properties/${propertyId}/images`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageIds: imagesToDelete }),
          });
        }

        // Step 3: Upload new images if any
        if (images.length > 0) {
          const uploadPromises = images.map((file) =>
            uploadPropertyImage(propertyId, file)
          );
          const uploadedImages = await Promise.all(uploadPromises);

          const imageRecords = uploadedImages.map((img, index) => ({
            property_id: propertyId,
            url: img.url,
            alt_text_bg: data.title_bg,
            is_primary: existingImages.length === 0 && index === 0,
            sort_order: existingImages.length + index,
          }));

          await fetch(`/api/admin/properties/${propertyId}/images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: imageRecords }),
          });
        }

        // Success - redirect to properties list
        router.push("/admin/properties/");
      } else {
        // CREATE MODE
        const response = await fetch("/api/admin/properties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Грешка при запазване на имота");
        }

        const { property } = await response.json();

        // Upload images
        const uploadPromises = images.map((file) =>
          uploadPropertyImage(property.id, file)
        );
        const uploadedImages = await Promise.all(uploadPromises);

        // Save image records to database
        const imageRecords = uploadedImages.map((img, index) => ({
          property_id: property.id,
          url: img.url,
          alt_text_bg: data.title_bg,
          is_primary: index === 0,
          sort_order: index,
        }));

        const imagesResponse = await fetch(
          `/api/admin/properties/${property.id}/images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: imageRecords }),
          }
        );

        if (!imagesResponse.ok) {
          throw new Error("Грешка при запазване на снимките");
        }

        // Success - redirect to properties list
        router.push("/admin/properties/");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Грешка при запазване на имота"
      );
      setIsSubmitting(false);
    }
  };

  const handleDeleteExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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
              max={CURRENT_YEAR}
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

      {/* Location and Category Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Местоположение и категория
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Тип имот <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              {...register("category_id", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Изберете тип имот
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_bg}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Neighborhood */}
          <div>
            <label
              htmlFor="neighborhood_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Квартал <span className="text-red-500">*</span>
            </label>
            <select
              id="neighborhood_id"
              {...register("neighborhood_id", { valueAsNumber: true })}
              className="block w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Изберете квартал
              </option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name_bg}
                </option>
              ))}
            </select>
            {errors.neighborhood_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.neighborhood_id.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Характеристики
        </h2>

        <Controller
          name="features"
          control={control}
          render={({ field }) => {
            const handleFeatureToggle = (featureId: number) => {
              const currentFeatures = field.value || [];
              if (currentFeatures.includes(featureId)) {
                field.onChange(currentFeatures.filter((id) => id !== featureId));
              } else {
                field.onChange([...currentFeatures, featureId]);
              }
            };

            // Group features by category
            const groupedFeatures = features.reduce((acc, feature) => {
              if (!acc[feature.category]) {
                acc[feature.category] = [];
              }
              acc[feature.category].push(feature);
              return acc;
            }, {} as Record<string, PropertyFeature[]>);

            const categoryLabels: Record<string, string> = {
              interior: "Интериор",
              exterior: "Екстериор",
              building: "Сграда",
              location: "Локация",
            };

            return (
              <div className="space-y-6">
                {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryFeatures.map((feature) => {
                        const isSelected = field.value?.includes(feature.id) || false;
                        return (
                          <label
                            key={feature.id}
                            className={`
                              flex items-center p-3 border rounded-md cursor-pointer transition-all
                              ${
                                isSelected
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : "border-gray-200 hover:border-[#D4AF37]"
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFeatureToggle(feature.id)}
                              className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {feature.name_bg}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          }}
        />
      </div>

      {/* Images Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Снимки <span className="text-red-500">*</span>
        </h2>

        <ImageUpload
          images={images}
          existingImages={existingImages}
          onImagesChange={setImages}
          onExistingImageDelete={handleDeleteExistingImage}
          maxImages={10}
        />

        {imageError && (
          <p className="mt-4 text-sm text-red-600">{imageError}</p>
        )}
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#D4AF37] text-white font-medium rounded-md hover:bg-[#B8941F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Запазване...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}

