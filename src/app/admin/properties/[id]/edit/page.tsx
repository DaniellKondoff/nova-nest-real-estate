"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import { getAllNeighborhoods } from "@/lib/queries/neighborhoods";
import { getAllPropertyFeatures } from "@/lib/queries/features";
import { getPropertyById } from "@/lib/queries/properties";
import type { PropertyCategory, PropertyWithDetails } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import type { Tables } from "@/types/database.generated";

type PropertyFeature = Tables<"property_features">;

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = parseInt(params.id as string);

  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<StaraZagoraNeighborhood[]>([]);
  const [features, setFeatures] = useState<PropertyFeature[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertyData, categoriesData, neighborhoodsData, featuresData] =
          await Promise.all([
            getPropertyById(propertyId),
            getAllPropertyCategories(),
            getAllNeighborhoods(),
            getAllPropertyFeatures(),
          ]);

        if (!propertyData) {
          setError("Имотът не е намерен");
          return;
        }

        // Transform PropertyWithRelations to PropertyWithDetails
        const propertyWithDetails: PropertyWithDetails = {
          property: propertyData as any, // Cast to the properties table type
          neighborhood: null, // Will be fetched separately if needed
          category: null, // Will be fetched separately if needed
          images: propertyData.images || [],
          features: propertyData.features || [], // Use the features from the query
        };

        setProperty(propertyWithDetails);
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
  }, [propertyId]);

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

  // Show error state (404)
  if (error || !property) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || "Имотът не е намерен"}</p>
          <Link
            href="/admin/properties/"
            className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
          >
            Към списъка с имоти
          </Link>
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
        <span className="text-gray-900 font-medium">Редактирай</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Редактирай имот</h1>
        <p className="mt-2 text-gray-600">
          {property.property.title_bg}
        </p>
      </div>

      {/* Property Form */}
      <PropertyForm
        initialData={property}
        categories={categories}
        neighborhoods={neighborhoods}
        features={features}
        submitLabel="Запази промените"
      />
    </div>
  );
}

