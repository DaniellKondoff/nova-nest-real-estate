"use client";

import React from "react";
import { MapPin, Navigation } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";

interface NeighborhoodMapProps {
  lat?: number;
  lng?: number;
  properties: PropertyWithDetails[];
}

/**
 * Neighborhood map component with property markers
 * Currently shows placeholder - will be implemented with Google Maps in Phase 4
 */
export default function NeighborhoodMap({ 
  lat, 
  lng, 
  properties 
}: NeighborhoodMapProps) {
  const hasCoordinates = lat && lng;
  const propertyCount = properties.length;

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Map Header */}
          <div className="bg-[#1a2642] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Карта на района</h2>
                <p className="text-gray-300">
                  {hasCoordinates 
                    ? `Център на квартала: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    : "Местоположение на квартала"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-[#d4af37] mb-1">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{propertyCount} имота</span>
                </div>
                <p className="text-sm text-gray-300">в този район</p>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-[400px] bg-gray-100 flex items-center justify-center">
            {hasCoordinates ? (
              <div className="text-center">
                <div className="bg-[#1a2642] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Navigation className="h-10 w-10 text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a2642] mb-2">
                  Интерактивна карта
                </h3>
                <p className="text-gray-600 mb-4">
                  Картата ще показва всички имоти в района
                </p>
                <div className="bg-[#d4af37] text-[#1a2642] px-4 py-2 rounded-lg inline-block font-medium">
                  Интеграция очаква Google Maps API
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gray-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Координати не са налични
                </h3>
                <p className="text-gray-500">
                  Картата ще бъде достъпна след добавяне на координати
                </p>
              </div>
            )}
          </div>

          {/* Property List Preview */}
          {propertyCount > 0 && (
            <div className="p-6 bg-gray-50 border-t">
              <h3 className="text-lg font-semibold text-[#1a2642] mb-4">
                Имоти в района ({propertyCount})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.slice(0, 6).map((property) => (
                  <div 
                    key={property.property.id}
                    className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-[#1a2642] text-sm line-clamp-2">
                        {property.property.title_bg}
                      </h4>
                      <span className="bg-[#d4af37] text-[#1a2642] px-2 py-1 rounded text-xs font-medium">
                        {property.property.price_eur?.toLocaleString() || 'Цена по договаряне'} €
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {property.property.operation_type} • {property.property.address_bg || 'Адрес не е посочен'}
                    </p>
                  </div>
                ))}
              </div>
              {propertyCount > 6 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  И още {propertyCount - 6} имота в района
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
