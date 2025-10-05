"use client";

import React from "react";
import { 
  School, 
  ShoppingBag, 
  Hospital, 
  Bus, 
  Car, 
  Footprints,
  MapPin,
  Clock,
  Users
} from "lucide-react";
import type { Neighborhood } from "@/lib/queries/neighborhoods";

interface NeighborhoodInfoProps {
  neighborhood: Neighborhood;
}

interface Amenities {
  schools?: string[];
  shopping?: string[];
  medical?: string[];
  transport?: {
    bus_lines?: string[];
    parking?: 'free' | 'paid' | 'mixed';
    walkability?: 'high' | 'medium' | 'low';
  };
}

/**
 * Neighborhood information component displaying amenities and local details
 */
export default function NeighborhoodInfo({ neighborhood }: NeighborhoodInfoProps) {
  const amenities: Amenities = neighborhood.amenities || {};
  const transport = amenities.transport || {};

  const getWalkabilityText = (level?: string) => {
    switch (level) {
      case 'high': return 'Висока пешеходна достъпност';
      case 'medium': return 'Средна пешеходна достъпност';
      case 'low': return 'Ниска пешеходна достъпност';
      default: return 'Добра пешеходна достъпност';
    }
  };

  const getParkingText = (type?: string) => {
    switch (type) {
      case 'free': return 'Безплатно паркиране';
      case 'paid': return 'Платено паркиране';
      case 'mixed': return 'Смесено паркиране';
      default: return 'Паркиране на разположение';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        {/* About Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#1a2642] mb-6">
              За квартал {neighborhood.name_bg}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {neighborhood.description ? (
                <p>{neighborhood.description}</p>
              ) : (
                <p>
                  Квартал {neighborhood.name_bg} е един от най-привлекателните райони в Стара Загора. 
                  Той предлага отлична комбинация от удобства, транспортна свързаност и спокойна жилищна среда.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Amenities Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#1a2642] mb-8 text-center">
            Удобства и услуги
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Schools */}
            {amenities.schools && amenities.schools.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <School className="h-8 w-8 text-[#d4af37] mr-3" />
                  <h3 className="text-xl font-semibold text-[#1a2642]">Училища</h3>
                </div>
                <ul className="space-y-2">
                  {amenities.schools.map((school, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {school}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shopping */}
            {amenities.shopping && amenities.shopping.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-[#d4af37] mr-3" />
                  <h3 className="text-xl font-semibold text-[#1a2642]">Търговски центрове</h3>
                </div>
                <ul className="space-y-2">
                  {amenities.shopping.map((shop, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {shop}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medical */}
            {amenities.medical && amenities.medical.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Hospital className="h-8 w-8 text-[#d4af37] mr-3" />
                  <h3 className="text-xl font-semibold text-[#1a2642]">Медицински заведения</h3>
                </div>
                <ul className="space-y-2">
                  {amenities.medical.map((medical, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {medical}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transport */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Bus className="h-8 w-8 text-[#d4af37] mr-3" />
                <h3 className="text-xl font-semibold text-[#1a2642]">Транспорт</h3>
              </div>
              <div className="space-y-3">
                {transport.bus_lines && transport.bus_lines.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Автобусни линии:</h4>
                    <div className="flex flex-wrap gap-2">
                      {transport.bus_lines.map((line, index) => (
                        <span 
                          key={index}
                          className="bg-[#d4af37] text-[#1a2642] px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700">
                  <Car className="h-4 w-4 text-gray-400 mr-2" />
                  {getParkingText(transport.parking)}
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Footprints className="h-4 w-4 text-gray-400 mr-2" />
                  {getWalkabilityText(transport.walkability)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Living in Neighborhood Section */}
        <section className="bg-[#1a2642] text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Живот в {neighborhood.name_bg}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#d4af37] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-[#1a2642]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Стратегическо местоположение</h3>
              <p className="text-gray-300">
                Отлично разположение с лесен достъп до центъра на града и основните транспортни артерии.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#d4af37] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#1a2642]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Спокойна среда</h3>
              <p className="text-gray-300">
                Идеално място за семейства с деца, предлагащо спокойствие и безопасност.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#d4af37] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#1a2642]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Бърз достъп</h3>
              <p className="text-gray-300">
                Близо до всички необходими услуги - училища, магазини, медицински заведения.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
