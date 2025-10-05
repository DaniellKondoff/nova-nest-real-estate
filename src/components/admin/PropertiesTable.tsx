"use client";

import Image from "next/image";
import { Pencil, Trash2, Eye } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";

interface PropertiesTableProps {
  properties: PropertyWithDetails[];
  selectedIds?: string[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (ids: string[]) => void;
}

export default function PropertiesTable({
  properties,
  selectedIds = [],
  onEdit,
  onDelete,
  onSelect,
}: PropertiesTableProps) {

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked
      ? properties.map((p) => p.property.id.toString())
      : [];
    onSelect?.(newSelectedIds);
  };

  // Handle individual checkbox
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((selectedId) => selectedId !== id);
    onSelect?.(newSelectedIds);
  };

  // Check if all are selected
  const allSelected =
    properties.length > 0 && selectedIds.length === properties.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Format price
  const formatPrice = (priceEur: number | null, priceBgn: number | null) => {
    if (priceEur) {
      return `€${priceEur.toLocaleString("bg-BG")}`;
    }
    if (priceBgn) {
      return `${priceBgn.toLocaleString("bg-BG")} лв`;
    }
    return "—";
  };

  // Format view count
  const formatViewCount = (count: number | null) => {
    if (!count || count === 0) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // Get status badge styling
  const getStatusBadge = (
    status: "available" | "under_offer" | "sold" | "rented" | "archived"
  ) => {
    const statusConfig = {
      available: {
        label: "Наличен",
        className: "bg-green-100 text-green-800",
      },
      under_offer: {
        label: "В процес",
        className: "bg-yellow-100 text-yellow-800",
      },
      sold: {
        label: "Продаден",
        className: "bg-red-100 text-red-800",
      },
      rented: {
        label: "Отдаден",
        className: "bg-blue-100 text-blue-800",
      },
      archived: {
        label: "Архивиран",
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg mb-4">Няма добавени имоти</p>
        <button
          onClick={() => onEdit("new")}
          className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
        >
          Добави имот
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                />
              </th>
              <th className="px-4 py-3 text-left w-20 font-semibold text-gray-700 text-sm">
                Снимка
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-[200px]">
                Заглавие
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm whitespace-nowrap">
                Цена
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Категория
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Квартал
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Статус
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Прегледи
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.map((item) => {
              const id = item.property.id.toString();
              const isSelected = selectedIds.includes(id);
              const primaryImage = item.images.find((img) => img.is_primary);
              const imageUrl =
                primaryImage?.url || item.images[0]?.url || "/images/logo.png";

              return (
                <tr
                  key={id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(id, e.target.checked)}
                      className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-[60px] h-[60px] rounded overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={item.property.title_bg}
                        fill
                        className="object-cover"
                        sizes="60px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                      {item.property.title_bg}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium whitespace-nowrap">
                      {formatPrice(
                        item.property.price_eur,
                        item.property.price_bgn
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">
                      {item.category?.name_bg || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">
                      {item.neighborhood?.name_bg || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(item.property.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">
                        {formatViewCount(item.property.view_count)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(id)}
                        className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37] hover:bg-opacity-10 rounded transition-colors"
                        title="Редактирай"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


