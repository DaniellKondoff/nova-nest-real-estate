"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import { getAllNeighborhoods } from "@/lib/queries/neighborhoods";
import { getAllPropertyFeatures } from "@/lib/queries/features";
import type { PropertyCategory } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import type { Tables } from "@/types/database.generated";

type PropertyFeature = Tables<"property_features">;

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<StaraZagoraNeighborhood[]>([]);
  const [features, setFeatures] = useState<PropertyFeature[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories, neighborhoods, and features on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, neighborhoodsData, featuresData] = await Promise.all([
          getAllPropertyCategories(),
          getAllNeighborhoods(),
          getAllPropertyFeatures(),
        ]);
        setCategories(categoriesData);
        setNeighborhoods(neighborhoodsData);
        setFeatures(featuresData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Грешка при зареждането на данните");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to create property
      console.log("Form data:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirect to properties list on success
      router.push("/admin/properties/");
    } catch (error) {
      console.error("Error creating property:", error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <span className="ml-3 text-gray-600">Зареждане...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Опитайте отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link
          href="/admin/dashboard/"
          className="hover:text-[#D4AF37] transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/admin/properties/"
          className="hover:text-[#D4AF37] transition-colors"
        >
          Імоти
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Добави</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Добави нов имот</h1>
        <p className="mt-2 text-gray-600">
          Попълнете информацията за новия имот
        </p>
      </div>

      {/* Property Form */}
      <PropertyForm
        categories={categories}
        neighborhoods={neighborhoods}
        features={features}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

