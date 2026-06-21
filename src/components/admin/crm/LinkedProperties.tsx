"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Tables } from "@/types/database.generated";

const PROPERTY_STATUS: Record<string, { label: string; classes: string }> = {
  available: { label: "Наличен", classes: "bg-green-100 text-green-800" },
  under_offer: { label: "В процес", classes: "bg-yellow-100 text-yellow-800" },
  sold: { label: "Продаден", classes: "bg-red-100 text-red-800" },
  rented: { label: "Отдаден", classes: "bg-blue-100 text-blue-800" },
  archived: { label: "Архивиран", classes: "bg-gray-100 text-gray-800" },
};

interface SearchResult {
  property: Tables<"properties">;
  images: { url: string; is_primary: boolean }[];
}

interface LinkedPropertiesProps {
  contactId: string;
  initialProperties: Tables<"properties">[];
}

export default function LinkedProperties({ contactId, initialProperties }: LinkedPropertiesProps) {
  const [properties, setProperties] = useState<Tables<"properties">[]>(initialProperties);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);
  const [linkingId, setLinkingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/properties/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data?.properties ?? []);
        }
      } catch {
        // ignore search errors
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const linkedIds = new Set(properties.map((p) => p.id));

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

  const handleLink = async (result: SearchResult) => {
    const propertyId = result.property.id;
    if (linkedIds.has(propertyId)) return;
    setLinkingId(propertyId);
    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ property_id: propertyId }),
      });
      if (res.ok) {
        setProperties((prev) => [...prev, result.property]);
        setShowDropdown(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } finally {
      setLinkingId(null);
    }
  };

  function getPrice(property: Tables<"properties">): string {
    if (property.price_eur != null) return `${property.price_eur.toLocaleString("bg-BG")} EUR`;
    if (property.price_bgn != null) return `${property.price_bgn.toLocaleString("bg-BG")} лв.`;
    return "—";
  }

  const statusInfo = (status: string) => PROPERTY_STATUS[status] ?? { label: status, classes: "bg-gray-100 text-gray-700" };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Свързани имоти</h3>
        <button
          onClick={() => {
            setShowDropdown(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#D4AF37] text-white rounded-md hover:bg-[#B8941F] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Добави имот
        </button>
      </div>

      {/* Search dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="mb-4 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Търси имот по заглавие..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
          {(searchLoading || searchResults.length > 0 || searchQuery.trim()) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">Няма намерени имоти</p>
              ) : (
                searchResults
                  .filter((r) => !linkedIds.has(r.property.id))
                  .map((result) => {
                    const s = statusInfo(result.property.status);
                    const isLinking = linkingId === result.property.id;
                    return (
                      <button
                        key={result.property.id}
                        onClick={() => handleLink(result)}
                        disabled={isLinking}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 disabled:opacity-50"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                          {result.images?.[0]?.url ? (
                            <Image
                              src={result.images[0].url}
                              alt={result.property.title_bg}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.property.title_bg}
                          </p>
                          <p className="text-xs text-gray-500">{getPrice(result.property)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                          {s.label}
                        </span>
                        {isLinking && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                      </button>
                    );
                  })
              )}
            </div>
          )}
        </div>
      )}

      {/* Properties list */}
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">—</span>
                    </div>
                  )}
                </div>

                {/* Info */}
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

                {/* Status badge */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.classes}`}>
                  {s.label}
                </span>

                {/* Unlink button */}
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
  );
}
