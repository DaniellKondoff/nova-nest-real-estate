"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, Search as SearchIcon, X } from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import PriceRangeInput from "@/components/ui/PriceRangeInput";
import RoomSelector from "@/components/ui/RoomSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PropertyCategory, PropertySearchFilters } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import { PropertySearchSchema } from "@/lib/validations";
import { cn } from "@/lib/design-tokens";
import type { z } from "zod";

// Make all fields optional for the draft form state (operationType optional)
const FormSchema = PropertySearchSchema.partial();
type PropertySearchData = Omit<z.infer<typeof FormSchema>, "operationType"> & { operationType?: unknown };

export interface PropertyFiltersProps {
  initialFilters?: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
  categories: PropertyCategory[];
  neighborhoods: StaraZagoraNeighborhood[];
}

// Debounce utility
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function PropertyFilters({ initialFilters, onFilterChange, categories, neighborhoods }: PropertyFiltersProps): React.ReactElement {
  // Draft state mirrors form; applied state is sent to parent on Apply
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = React.useState<number[]>([]);
  const [selectedRooms, setSelectedRooms] = React.useState<number[]>([]);

  const form = useForm<PropertySearchData>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      searchTerm: initialFilters?.searchTerm ?? "",
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur,
      maxPrice: initialFilters?.maxPriceEur,
      minArea: initialFilters?.minArea,
      maxArea: initialFilters?.maxArea,
    },
  });

  // Keep local draft in sync when initialFilters change externally (e.g., via URL back/forward)
  React.useEffect(() => {
    form.reset({
      searchTerm: initialFilters?.searchTerm ?? "",
      operationType: initialFilters?.operationType ?? undefined,
      categoryId: initialFilters?.categoryId,
      neighborhoodId: initialFilters?.neighborhoodId,
      minPrice: initialFilters?.minPriceEur,
      maxPrice: initialFilters?.maxPriceEur,
      minArea: initialFilters?.minArea,
      maxArea: initialFilters?.maxArea,
    });
    setSelectedCategories(initialFilters?.categoryId ? [initialFilters.categoryId] : []);
    setSelectedNeighborhoods(initialFilters?.neighborhoodId ? [initialFilters.neighborhoodId] : []);
  }, [form, initialFilters?.searchTerm, initialFilters?.operationType, initialFilters?.categoryId, initialFilters?.neighborhoodId, initialFilters?.minPriceEur, initialFilters?.maxPriceEur, initialFilters?.minArea, initialFilters?.maxArea]);

  // Sync multi-selects from initialFilters (if provided as single ids)
  React.useEffect(() => {
    if (initialFilters?.categoryId) setSelectedCategories([initialFilters.categoryId]);
    if (initialFilters?.neighborhoodId) setSelectedNeighborhoods([initialFilters.neighborhoodId]);
  }, [initialFilters?.categoryId, initialFilters?.neighborhoodId]);

  // Debounced search term to reduce re-renders
  const searchTerm = form.watch("searchTerm");
  const debouncedSearch = useDebounced(searchTerm, 500);
  React.useEffect(() => {
    if (searchTerm !== debouncedSearch) return; // guard
    // no-op: draft state already managed by RHF; apply happens on button
  }, [debouncedSearch, searchTerm]);

  // Validation states
  const minPrice = form.watch("minPrice");
  const maxPrice = form.watch("maxPrice");
  const minArea = form.watch("minArea");
  const maxArea = form.watch("maxArea");
  const priceInvalid = minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice;
  const areaInvalid = minArea !== undefined && maxArea !== undefined && minArea > maxArea;
  const isInvalid = priceInvalid || areaInvalid;

  // Build dropdown options
  const categoryOptions = React.useMemo(() => categories.map((c) => ({ value: c.id, label: c.name_bg })), [categories]);
  const neighborhoodOptions = React.useMemo(() => neighborhoods.map((n) => ({ value: n.id, label: n.name_bg })), [neighborhoods]);

  function applyFilters() {
    const values = form.getValues();
    const applied: PropertySearchFilters = {
      searchTerm: values.searchTerm?.trim() || undefined,
      operationType: values.operationType as PropertySearchFilters["operationType"],
      categoryId: selectedCategories[0],
      neighborhoodId: selectedNeighborhoods[0],
      minPriceEur: values.minPrice,
      maxPriceEur: values.maxPrice,
      minArea: values.minArea,
      maxArea: values.maxArea,
    };
    onFilterChange(applied);
    setIsOpen(false);
  }

  function clearAll() {
    form.reset({
      searchTerm: "",
      operationType: undefined,
      categoryId: undefined,
      neighborhoodId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
    });
    setSelectedCategories([]);
    setSelectedNeighborhoods([]);
    setSelectedRooms([]);
    onFilterChange({});
  }

  // Desktop sticky sidebar
  const sidebar = (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Search */}
        <div>
          <div className="mb-3 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>Търсене</div>
          <Input
            placeholder="Търсене по ключова дума..."
            leftIcon={<SearchIcon className="h-4 w-4" />}
            value={searchTerm ?? ""}
            onChange={(e) => form.setValue("searchTerm", e.target.value)}
            aria-label="Търсене по ключова дума"
            className="h-10"
          />
        </div>

        {/* Operation Type */}
        <div>
          <div className="mb-3 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>Вид операция</div>
          <div className="flex items-center gap-2">
            {[
              { label: "Всички", value: undefined },
              { label: "Продажба", value: "sale" },
              { label: "Наем", value: "rent" },
            ].map((opt) => {
              const isActive = form.watch("operationType") === opt.value || (opt.value === undefined && !form.watch("operationType"));
              return (
                <button
                  key={String(opt.label)}
                  type="button"
                  className={cn(
                    "h-10 rounded-lg border px-4 text-sm font-medium focus:outline-none focus-visible:ring-2",
                    isActive
                      ? "border-[#d4af37] bg-[#d4af37] text-white hover:bg-[#b8960e] focus-visible:ring-[#d4af37]"
                      : "border-gray-200 bg-white text-[#2d3748] hover:bg-gray-50 focus-visible:ring-[#d4af37]"
                  )}
                  onClick={() => form.setValue("operationType", opt.value as unknown)}
                  aria-pressed={isActive}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <FilterDropdown
          label="Тип имот"
          options={categoryOptions}
          selected={selectedCategories}
          onChange={(vals) => setSelectedCategories(vals.map(Number))}
          placeholder="Изберете тип..."
        />

        {/* Neighborhood */}
        <FilterDropdown
          label="Квартал"
          options={neighborhoodOptions}
          selected={selectedNeighborhoods}
          onChange={(vals) => setSelectedNeighborhoods(vals.map(Number))}
          placeholder="Изберете квартал..."
        />

        {/* Price Range */}
        <PriceRangeInput
          label="Ценови диапазон"
          suffix="€"
          value={{ min: minPrice, max: maxPrice }}
          onChange={(next) => {
            form.setValue("minPrice", next.min);
            form.setValue("maxPrice", next.max);
          }}
          ariaDescribedBy="price-error"
        />
        {priceInvalid && (
          <p id="price-error" className="-mt-2 text-xs text-[#ef4444]" role="alert">
            Минималната цена не може да е по-голяма от максималната.
          </p>
        )}

        {/* Area Range */}
        <PriceRangeInput
          label="Площ"
          suffix="m²"
          value={{ min: minArea, max: maxArea }}
          onChange={(next) => {
            form.setValue("minArea", next.min);
            form.setValue("maxArea", next.max);
          }}
          ariaDescribedBy="area-error"
        />
        {areaInvalid && (
          <p id="area-error" className="-mt-2 text-xs text-[#ef4444]" role="alert">
            Минималната площ не може да е по-голяма от максималната.
          </p>
        )}

        {/* Rooms */}
        <RoomSelector selected={selectedRooms} onChange={setSelectedRooms} />

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            className="px-6 py-3"
            onClick={applyFilters}
            disabled={isInvalid}
          >
            Приложи
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-6 py-3"
            onClick={clearAll}
          >
            Изчисти
          </Button>
        </div>
      </div>
    </aside>
  );

  // Mobile dialog
  const mobile = (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-4 lg:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setIsOpen(true)}
          leftIcon={<Filter className="h-4 w-4" />}
          id="filters-toggle"
        >
          Филтри
        </Button>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-[90%] max-w-sm translate-x-0 bg-white p-6 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
          aria-label="Филтри"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-medium" style={{ color: "#1a2642" }}>Филтри</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Затвори" className="rounded p-2 text-[#2d3748] hover:bg-gray-50">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex h-[calc(100vh-8rem)] flex-col justify-between">
            <div className="space-y-6 overflow-auto pr-1">
              {/* Search */}
              <div>
                <div className="mb-3 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>Търсене</div>
                <Input
                  placeholder="Търсене по ключова дума..."
                  leftIcon={<SearchIcon className="h-4 w-4" />}
                  value={searchTerm ?? ""}
                  onChange={(e) => form.setValue("searchTerm", e.target.value)}
                  aria-label="Търсене по ключова дума"
                  className="h-10"
                />
              </div>

              {/* Operation Type */}
              <div>
                <div className="mb-3 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>Вид операция</div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Всички", value: undefined },
                    { label: "Продажба", value: "sale" },
                    { label: "Наем", value: "rent" },
                  ].map((opt) => {
                    const isActive = form.watch("operationType") === opt.value || (opt.value === undefined && !form.watch("operationType"));
                    return (
                      <button
                        key={String(opt.label)}
                        type="button"
                        className={cn(
                          "h-10 rounded-lg border px-4 text-sm font-medium focus:outline-none focus-visible:ring-2",
                          isActive
                            ? "border-[#d4af37] bg-[#d4af37] text-white hover:bg-[#b8960e] focus-visible:ring-[#d4af37]"
                            : "border-gray-200 bg-white text-[#2d3748] hover:bg-gray-50 focus-visible:ring-[#d4af37]"
                        )}
                        onClick={() => form.setValue("operationType", opt.value as unknown)}
                        aria-pressed={isActive}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <FilterDropdown
                label="Тип имот"
                options={categoryOptions}
                selected={selectedCategories}
                onChange={(vals) => setSelectedCategories(vals.map(Number))}
                placeholder="Изберете тип..."
              />

              {/* Neighborhood */}
              <FilterDropdown
                label="Квартал"
                options={neighborhoodOptions}
                selected={selectedNeighborhoods}
                onChange={(vals) => setSelectedNeighborhoods(vals.map(Number))}
                placeholder="Изберете квартал..."
              />

              {/* Price Range */}
              <PriceRangeInput
                label="Ценови диапазон"
                suffix="€"
                value={{ min: minPrice, max: maxPrice }}
                onChange={(next) => {
                  form.setValue("minPrice", next.min);
                  form.setValue("maxPrice", next.max);
                }}
                ariaDescribedBy="price-error-mobile"
              />
              {priceInvalid && (
                <p id="price-error-mobile" className="-mt-2 text-xs text-[#ef4444]" role="alert">
                  Минималната цена не може да е по-голяма от максималната.
                </p>
              )}

              {/* Area Range */}
              <PriceRangeInput
                label="Площ"
                suffix="m²"
                value={{ min: minArea, max: maxArea }}
                onChange={(next) => {
                  form.setValue("minArea", next.min);
                  form.setValue("maxArea", next.max);
                }}
                ariaDescribedBy="area-error-mobile"
              />
              {areaInvalid && (
                <p id="area-error-mobile" className="-mt-2 text-xs text-[#ef4444]" role="alert">
                  Минималната площ не може да е по-голяма от максималната.
                </p>
              )}

              {/* Rooms */}
              <RoomSelector selected={selectedRooms} onChange={setSelectedRooms} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={clearAll} className="px-6 py-3">
                Изчисти
              </Button>
              <Button type="button" variant="primary" onClick={applyFilters} className="px-6 py-3" disabled={isInvalid}>
                Приложи
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return (
    <div aria-label="Филтри за имоти" className="">
      {/* Mobile */}
      {mobile}
      {/* Desktop */}
      {sidebar}
    </div>
  );
}


