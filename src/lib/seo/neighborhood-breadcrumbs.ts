import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-schema";
import { appConfig } from "@/lib/config";

/**
 * Generate breadcrumb items for neighborhood pages
 * @param neighborhoodName - The neighborhood name in Bulgarian
 * @param neighborhoodSlug - The neighborhood slug for the URL
 * @returns Array of breadcrumb items
 */
export function getNeighborhoodBreadcrumbs(
  neighborhoodName: string,
  neighborhoodSlug: string
): BreadcrumbItem[] {
  const baseUrl = appConfig.appUrl;
  
  return [
    {
      name: "Начало",
      url: baseUrl,
      position: 1,
    },
    {
      name: "Имоти",
      url: `${baseUrl}/properties`,
      position: 2,
    },
    {
      name: `Имоти в ${neighborhoodName}`,
      url: `${baseUrl}/${neighborhoodSlug}`,
      position: 3,
    },
  ];
}

/**
 * Generate breadcrumb items for property pages within a neighborhood
 * @param neighborhoodName - The neighborhood name in Bulgarian
 * @param neighborhoodSlug - The neighborhood slug for the URL
 * @param propertyTitle - The property title
 * @param propertyId - The property ID
 * @returns Array of breadcrumb items
 */
export function getPropertyInNeighborhoodBreadcrumbs(
  neighborhoodName: string,
  neighborhoodSlug: string,
  propertyTitle: string,
  propertyId: string
): BreadcrumbItem[] {
  const baseUrl = appConfig.appUrl;
  
  return [
    {
      name: "Начало",
      url: baseUrl,
      position: 1,
    },
    {
      name: "Имоти",
      url: `${baseUrl}/properties`,
      position: 2,
    },
    {
      name: `Имоти в ${neighborhoodName}`,
      url: `${baseUrl}/${neighborhoodSlug}`,
      position: 3,
    },
    {
      name: propertyTitle,
      url: `${baseUrl}/properties/${propertyId}`,
      position: 4,
    },
  ];
}
