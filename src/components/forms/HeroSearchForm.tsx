import React from "react";
import { ChevronDown, Home, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { PROPERTIES_PATH } from "@/lib/search/params";
import { cn } from "@/lib/utils";

interface Option {
  id: number;
  name_bg: string;
}

interface HeroSearchFormProps {
  categories: Option[];
  neighborhoods: Option[];
  className?: string;
}

const fieldClass =
  "h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-10 pr-9 text-base text-primary outline-none transition-colors hover:border-primary/40 focus:border-accent focus:ring-2 focus:ring-accent/30";

function SelectField({
  id,
  name,
  label,
  icon: Icon,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  options: Option[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" aria-hidden="true" />
        <select id={id} name={name} defaultValue="" className={fieldClass}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name_bg}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Hero quick search – a server-rendered native GET form (zero client JS).
 * Options are passed in from the server, so the HTML is complete on first paint.
 */
export default function HeroSearchForm({ categories, neighborhoods, className }: HeroSearchFormProps) {
  return (
    <form
      action={PROPERTIES_PATH}
      method="get"
      role="search"
      aria-labelledby="hero-search-title"
      className={cn("rounded-3xl bg-white p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] sm:p-6", className)}
    >
      <h2 id="hero-search-title" className="sr-only">
        Търсене на имоти
      </h2>

      {/* Buy / rent segmented toggle */}
      <fieldset className="grid h-12 grid-cols-2 rounded-xl bg-gray-100 p-1">
        <legend className="sr-only">Вид сделка</legend>
        {[
          { value: "sale", label: "Купувам" },
          { value: "rent", label: "Наемам" },
        ].map((o, i) => (
          <label key={o.value} className="relative">
            <input type="radio" name="operation" value={o.value} defaultChecked={i === 0} className="peer sr-only" />
            <span className="flex h-full cursor-pointer items-center justify-center rounded-lg text-[15px] font-semibold text-charcoal/70 transition-colors peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-subtle peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
              {o.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SelectField id="hero-category" name="category" label="Тип имот" icon={Home} placeholder="Всички типове" options={categories} />
        <SelectField
          id="hero-neighborhood"
          name="neighborhood"
          label="Квартал"
          icon={MapPin}
          placeholder="Всички квартали"
          options={neighborhoods}
        />
      </div>

      {/* Price – collapsed by default to keep the form short on phones (no JS needed) */}
      <details className="group mt-3 [&_summary::-webkit-details-marker]:hidden">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-primary hover:text-primary-light">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Цена
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-1 grid grid-cols-2 gap-3 pb-1">
          {[
            { name: "minPrice", label: "Цена от", placeholder: "От" },
            { name: "maxPrice", label: "Цена до", placeholder: "До" },
          ].map((f) => (
            <div key={f.name} className="relative">
              <label htmlFor={`hero-${f.name}`} className="sr-only">
                {f.label} (EUR)
              </label>
              <input
                id={`hero-${f.name}`}
                type="number"
                inputMode="numeric"
                min={0}
                name={f.name}
                placeholder={f.placeholder}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 pr-9 text-base text-primary outline-none placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>
          ))}
        </div>
      </details>

      <button
        type="submit"
        className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent text-lg font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
        Търси имоти
      </button>
    </form>
  );
}
