"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import type { PropertyCategory } from "@/types/property";

interface PropertiesSearchBarProps {
  onSearch: (term: string) => void;
  onCategoryFilter: (categoryId: string | null) => void;
  onStatusFilter: (status: string | null) => void;
  categories: PropertyCategory[];
}

export default function PropertiesSearchBar({
  onSearch,
  onCategoryFilter,
  onStatusFilter,
  categories,
}: PropertiesSearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCategoryFilter(value === "" ? null : value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onStatusFilter(value === "" ? null : value);
  };

  const handleAddProperty = () => {
    router.push("/admin/properties/create");
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търсене по заглавие или адрес..."
            className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            onChange={handleCategoryChange}
            className="block w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
          >
            <option value="">Всички категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_bg}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            onChange={handleStatusChange}
            className="block w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
          >
            <option value="">Всички</option>
            <option value="available">Налични</option>
            <option value="sold">Продадени</option>
            <option value="rented">Под наем</option>
            <option value="draft">Чернова</option>
          </select>
        </div>

        {/* Add Property Button */}
        <button
          onClick={handleAddProperty}
          className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-[#D4AF37] text-white font-medium rounded-md hover:bg-[#B8941F] transition-colors whitespace-nowrap md:ml-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Добави имот</span>
        </button>
      </div>
    </div>
  );
}

