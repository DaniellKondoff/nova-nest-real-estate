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

/**
 * Transliterate Bulgarian Cyrillic text to Latin characters
 * Uses the official Bulgarian transliteration standard (ISO 9:1995)
 * @param text - Bulgarian Cyrillic text
 * @returns Transliterated Latin text
 */
export function transliterateBulgarianToLatin(text: string): string {
  const cyrillicToLatinMap: Record<string, string> = {
    // Lowercase
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
    // Uppercase
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
    'Е': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y',
    'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
    'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya',
  };

  return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
}

/**
 * Generate a URL-safe slug from Bulgarian text
 * Automatically transliterates Cyrillic to Latin
 * @param text - Text to convert to slug (can be Cyrillic or Latin)
 * @returns URL-safe slug
 */
export function generateSlugFromBulgarian(text: string): string {
  // First transliterate Cyrillic to Latin
  const transliterated = transliterateBulgarianToLatin(text);
  
  // Convert to lowercase and create slug
  return transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters, keep letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}