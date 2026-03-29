import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { generateNeighborhoodStructuredData } from "@/lib/seo/neighborhood-metadata";
import { getNeighborhoodBreadcrumbs } from "@/lib/seo/neighborhood-breadcrumbs";
import { generateNeighborhoodMetadata } from "@/lib/seo/neighborhood-metadata";
import {
  getCachedNeighborhoods,
  getNeighborhoodBySlug,
  getPropertiesByNeighborhood,
  getPropertyCountByNeighborhood
} from "@/lib/queries/neighborhoods";
import NeighborhoodHero from "@/components/neighborhoods/NeighborhoodHero";
import NeighborhoodInfo from "@/components/neighborhoods/NeighborhoodInfo";
import NeighborhoodMap from "@/components/neighborhoods/NeighborhoodMap";
import PropertyGrid from "@/components/property/PropertyGrid";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";
import { site } from "@/config/site";

interface NeighborhoodPageProps {
  params: Promise<{
    "neighborhood-slug": string;
  }>;
}

/**
 * Generate static params for all neighborhoods
 * This pre-generates pages at build time for better SEO
 */
export async function generateStaticParams() {
  try {
    const neighborhoods = await getCachedNeighborhoods();
    
    return neighborhoods.map((neighborhood) => ({
      "neighborhood-slug": neighborhood.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for neighborhoods:", error);
    return [];
  }
}

/**
 * Generate metadata for neighborhood pages
 */
export async function generateMetadata({ 
  params 
}: NeighborhoodPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const neighborhood = await getNeighborhoodBySlug(resolvedParams["neighborhood-slug"]);
    
    if (!neighborhood) {
      return {
        title: "Квартал не е намерен | Nova Nest",
        description: "Търсеният квартал не е намерен.",
      };
    }

    const propertyCount = await getPropertyCountByNeighborhood(neighborhood.id);
    
    return generateNeighborhoodMetadata(neighborhood, propertyCount);
  } catch (error) {
    console.error("Error generating metadata for neighborhood:", error);
    return {
      title: "Грешка | Nova Nest",
      description: "Възникна грешка при зареждането на страницата.",
    };
  }
}

/**
 * Neighborhood landing page component
 */
export default async function NeighborhoodPage({ 
  params 
}: NeighborhoodPageProps) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    
    // Fetch neighborhood data
    const neighborhood = await getNeighborhoodBySlug(resolvedParams["neighborhood-slug"]);
    
    if (!neighborhood) {
      notFound();
    }

    // Fetch properties in this neighborhood
    const properties = await getPropertiesByNeighborhood(neighborhood.id, 20);
    
    // Generate breadcrumbs
    const breadcrumbs = getNeighborhoodBreadcrumbs(
      neighborhood.name_bg,
      neighborhood.slug
    );

    // Generate structured data
    const structuredData = generateNeighborhoodStructuredData(
      neighborhood,
      properties.length
    );

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Breadcrumb Schema */}
        <BreadcrumbSchema items={breadcrumbs} />
        
        {/* Visual Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Hero Section */}
        <NeighborhoodHero 
          neighborhood={neighborhood} 
          propertyCount={properties.length} 
        />
        
        {/* Neighborhood Information */}
        <section className="py-16">
          <NeighborhoodInfo neighborhood={neighborhood} />
        </section>
        
        {/* Properties Section */}
        <section id="properties" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1a2642] mb-4">
                  Имоти в {neighborhood.name_bg}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {properties.length > 0 
                    ? `Открийте ${properties.length} активни обяви в квартал ${neighborhood.name_bg}.`
                    : `В момента няма активни обяви в квартал ${neighborhood.name_bg}.`
                  }
                </p>
              </div>
              
              {properties.length > 0 ? (
                <PropertyGrid properties={properties} />
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-[#1a2642] mb-4">
                      Няма активни обяви
                    </h3>
                    <p className="text-gray-600 mb-6">
                      В момента няма активни имоти в този квартал. 
                      Свържете се с нас, за да бъдете уведомени за нови оферти.
                    </p>
                    <div className="space-y-3">
                      <a 
                        href={`tel:${site.contact.phone}`}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none w-full bg-[#d4af37] hover:bg-[#b8941f] text-[#1a2642] py-3 px-6 text-base"
                      >
                        <Phone className="h-4 w-4" />
                        Обадете се
                      </a>
                      <a 
                        href={`mailto:${site.contact.email}`}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none w-full border border-[#1a2642] text-[#1a2642] bg-transparent hover:bg-[#1a2642] hover:text-white py-3 px-6 text-base"
                      >
                        <Mail className="h-4 w-4" />
                        Изпратете имейл
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
                
        {/* CTA Section */}
        <section className="py-16 bg-[#1a2642] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Търсите имот в {neighborhood.name_bg}?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Свържете се с нашия екип за персонална консултация и намиране на идеалния имот за вас.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={`tel:${site.contact.phone}`}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none bg-[#d4af37] hover:bg-[#b8941f] text-[#1a2642] font-semibold px-8 py-4 text-lg"
                >
                  <Phone className="h-5 w-5" />
                  Обадете се сега
                </a>
                <Link 
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none border border-white text-white bg-transparent hover:bg-white hover:text-[#1a2642] font-semibold px-8 py-4 text-lg"
                >
                  <Mail className="h-5 w-5" />
                  Свържете се с нас
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Error rendering neighborhood page:", error);
    notFound();
  }
}
