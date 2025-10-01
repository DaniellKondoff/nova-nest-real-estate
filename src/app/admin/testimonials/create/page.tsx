"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";

interface TestimonialData {
  client_name: string;
  rating: number;
  content_bg: string;
  content_en?: string;
  is_published: boolean;
}

export default function CreateTestimonialPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TestimonialData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Неуспешно създаване на отзив");
      }

      // Redirect to testimonials list on success
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      console.error("Error creating testimonial:", err);
      setError(err instanceof Error ? err.message : "Грешка при създаване на отзив");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Добави нов отзив</h1>
          <p className="text-gray-600 mt-2">
            Създайте нов отзив от клиент
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <TestimonialForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

