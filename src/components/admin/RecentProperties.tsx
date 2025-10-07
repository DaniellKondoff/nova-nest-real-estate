"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { formatTimeAgo, getStatusBadgeClasses } from "@/lib/utils";
import { Home, ArrowRight, Image as ImageIcon } from "lucide-react";

interface Property {
  id: number;
  title_bg: string;
  price_eur: number | null;
  price_bgn: number | null;
  status: "available" | "under_offer" | "sold" | "rented" | "archived";
  created_at: string;
  primary_image: {
    url: string;
    alt_text_bg: string | null;
  }[];
}

interface RecentPropertiesProps {
  limit?: number;
}

export function RecentProperties({ limit = 10 }: RecentPropertiesProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();

        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(`
            id,
            title_bg,
            price_eur,
            price_bgn,
            status,
            created_at,
            primary_image:property_images!inner(
              url,
              alt_text_bg
            )
          `)
          .eq("property_images.is_primary", true)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (fetchError) {
          throw fetchError;
        }

        setProperties(data || []);
      } catch (err) {
        console.error("Error fetching recent properties:", err);
        setError("Грешка при зареждане на имотите");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProperties();
  }, [limit]);

  const handlePropertyClick = (propertyId: number) => {
    router.push(`/admin/properties/${propertyId}/edit`);
  };

  const handleViewAll = () => {
    router.push("/admin/properties");
  };

  const formatPrice = (priceEur: number | null, priceBgn: number | null): string => {
    if (priceEur) {
      return `${priceEur.toLocaleString('bg-BG')} €`;
    } else if (priceBgn) {
      return `${priceBgn.toLocaleString('bg-BG')} лв`;
    }
    return "Цена по договаряне";
  };

  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Достъпен';
      case 'under_offer':
        return 'Под оферта';
      case 'sold':
        return 'Продаден';
      case 'rented':
        return 'Отдаден';
      case 'archived':
        return 'Архивиран';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Home className="h-5 w-5 mr-2 text-gray-600" />
            Последни имоти
          </h3>
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center py-3">
                <div className="w-15 h-15 bg-gray-200 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              {i < 2 && <div className="border-b border-gray-100"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Home className="h-5 w-5 mr-2 text-gray-600" />
            Последни имоти
          </h3>
        </div>
        
        <div className="text-center py-6">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Home className="h-5 w-5 mr-2 text-gray-600" />
          Последни имоти
        </h3>
        
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
        >
          Виж всички
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="text-center py-6">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Няма добавени имоти</p>
        </div>
      ) : (
        <div className="space-y-0">
          {properties.map((property, index) => (
            <div key={property.id}>
              <button
                onClick={() => handlePropertyClick(property.id)}
                className="w-full text-left hover:bg-gray-50 transition-colors duration-150 py-3 px-0"
              >
                <div className="flex items-center">
                  {/* Property Image */}
                  <div className="flex-shrink-0 mr-3">
                    {property.primary_image && property.primary_image.length > 0 ? (
                      <img
                        src={property.primary_image[0].url}
                        alt={property.primary_image[0].alt_text_bg || property.title_bg}
                        className="w-15 h-15 rounded object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-15 h-15 rounded bg-gray-100 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-15 h-15 rounded bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="flex-1 min-w-0">
                    {/* Property Title */}
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {property.title_bg}
                    </p>
                    
                    {/* Price and Date */}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-green-600">
                        {formatPrice(property.price_eur, property.price_bgn)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(property.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="ml-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(property.status)}`}>
                      {getStatusDisplayName(property.status)}
                    </span>
                  </div>
                </div>
              </button>
              
              {/* Border between items */}
              {index < properties.length - 1 && (
                <div className="border-b border-gray-100"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
