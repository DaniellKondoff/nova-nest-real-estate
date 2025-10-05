"use client";

import { useState, useEffect } from "react";
import { Eye, TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.generated";

interface PropertyViewStats {
  id: number;
  title_bg: string;
  view_count: number | null;
  last_viewed_at: string | null;
  created_at: string;
  status: string;
  category_name?: string;
  neighborhood_name?: string;
}

export default function ViewAnalyticsPage() {
  const [properties, setProperties] = useState<PropertyViewStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"views" | "title" | "date">("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchViewStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();
        
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(`
            id,
            title_bg,
            view_count,
            last_viewed_at,
            created_at,
            status,
            category:property_categories(name_bg),
            neighborhood:neighborhoods(name_bg)
          `)
          .neq("status", "archived")
          .order("view_count", { ascending: false });

        if (fetchError) throw fetchError;

        const transformedData: PropertyViewStats[] = (data || []).map((item: any) => ({
          id: item.id,
          title_bg: item.title_bg,
          view_count: item.view_count,
          last_viewed_at: item.last_viewed_at,
          created_at: item.created_at,
          status: item.status,
          category_name: item.category?.name_bg,
          neighborhood_name: item.neighborhood?.name_bg,
        }));

        setProperties(transformedData);
      } catch (err) {
        console.error("Error fetching view stats:", err);
        setError("Грешка при зареждане на статистиките за прегледи.");
      } finally {
        setLoading(false);
      }
    };

    fetchViewStats();
  }, []);

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case "views":
        aValue = a.view_count || 0;
        bValue = b.view_count || 0;
        break;
      case "title":
        aValue = a.title_bg.toLowerCase();
        bValue = b.title_bg.toLowerCase();
        break;
      case "date":
        aValue = new Date(a.last_viewed_at || a.created_at);
        bValue = new Date(b.last_viewed_at || b.created_at);
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate statistics
  const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const avgViews = properties.length > 0 ? Math.round(totalViews / properties.length) : 0;
  const mostViewed = properties.reduce((max, p) => 
    (p.view_count || 0) > (max.view_count || 0) ? p : max, 
    properties[0] || { view_count: 0 }
  );
  const propertiesWithViews = properties.filter(p => (p.view_count || 0) > 0).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Никога";
    return new Date(dateString).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatViewCount = (count: number | null) => {
    const num = count || 0;
    if (num === 0) return "0";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Анализ на прегледи</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          <span className="ml-3 text-gray-600">Зареждане...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Анализ на прегледи</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-[#D4AF37]" />
        Анализ на прегледи
      </h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Общо прегледи</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgViews}</div>
              <div className="text-sm text-gray-600">Средно прегледи</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{propertiesWithViews}</div>
              <div className="text-sm text-gray-600">Имоти с прегледи</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatViewCount(mostViewed.view_count)}</div>
              <div className="text-sm text-gray-600">Най-гледан имот</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Сортирай по:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="views">Прегледи</option>
            <option value="title">Заглавие</option>
            <option value="date">Дата</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="desc">Низходящо</option>
            <option value="asc">Възходящо</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имот
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Квартал
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Прегледи
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Последен преглед
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {property.title_bg}
                    </div>
                    <div className="text-sm text-gray-500">ID: {property.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.category_name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.neighborhood_name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatViewCount(property.view_count)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(property.last_viewed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.status === "available" ? "bg-green-100 text-green-800" :
                      property.status === "sold" ? "bg-red-100 text-red-800" :
                      property.status === "rented" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {property.status === "available" ? "Наличен" :
                       property.status === "sold" ? "Продаден" :
                       property.status === "rented" ? "Отдаден" :
                       property.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Няма данни за прегледи</h3>
          <p className="mt-1 text-sm text-gray-500">
            Прегледите ще се покажат тук, когато потребители започнат да гледат имотите.
          </p>
        </div>
      )}
    </div>
  );
}
