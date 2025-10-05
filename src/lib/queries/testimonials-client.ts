/**
 * Client-side testimonials queries for Nova Nest Real Estate
 * Uses client-side Supabase client for browser components
 */

import { getBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.generated';

// Type for testimonial data (client version)
export interface TestimonialClient {
  id: number;
  rating: number;
  clientName: string;
  role?: string;
  testimonial: string;
  created_at: string;
}

// Type for aggregate rating data
export interface AggregateRatingClient {
  averageRating: number;
  reviewCount: number;
}

/**
 * Fetches all approved testimonials from the database (client-side)
 * @param limit - Optional limit for number of testimonials to fetch
 * @returns Promise<TestimonialClient[]> - Array of approved testimonials
 */
export async function getApprovedTestimonialsClient(limit?: number): Promise<TestimonialClient[]> {
  try {
    const supabase = getBrowserClient();
    
    let query = supabase
      .from('testimonials')
      .select('id, rating, client_name, client_role, content_bg, created_at')
      .eq('is_published', true)
      .not('rating', 'is', null)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }

    // Filter out testimonials without ratings and map to our interface
    return (data || [])
      .filter((testimonial): testimonial is NonNullable<typeof testimonial> & { rating: number } => 
        testimonial.rating !== null && testimonial.rating > 0
      )
      .map(testimonial => ({
        id: testimonial.id,
        rating: testimonial.rating,
        clientName: testimonial.client_name,
        role: testimonial.client_role || undefined,
        testimonial: testimonial.content_bg,
        created_at: testimonial.created_at
      }));
  } catch (error) {
    console.error('Error in getApprovedTestimonialsClient:', error);
    return [];
  }
}

/**
 * Calculates aggregate rating from approved testimonials (client-side)
 * @returns Promise<AggregateRatingClient> - Object with average rating and review count
 */
export async function getAggregateRatingClient(): Promise<AggregateRatingClient> {
  try {
    const testimonials = await getApprovedTestimonialsClient();
    
    if (testimonials.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0
      };
    }

    const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    const averageRating = totalRating / testimonials.length;
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: testimonials.length
    };
  } catch (error) {
    console.error('Error in getAggregateRatingClient:', error);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Fetches testimonials for a specific property (client-side)
 * @param propertyId - The property ID to fetch testimonials for
 * @returns Promise<TestimonialClient[]> - Array of property-specific testimonials
 */
export async function getPropertyTestimonialsClient(propertyId: number): Promise<TestimonialClient[]> {
  try {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, rating, client_name, client_role, content_bg, created_at')
      .eq('property_id', propertyId)
      .eq('is_published', true)
      .not('rating', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property testimonials:', error);
      return [];
    }

    return (data || [])
      .filter((testimonial): testimonial is NonNullable<typeof testimonial> & { rating: number } => 
        testimonial.rating !== null && testimonial.rating > 0
      )
      .map(testimonial => ({
        id: testimonial.id,
        rating: testimonial.rating,
        clientName: testimonial.client_name,
        role: testimonial.client_role || undefined,
        testimonial: testimonial.content_bg,
        created_at: testimonial.created_at
      }));
  } catch (error) {
    console.error('Error in getPropertyTestimonialsClient:', error);
    return [];
  }
}
