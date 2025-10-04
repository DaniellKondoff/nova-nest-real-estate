"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search as SearchIcon, Filter, MapPin, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/slider";
import type { PropertyCategory, PropertySearchFilters } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import { PropertySearchSchema } from "@/lib/validations";
import { cn } from "@/lib/design-tokens";
import type { z } from "zod";

// Make all fields optional for the draft form state
const FormSchema = PropertySearchSchema.partial();
type PropertySearchData = Omit<z.infer<typeof FormSchema>, "operationType"> & { operationType?: unknown };

export interface HorizontalPropertyFiltersProps {
  initialFilters?: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
  categories: PropertyCategory[];
  neighborhoods: StaraZagoraNeighborhood[];
  totalResults?: number;
}

export default function HorizontalPropertyFilters({ 
  initialFilters, 
  onFilterChange, 
  categories, 
  neighborhoods,
  totalResults = 0 
}: HorizontalPropertyFiltersProps): React.ReactElement {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([50000, 500000]);
  const [areaRange, setAreaRange] = React.useState<[number, number]>([30, 200]);

  const form = useForm<PropertySearchData>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      searchTerm: initialFilters?.searchTerm ?? "",
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur ?? 50000,
      maxPrice: initialFilters?.maxPriceEur ?? 500000,
      minArea: initialFilters?.minArea ?? 30,
      maxArea: initialFilters?.maxArea ?? 200,
    },
  });

  // Keep form in sync with initialFilters
  React.useEffect(() => {
    form.reset({
      searchTerm: initialFilters?.searchTerm ?? "",
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur ?? 50000,
      maxPrice: initialFilters?.maxPriceEur ?? 500000,
      minArea: initialFilters?.minArea ?? 30,
      maxArea: initialFilters?.maxArea ?? 200,
    });
    
    if (initialFilters?.minPriceEur && initialFilters?.maxPriceEur) {
      setPriceRange([initialFilters.minPriceEur, initialFilters.maxPriceEur]);
    }
    if (initialFilters?.minArea && initialFilters?.maxArea) {
      setAreaRange([initialFilters.minArea, initialFilters.maxArea]);
    }
  }, [form, initialFilters]);

  // Build dropdown options
  const categoryOptions = React.useMemo(() => 
    categories.map((c) => ({ value: c.id.toString(), label: c.name_bg })), 
    [categories]
  );
  const neighborhoodOptions = React.useMemo(() => 
    neighborhoods.map((n) => ({ value: n.id.toString(), label: n.name_bg })), 
    [neighborhoods]
  );

  function applyFilters() {
    const values = form.getValues();
    const applied: PropertySearchFilters = {
      searchTerm: values.searchTerm?.trim() || undefined,
      operationType: values.operationType as PropertySearchFilters["operationType"],
      categoryId: values.categoryId,
      neighborhoodId: values.neighborhoodId,
      minPriceEur: values.minPrice,
      maxPriceEur: values.maxPrice,
      minArea: values.minArea,
      maxArea: values.maxArea,
    };
    onFilterChange(applied);
  }

  function clearFilters() {
    form.reset({
      searchTerm: "",
      operationType: undefined,
      categoryId: undefined,
      neighborhoodId: undefined,
      minPrice: 50000,
      maxPrice: 500000,
      minArea: 30,
      maxArea: 200,
    });
    setPriceRange([50000, 500000]);
    setAreaRange([30, 200]);
    onFilterChange({});
  }

  const searchTerm = form.watch("searchTerm");
  const operationType = form.watch("operationType");
  const categoryId = form.watch("categoryId");
  const neighborhoodId = form.watch("neighborhoodId");

  return (
    <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2642] mb-4">
            Разширена търсачка
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Използвайте детайлните филтри за да намерите точно това, което търсите
          </p>
        </div>

        <Card className="p-6 shadow-lg bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-[#d4af37] to-[#b8960e] rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1a2642]">Детайлни филтри</h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Basic Filters */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#1a2642] mb-3">Основни критерии</h4>
              
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  <SearchIcon className="w-4 h-4 inline mr-1" />
                  Търсене
                </label>
                <Input
                  placeholder="Търсене по ключова дума..."
                  value={searchTerm ?? ""}
                  onChange={(e) => form.setValue("searchTerm", e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  Тип имот
                </label>
                <Select
                  options={categoryOptions}
                  value={categoryId?.toString() || ""}
                  onChange={(value) => form.setValue("categoryId", value ? Number(value) : undefined)}
                  placeholder="Избери тип"
                />
              </div>

              {/* Operation Type */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Операция
                </label>
                <Select
                  options={[
                    { value: "sale", label: "Продажба" },
                    { value: "rent", label: "Наем" }
                  ]}
                  value={operationType?.toString() || ""}
                  onChange={(value) => form.setValue("operationType", value || undefined)}
                  placeholder="Купуване/Наем"
                />
              </div>

              {/* Neighborhood */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Район
                </label>
                <Select
                  options={neighborhoodOptions}
                  value={neighborhoodId?.toString() || ""}
                  onChange={(value) => form.setValue("neighborhoodId", value ? Number(value) : undefined)}
                  placeholder="Избери район"
                />
              </div>
            </div>

            {/* Price & Size */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#1a2642] mb-3">Цена и размер</h4>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-3">
                  Ценова граница: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} €
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    form.setValue("minPrice", value[0]);
                    form.setValue("maxPrice", value[1]);
                  }}
                  max={500000}
                  min={50000}
                  step={10000}
                  className="w-full"
                />
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-3">
                  Площ: {areaRange[0]} - {areaRange[1]} кв.м
                </label>
                <Slider
                  value={areaRange}
                  onValueChange={(value) => {
                    setAreaRange(value as [number, number]);
                    form.setValue("minArea", value[0]);
                    form.setValue("maxArea", value[1]);
                  }}
                  max={200}
                  min={30}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#1a2642] mb-3">Допълнителни характеристики</h4>
              
              {/* Room Count */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Минимални стаи
                </label>
                <Select
                  options={[
                    { value: "1", label: "1+" },
                    { value: "2", label: "2+" },
                    { value: "3", label: "3+" },
                    { value: "4", label: "4+" }
                  ]}
                  placeholder="Брой"
                />
              </div>

              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Етаж
                </label>
                <Select
                  options={[
                    { value: "ground", label: "Партер" },
                    { value: "1-3", label: "1-3 етаж" },
                    { value: "4-6", label: "4-6 етаж" },
                    { value: "7+", label: "7+ етаж" }
                  ]}
                  placeholder="Избери"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Състояние
                </label>
                <Select
                  options={[
                    { value: "new", label: "Ново строителство" },
                    { value: "excellent", label: "Отличо" },
                    { value: "very-good", label: "Много добро" },
                    { value: "good", label: "Добро" },
                    { value: "needs-repair", label: "За ремонт" }
                  ]}
                  placeholder="Избери състояние"
                />
              </div>

              {/* Additional Features */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Допълнителни удобства
                </label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-[#1a2642]/20" />
                    Асансьор
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-[#1a2642]/20" />
                    Тераса/Балкон
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-[#1a2642]/20" />
                    Двор/Градина
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-[#1a2642]/20" />
                    Мазе/Таван
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-[#1a2642]/10">
            <Button 
              variant="secondary" 
              className="flex-1 h-12"
              onClick={clearFilters}
            >
              Изчисти филтри
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              className="flex-1 h-12 bg-gradient-to-r from-[#d4af37] to-[#b8960e] hover:from-[#b8960e] hover:to-[#a0851a] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              leftIcon={<SearchIcon className="w-5 h-5" />}
              onClick={applyFilters}
            >
              Търси с филтри ({totalResults} резултата)
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
