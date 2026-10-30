"use client";

import * as React from "react";
import { Search } from "lucide-react";
import type { PropertySearchFilters } from "@/types/search";
import type { FeatureOption } from "@/lib/queries/features";
import { buildPropertiesHref, PROPERTIES_PATH, urlParamsToFilters } from "@/lib/search/params";
import { cn } from "@/lib/utils";
import { usePropertiesNavigation } from "./PropertiesNavigation";

export interface FilterOption {
  id: number;
  name_bg: string;
}

export interface PropertyFilterFormProps {
  filters: PropertySearchFilters;
  categories: FilterOption[];
  neighborhoods: FilterOption[];
  features?: FeatureOption[];
  /** "bar" = compact desktop row (auto-applies selects); "full" = all fields for the dialog/sheet */
  variant: "bar" | "full";
  id?: string;
  onSubmitted?: () => void;
}

const FEATURE_GROUP_LABELS: Record<string, string> = {
  buildingType: "Тип сграда",
  interior: "Интериор",
  exterior: "Екстериор",
  building: "Сграда",
  location: "Локация",
};
const FEATURE_GROUP_ORDER = ["buildingType", "interior", "exterior", "building", "location"];

export const fieldClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-base text-primary shadow-subtle outline-none transition-colors placeholder:text-gray-500 hover:border-primary/40 focus:border-accent focus:ring-2 focus:ring-accent/30 md:h-11 md:text-[15px]";
const labelClass = "mb-1.5 block text-sm font-medium text-primary";

