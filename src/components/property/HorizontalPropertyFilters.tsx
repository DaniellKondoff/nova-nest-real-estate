"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, MapPin, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import type { PropertySearchFilters } from "@/types/property";
import type { PropertyFeature } from "@/hooks/usePropertyFeatures";
import type { PropertyCategory } from "@/hooks/usePropertyCategories";
import type { Neighborhood } from "@/hooks/useNeighborhoods";
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
  neighborhoods: Neighborhood[];
  features?: PropertyFeature[];
  totalResults?: number;
}

export default function HorizontalPropertyFilters({ 
  initialFilters, 
  onFilterChange, 
  categories, 
  neighborhoods,
  features = [],
  totalResults = 0 
}: HorizontalPropertyFiltersProps): React.ReactElement {
  // Based on actual database data: min €150, max €116,319
  const [priceRange, setPriceRange] = React.useState<[number, number]>([150, 120000]);
  // Based on actual database data: min 20 sqm, max 56 sqm (but we'll use realistic ranges)
  const [areaRange, setAreaRange] = React.useState<[number, number]>([20, 300]);
  const [floorRange, setFloorRange] = React.useState<[number, number]>([0, 10]);
  const [selectedFeatures, setSelectedFeatures] = React.useState<number[]>([]);

  const form = useForm<PropertySearchData>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur ?? 150,
      maxPrice: initialFilters?.maxPriceEur ?? 120000,
      minArea: initialFilters?.minArea ?? 20,
      maxArea: initialFilters?.maxArea ?? 300,
    },
  });

  // Keep form in sync with initialFilters
  React.useEffect(() => {
    form.reset({
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur ?? 150,
      maxPrice: initialFilters?.maxPriceEur ?? 120000,
      minArea: initialFilters?.minArea ?? 20,
      maxArea: initialFilters?.maxArea ?? 300,
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
      operationType: values.operationType as PropertySearchFilters["operationType"],
      categoryId: values.categoryId,
      neighborhoodId: values.neighborhoodId,
      minPriceEur: values.minPrice,
      maxPriceEur: values.maxPrice,
      minArea: values.minArea,
      maxArea: values.maxArea,
      featureIds: selectedFeatures.length > 0 ? selectedFeatures : undefined,
    };
    onFilterChange(applied);
  }

  function clearFilters() {
    form.reset({
      operationType: undefined,
      categoryId: undefined,
      neighborhoodId: undefined,
      minPrice: 150,
      maxPrice: 120000,
      minArea: 20,
      maxArea: 300,
    });
    setPriceRange([150, 120000]);
    setAreaRange([20, 300]);
    setFloorRange([0, 10]);
    setSelectedFeatures([]);
    onFilterChange({});
  }

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Filters */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#1a2642] mb-3">Основни критерии</h4>
              
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

              {/* Rooms */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Стаи
                </label>
                <Select
                  options={[
                    { value: "1", label: "1 стая" },
                    { value: "2", label: "2 стаи" },
                    { value: "3", label: "3 стаи" },
                    { value: "4", label: "4+ стаи" }
                  ]}
                  placeholder="Брой стаи"
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
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Ценова граница (€)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">От</label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={priceRange[0] === 150 ? "" : priceRange[0]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 150;
                        const newRange: [number, number] = [value, priceRange[1]];
                        setPriceRange(newRange);
                        form.setValue("minPrice", value);
                      }}
                      className="h-10"
                      min={150}
                      max={120000}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">До</label>
                    <Input
                      type="number"
                      placeholder="120000"
                      value={priceRange[1] === 120000 ? "" : priceRange[1]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 120000;
                        const newRange: [number, number] = [priceRange[0], value];
                        setPriceRange(newRange);
                        form.setValue("maxPrice", value);
                      }}
                      className="h-10"
                      min={150}
                      max={120000}
                    />
                  </div>
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Площ (кв.м)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">От</label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={areaRange[0] === 20 ? "" : areaRange[0]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 20;
                        const newRange: [number, number] = [value, areaRange[1]];
                        setAreaRange(newRange);
                        form.setValue("minArea", value);
                      }}
                      className="h-10"
                      min={20}
                      max={300}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">До</label>
                    <Input
                      type="number"
                      placeholder="300"
                      value={areaRange[1] === 300 ? "" : areaRange[1]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 300;
                        const newRange: [number, number] = [areaRange[0], value];
                        setAreaRange(newRange);
                        form.setValue("maxArea", value);
                      }}
                      className="h-10"
                      min={20}
                      max={300}
                    />
                  </div>
                </div>
              </div>

              {/* Floor Range */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Етаж
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">От</label>
                    <Input
                      type="number"
                      placeholder="0 (Партер)"
                      value={floorRange[0] === 0 ? "" : floorRange[0]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 0;
                        const newRange: [number, number] = [value, floorRange[1]];
                        setFloorRange(newRange);
                      }}
                      className="h-10"
                      min={0}
                      max={10}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">До</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={floorRange[1] === 10 ? "" : floorRange[1]}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : 10;
                        const newRange: [number, number] = [floorRange[0], value];
                        setFloorRange(newRange);
                      }}
                      className="h-10"
                      min={0}
                      max={10}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span>0 = Партер, 1-10 = Етажи</span>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-[#1a2642] mb-3">Допълнителни характеристики</h4>
              

              {/* Property Features */}
              <div>
                <label className="block text-sm font-medium text-[#1a2642] mb-2">
                  Характеристики
                </label>
                <div className="space-y-4 text-sm max-h-48 overflow-y-auto">
                  {(() => {
                    // Group features by category
                    const groupedFeatures = features.reduce((acc, feature) => {
                      if (!acc[feature.category]) {
                        acc[feature.category] = [];
                      }
                      acc[feature.category].push(feature);
                      return acc;
                    }, {} as Record<string, typeof features>);

                    // Category labels in Bulgarian
                    const categoryLabels = {
                      interior: "Интериор",
                      exterior: "Екстериор", 
                      building: "Сграда",
                      location: "Локация",
                      buildingType: "Тип сграда"
                    };

                    return Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                      <div key={category} className="space-y-2">
                        <h5 className="text-xs font-semibold text-[#1a2642] uppercase tracking-wide border-b border-[#1a2642]/10 pb-1">
                          {categoryLabels[category as keyof typeof categoryLabels] || category}
                        </h5>
                        <div className="space-y-1 pl-2">
                          {categoryFeatures.map((feature) => (
                            <label key={feature.id} className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                className="rounded border-[#1a2642]/20 text-[#d4af37] focus:ring-[#d4af37]"
                                checked={selectedFeatures.includes(feature.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFeatures([...selectedFeatures, feature.id]);
                                  } else {
                                    setSelectedFeatures(selectedFeatures.filter(id => id !== feature.id));
                                  }
                                }}
                              />
                              <span className="text-[#1a2642] text-xs">{feature.name_bg}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[#1a2642]/10">
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
