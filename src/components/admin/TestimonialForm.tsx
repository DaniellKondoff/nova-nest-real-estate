"use client";

import { useState, FormEvent } from "react";
import { Star } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: number;
  client_name: string;
  rating: number | null;
  content_bg: string;
  content_en?: string | null;
  is_published: boolean;
}

interface TestimonialData {
  client_name: string;
  rating: number;
  content_bg: string;
  content_en?: string;
  is_published: boolean;
}

interface TestimonialFormProps {
  initialData?: Testimonial;
  onSubmit: (data: TestimonialData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function TestimonialForm({ 
  initialData, 
  onSubmit,
  isSubmitting = false
}: TestimonialFormProps) {
  const [formData, setFormData] = useState<TestimonialData>({
    client_name: initialData?.client_name || "",
    rating: initialData?.rating || 1,
    content_bg: initialData?.content_bg || "",
    content_en: initialData?.content_en || "",
    is_published: initialData?.is_published || false,
  });

  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
    setErrors({ ...errors, rating: "" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = "Моля, въведете име на клиент";
    } else if (formData.client_name.length > 100) {
      newErrors.client_name = "Името не може да бъде по-дълго от 100 символа";
    }
    
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Моля, изберете оценка от 1 до 5";
    }
    
    if (!formData.content_bg.trim()) {
      newErrors.content_bg = "Моля, въведете отзив";
    } else if (formData.content_bg.length < 10) {
      newErrors.content_bg = "Отзивът трябва да бъде поне 10 символа";
    } else if (formData.content_bg.length > 500) {
      newErrors.content_bg = "Отзивът не може да бъде по-дълъг от 500 символа";
    }
    
    if (formData.content_en && formData.content_en.length > 500) {
      newErrors.content_en = "Отзивът не може да бъде по-дълъг от 500 символа";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await onSubmit(formData);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isSelected = i <= formData.rating;
      const isHovered = hoveredStar > 0 && i <= hoveredStar;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Оценка ${i} от 5`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isSelected || isHovered
                ? "text-[#D4AF37] fill-[#D4AF37]"
                : "text-gray-300"
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm">
      <div className="space-y-6">
        {/* Client Name */}
        <div>
          <label htmlFor="client_name" className="block text-sm font-semibold text-gray-700 mb-2">
            Име на клиент <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="client_name"
            value={formData.client_name}
            onChange={(e) => {
              setFormData({ ...formData, client_name: e.target.value });
              setErrors({ ...errors, client_name: "" });
            }}
            placeholder="Иван П."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
              errors.client_name ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.client_name && (
            <p className="mt-1 text-sm text-red-500">{errors.client_name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Използвайте инициали за поверителност (напр. Иван П.)
          </p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Оценка <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            {formData.rating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {formData.rating} от 5
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
          )}
        </div>

        {/* Review (Bulgarian) */}
        <div>
          <label htmlFor="content_bg" className="block text-sm font-semibold text-gray-700 mb-2">
            Отзив <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content_bg"
            value={formData.content_bg}
            onChange={(e) => {
              setFormData({ ...formData, content_bg: e.target.value });
              setErrors({ ...errors, content_bg: "" });
            }}
            placeholder="Въведете отзива на клиента..."
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none ${
              errors.content_bg ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.content_bg && (
            <p className="mt-1 text-sm text-red-500">{errors.content_bg}</p>
          )}
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Минимум 10 символа</span>
            <span>{formData.content_bg.length}/500</span>
          </div>
        </div>

        {/* Review (English) */}
        <div>
          <label htmlFor="content_en" className="block text-sm font-semibold text-gray-700 mb-2">
            Отзив (английски)
          </label>
          <textarea
            id="content_en"
            value={formData.content_en}
            onChange={(e) => {
              setFormData({ ...formData, content_en: e.target.value });
              setErrors({ ...errors, content_en: "" });
            }}
            placeholder="Enter the client's review in English..."
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none ${
              errors.content_en ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.content_en && (
            <p className="mt-1 text-sm text-red-500">{errors.content_en}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {formData.content_en?.length || 0}/500
          </div>
        </div>

        {/* Approved Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData({ ...formData, is_published: e.target.checked })
            }
            className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
            disabled={isSubmitting}
          />
          <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
            Одобрен за показване
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B4941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Запазване..." : "Запази"}
          </button>
          <Link
            href="/admin/testimonials"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Отказ
          </Link>
        </div>
      </div>
    </form>
  );
}

