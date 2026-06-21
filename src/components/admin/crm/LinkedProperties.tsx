"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2, ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import type { Tables } from "@/types/database.generated";

const PROPERTY_STATUS: Record<string, { label: string; classes: string }> = {
  available: { label: "Наличен", classes: "bg-green-100 text-green-800" },
  under_offer: { label: "В процес", classes: "bg-yellow-100 text-yellow-800" },
  sold: { label: "Продаден", classes: "bg-red-100 text-red-800" },
  rented: { label: "Отдаден", classes: "bg-blue-100 text-blue-800" },
  archived: { label: "Архивиран", classes: "bg-gray-100 text-gray-800" },
};

interface LinkedPropertiesProps {
  contactId: string;
  initialProperties: Tables<"properties">[];
}

export default function LinkedProperties({ contactId, initialProperties }: LinkedPropertiesProps) {
  const [properties, setProperties] = useState<Tables<"properties">[]>(initialProperties);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const [linkingId, setLinkingId] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [allProperties, setAllProperties] = useState<Tables<"properties">[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);

  const linkedIds = new Set(properties.map((p) => p.id));

  // Load all properties when modal opens
  useEffect(() => {
    if (!modalOpen) return;
    setModalLoading(true);
    setFilterQuery("");

    fetch("/api/properties/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters: {}, page: 1, limit: 100 }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const rows = (json.data?.properties ?? []) as Array<{ property: Tables<"properties"> }>;
          setAllProperties(rows.map((r) => r.property));
        }
      })
      .catch(() => {})
      .finally(() => {
        setModalLoading(false);
        setTimeout(() => filterRef.current?.focus(), 50);
      });
  }, [modalOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const filteredProperties = allProperties.filter((p) => {
    if (linkedIds.has(p.id)) return false;
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      p.title_bg?.toLowerCase().includes(q) ||
      p.neighborhood_id?.toString().includes(q)
    );
  });

  const handleLink = async (property: Tables<"properties">) => {
    setLinkingId(property.id);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ property_id: property.id }),
      });
      if (res.ok) {
        setProperties((prev) => [...prev, property]);
        setAllProperties((prev) => prev.filter((p) => p.id !== property.id));
      }
    } finally {
      setLinkingId(null);
    }
  };

  const handleUnlink = async (propertyId: number) => {
    setUnlinkingId(propertyId);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/properties`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ property_id: propertyId }),
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } finally {
      setUnlinkingId(null);
    }
  };

  function getPrice(property: Tables<"properties">): string {
    if (property.price_eur != null) return `${property.price_eur.toLocaleString("bg-BG")} EUR`;
    if (property.price_bgn != null) return `${property.price_bgn.toLocaleString("bg-BG")} лв.`;
    return "—";
  }

  const statusInfo = (status: string) =>
    PROPERTY_STATUS[status] ?? { label: status, classes: "bg-gray-100 text-gray-700" };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Свързани имоти</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#D4AF37] text-white rounded-md hover:bg-[#B8941F] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Добави имот
          </button>
        </div>

        {/* Linked properties list */}
        {properties.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Няма свързани имоти</p>
        ) : (
          <div className="space-y-2">
            {properties.map((property) => {
              const s = statusInfo(property.status);
              const isUnlinking = unlinkingId === property.id;
              return (
                <div
                  key={property.id}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                    {property.og_image ? (
                      <Image
                        src={property.og_image}
                        alt={property.title_bg}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">—</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={`/properties/${property.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 hover:text-[#D4AF37] transition-colors flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{property.title_bg}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">{getPrice(property)}</p>
                  </div>

                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                    {s.label}
                  </span>

                  <button
                    onClick={() => handleUnlink(property.id)}
                    disabled={isUnlinking}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Премахни"
                  >
                    {isUnlinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Избери имот</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter input */}
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={filterRef}
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Филтрирай по заглавие..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Property list */}
            <div className="overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16">
                  {filterQuery.trim() ? "Няма намерени имоти" : "Всички имоти са вече свързани"}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => {
                    const s = statusInfo(property.status);
                    const isLinking = linkingId === property.id;
                    return (
                      <li key={property.id}>
                        <button
                          onClick={() => handleLink(property)}
                          disabled={isLinking}
                          className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-60"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                            {property.og_image ? (
                              <Image
                                src={property.og_image}
                                alt={property.title_bg}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {property.title_bg}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{getPrice(property)}</p>
                          </div>

                          {/* Status */}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                            {s.label}
                          </span>

                          {/* Action */}
                          {isLinking ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37] flex-shrink-0" />
                          ) : (
                            <span className="flex-shrink-0 text-xs font-medium text-[#D4AF37] border border-[#D4AF37] px-2.5 py-1 rounded hover:bg-[#D4AF37] hover:text-white transition-colors">
                              Добави
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer count */}
            {!modalLoading && (
              <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                {filteredProperties.length} имота
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
