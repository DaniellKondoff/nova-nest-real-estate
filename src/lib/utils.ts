import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to relative time in Bulgarian
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return "току-що";
  } else if (diffInMinutes < 60) {
    return `преди ${diffInMinutes} ${diffInMinutes === 1 ? 'минута' : 'минути'}`;
  } else if (diffInHours < 24) {
    return `преди ${diffInHours} ${diffInHours === 1 ? 'час' : 'часа'}`;
  } else if (diffInDays < 7) {
    return `преди ${diffInDays} ${diffInDays === 1 ? 'ден' : 'дни'}`;
  } else {
    // Show date for older items
    return past.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

/**
 * Get status badge color classes
 * @param status - The inquiry status
 * @returns Tailwind CSS classes for the status badge
 */
export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'responded':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get inquiry type display name in Bulgarian
 * @param type - The inquiry type
 * @returns Bulgarian display name
 */
export function getInquiryTypeName(type: string): string {
  switch (type) {
    case 'general':
      return 'Общо запитване';
    case 'property_interest':
      return 'Интерес към имот';
    case 'viewing_request':
      return 'Заявка за оглед';
    case 'valuation':
      return 'Оценка на имот';
    case 'selling':
      return 'Продажба';
    case 'renting':
      return 'Наем';
    default:
      return type;
  }
}