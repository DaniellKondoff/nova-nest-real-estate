"use client";
import React from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Home as HomeIcon } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import PropertyCard, { type PropertyCardProps } from "@/components/property/PropertyCard";
import { getBrowserClient } from "@/lib/supabase/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export type PropertyFilterKey = "all" | "sale" | "rent";

export interface PropertyShowcaseProps {
  className?: string;
}

interface FilterTab {
  key: PropertyFilterKey;
  label: string;
}

const TABS: FilterTab[] = [
  { key: "all", label: "Всички" },
  { key: "sale", label: "Продажба" },
  { key: "rent", label: "Наем" },
];

/**
 * PropertyShowcase – White section with filter tabs and responsive grid.
 * Placeholder-only for now; property cards will be integrated in a follow-up.
 */
export default function PropertyShowcase(props: PropertyShowcaseProps): React.ReactElement {
  const { className } = props;

  const [activeFilter, setActiveFilter] = React.useState<PropertyFilterKey>("all");
  const [properties, setProperties] = React.useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProperties = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserClient();
      const operationType = activeFilter === "all" ? undefined : (activeFilter === "sale" ? "sale" : "rent");
      // @ts-expect-error - RPC function not in generated types yet
      const { data: featured, error: rpcError } = await supabase.rpc("get_featured_properties", {
        limit_count: 6,
        operation_type_filter: operationType,
      });
      if (rpcError) throw rpcError;
      const ids = ((featured ?? []) as any[]).map((p: any) => p.id);
      if (!ids.length) {
        setProperties([]);
        return;
      }
      const { data: detailed, error: selError } = await supabase
        .from("properties")
        .select(
          "id,title_bg,price_eur,operation_type,address_bg,area_sqm,rooms,bedrooms,is_new,created_at, neighborhood:neighborhood_id(name_bg), images:property_images(url,is_primary,alt_text_bg)"
        )
        .in("id", ids as any);
      if (selError) throw selError;
      const mapped: PropertyCardProps[] = (detailed as any[]).map((p) => {
        const primaryImage = (p.images || []).find((img: any) => img.is_primary) || (p.images || [])[0];
        return {
          property: {
            property: {
              id: p.id,
              title_bg: p.title_bg,
              price_eur: p.price_eur ?? 0,
              operation_type: p.operation_type === "rent" ? "rent" : "sale",
              address_bg: p.address_bg ?? "",
              area_sqm: p.area_sqm ?? null,
              rooms: p.rooms ?? null,
              bedrooms: p.bedrooms ?? null,
              is_new: p.is_new ?? false,
              created_at: p.created_at ?? new Date().toISOString(),
            },
            neighborhood: { name_bg: p.neighborhood?.name_bg ?? "" },
            category: null,
            images: (p.images || []).map((img: any) => ({
              id: 0,
              url: img.url ?? "/images/window.svg",
              alt_text_bg: img.alt_text_bg ?? p.title_bg,
              alt_text_en: null,
              is_primary: img.is_primary ?? false,
              property_id: p.id,
              sort_order: 0,
              file_size: null,
              filename: null,
              height: null,
              width: null,
              created_at: new Date().toISOString(),
            })),
          },
          priority: false,
        } as PropertyCardProps;
      });
      setProperties(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError("Неуспешно зареждане на имоти");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchProperties();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchProperties]);

  // Animation variants
  const tabsVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { delay: 0.2, when: "beforeChildren", staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <section
      aria-labelledby="property-showcase-heading"
      className={[inter.variable, "w-full bg-white py-16 md:py-24", className].filter(Boolean).join(" ")}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2
            id="property-showcase-heading"
            className="text-4xl md:text-5xl font-semibold text-[#1a2642] mb-4"
          >
            Препоръчани имоти
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12">
            Открийте най-добрите възможности на пазара
          </p>
        </div>

        {/* Filter Tabs */}
        <motion.div
          role="tablist"
          aria-label="Филтри за имоти"
          className="mb-16 flex items-center justify-center gap-3"
          variants={tabsVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px", amount: 0.15 }}
        >
          {TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const base =
              "px-6 py-3 rounded-lg text-base md:text-lg font-medium transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-white border-2";
            const inactive = "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200";
            const active = "bg-[#d4af37] text-white border-[#d4af37]";
            const className = [base, isActive ? active : inactive].join(" ");
            const handleSelect = () => setActiveFilter(tab.key);
            const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            };
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-pressed={isActive}
                className={className}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
              >
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center text-[#2d3748] animate-pulse" role="status" aria-live="polite">
              Зареждане на имоти...
            </div>
          ) : error ? (
            <div className="col-span-full flex flex-col items-center gap-4 text-center">
              <div className="text-[#2d3748]">{error}</div>
              <button
                type="button"
                onClick={fetchProperties}
                className="rounded-lg bg-[#d4af37] px-6 py-3 text-white transition-colors hover:bg-[#c49d2f]"
              >
                Опитайте отново
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 text-center text-[#2d3748]">
              <HomeIcon className="h-6 w-6" aria-hidden />
              <div>Няма налични имоти в момента</div>
            </div>
          ) : (
            <motion.div
              key={activeFilter}
              className="contents"
              variants={gridVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px", amount: 0.2 }}
            >
              <AnimatePresence>
                {properties.map((p) => (
                  <motion.div key={p.property.property.id} variants={cardVariants} layout exit="exit">
                    <PropertyCard {...p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* View All Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-lg bg-[#d4af37] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#c49d2f]"
          >
            Вижте всички обяви
          </Link>
        </div>
      </div>
    </section>
  );
}