function OperationToggle({ value, autoSubmit }: { value?: string; autoSubmit: boolean }) {
  const options = [
    { value: "", label: "Всички" },
    { value: "sale", label: "Продажба" },
    { value: "rent", label: "Наем" },
  ];
  return (
    <fieldset className="grid h-12 grid-cols-3 rounded-xl bg-gray-100 p-1 md:h-11">
      <legend className="sr-only">Вид сделка</legend>
      {options.map((o) => (
        <label key={o.value || "all"} className="relative">
          <input
            type="radio"
            name="operation"
            value={o.value}
            defaultChecked={(value ?? "") === o.value}
            className="peer sr-only"
            onChange={autoSubmit ? (e) => e.currentTarget.form?.requestSubmit() : undefined}
          />
          <span className="flex h-full cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold text-charcoal/70 transition-colors peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-subtle peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
            {o.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function RangeInputs({
  label,
  unit,
  minName,
  maxName,
  minValue,
  maxValue,
}: {
  label: string;
  unit: string;
  minName: string;
  maxName: string;
  minValue?: number;
  maxValue?: number;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: minName, value: minValue, placeholder: "От" },
          { name: maxName, value: maxValue, placeholder: "До" },
        ].map((f) => (
          <div key={f.name} className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              name={f.name}
              defaultValue={f.value ?? ""}
              placeholder={f.placeholder}
              aria-label={`${label} – ${f.placeholder.toLowerCase()}`}
              className={cn(fieldClass, "pr-10")}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">{unit}</span>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Property filter form – a native GET form (works without JS) that is enhanced to
 * navigate inside a transition so the server-rendered results update in place.
 */
export default function PropertyFilterForm({
  filters,
  categories,
  neighborhoods,
  features = [],
  variant,
  id,
  onSubmitted,
}: PropertyFilterFormProps) {
  const { navigate } = usePropertiesNavigation();
  const isBar = variant === "bar";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    new FormData(e.currentTarget).forEach((value, key) => {
      if (typeof value === "string" && value.trim() !== "") params.append(key, value.trim());
    });
    navigate(buildPropertiesHref(urlParamsToFilters(params)));
    onSubmitted?.();
  };

  const autoSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isBar) e.currentTarget.form?.requestSubmit();
  };

  const groupedFeatures = React.useMemo(() => {
    const groups = new Map<string, FeatureOption[]>();
    features.forEach((f) => groups.set(f.category, [...(groups.get(f.category) ?? []), f]));
    return FEATURE_GROUP_ORDER.filter((g) => groups.has(g)).map((g) => ({ key: g, items: groups.get(g)! }));
  }, [features]);

  const selectedFeatures = new Set(filters.featureIds ?? []);

  const categorySelect = (
    <div>
      <label htmlFor={`${id ?? variant}-category`} className={isBar ? "sr-only" : labelClass}>
        Тип имот
      </label>
      <select
        id={`${id ?? variant}-category`}
        name="category"
        defaultValue={filters.categoryId ?? ""}
        onChange={autoSubmit}
        className={fieldClass}
      >
        <option value="">Всички типове</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name_bg}
          </option>
        ))}
      </select>
    </div>
  );

  const neighborhoodSelect = (
    <div>
      <label htmlFor={`${id ?? variant}-neighborhood`} className={isBar ? "sr-only" : labelClass}>
        Квартал
      </label>
      <select
        id={`${id ?? variant}-neighborhood`}
        name="neighborhood"
        defaultValue={filters.neighborhoodId ?? ""}
        onChange={autoSubmit}
        className={fieldClass}
      >
        <option value="">Всички квартали</option>
        {neighborhoods.map((n) => (
          <option key={n.id} value={n.id}>
            {n.name_bg}
          </option>
        ))}
      </select>
    </div>
  );

  // Preserve state that this form does not edit
  const hiddenInputs = (
    <>
      {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
      {filters.searchTerm && <input type="hidden" name="search" value={filters.searchTerm} />}
    </>
  );

  if (isBar) {
    return (
      <form
        id={id}
        key={buildPropertiesHref(filters)}
        action={PROPERTIES_PATH}
        method="get"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Филтри за имоти"
        className="grid grid-cols-[minmax(0,15rem)_repeat(2,minmax(0,1fr))_minmax(0,1.3fr)_auto] items-center gap-2"
      >
        {hiddenInputs}
        {/* Keep advanced filters when submitting from the bar */}
        {typeof filters.minArea === "number" && <input type="hidden" name="minArea" value={filters.minArea} />}
        {typeof filters.maxArea === "number" && <input type="hidden" name="maxArea" value={filters.maxArea} />}
        {filters.featureIds?.map((f) => <input key={f} type="hidden" name="features" value={f} />)}

        <OperationToggle value={filters.operationType} autoSubmit />
        {categorySelect}
        {neighborhoodSelect}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            name="minPrice"
            defaultValue={filters.minPriceEur ?? ""}
            placeholder="Цена от €"
            aria-label="Цена от (EUR)"
            className={fieldClass}
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            name="maxPrice"
            defaultValue={filters.maxPriceEur ?? ""}
            placeholder="до €"
            aria-label="Цена до (EUR)"
            className={fieldClass}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Търси
        </button>
      </form>
    );
  }

  return (
    <form
      id={id}
      key={buildPropertiesHref(filters)}
      action={PROPERTIES_PATH}
      method="get"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Филтри за имоти"
      className="space-y-6"
    >
      {hiddenInputs}

      <div>
        <span className={labelClass} id={`${id ?? variant}-operation-label`}>
          Вид сделка
        </span>
        <OperationToggle value={filters.operationType} autoSubmit={false} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categorySelect}
        {neighborhoodSelect}
      </div>

      <RangeInputs
        label="Цена"
        unit="€"
        minName="minPrice"
        maxName="maxPrice"
        minValue={filters.minPriceEur}
        maxValue={filters.maxPriceEur}
      />
      <RangeInputs
        label="Площ"
        unit="m²"
        minName="minArea"
        maxName="maxArea"
        minValue={filters.minArea}
        maxValue={filters.maxArea}
      />

      {groupedFeatures.length > 0 && (
        <fieldset>
          <legend className={labelClass}>Характеристики</legend>
          <div className="space-y-4">
            {groupedFeatures.map((group) => (
              <div key={group.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal/75">
                  {FEATURE_GROUP_LABELS[group.key] ?? group.key}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((f) => (
                    <label key={f.id} className="relative">
                      <input
                        type="checkbox"
                        name="features"
                        value={f.id}
                        defaultChecked={selectedFeatures.has(f.id)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-gray-300 bg-white px-4 text-sm text-charcoal transition-colors hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                        {f.name_bg}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {/* No-JS fallback submit (the dialog footer provides the primary button) */}
      <noscript>
        <button type="submit" className="h-12 w-full rounded-xl bg-accent font-semibold text-primary">
          Покажи резултатите
        </button>
      </noscript>
    </form>
  );
}
