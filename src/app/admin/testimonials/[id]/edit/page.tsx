"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";

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

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch(`/api/admin/testimonials/${id}`);
        
        if (!response.ok) {
          throw new Error("Отзивът не е намерен");
        }

        const data = await response.json();
        setTestimonial(data);
      } catch (err) {
        console.error("Error fetching testimonial:", err);
        setError(err instanceof Error ? err.message : "Грешка при зареждане на отзив");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonial();
  }, [id]);

  const handleSubmit = async (data: TestimonialData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Неуспешно обновяване на отзив");
      }

      // Redirect to testimonials list on success
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      console.error("Error updating testimonial:", err);
      setError(err instanceof Error ? err.message : "Грешка при обновяване на отзив");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !testimonial) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!testimonial) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Редактирай отзив</h1>
          <p className="text-gray-600 mt-2">
            Редактирайте отзив от {testimonial.client_name}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <TestimonialForm 
          initialData={testimonial} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

