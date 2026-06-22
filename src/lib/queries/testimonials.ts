/**
 * Testimonials database queries for Nova Nest Real Estate
 * Handles fetching approved testimonials and calculating aggregate ratings
 */

import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.generated';
import { env } from '@/lib/env';

// Type for testimonial data
export interface Testimonial {
  id: number;
  rating: number;
  client_name: string;
  comment_text: string;
  created_at: string;
}

// Type for aggregate rating data
export interface AggregateRating {
  averageRating: number;
  reviewCount: number;
}

import { unstable_cache } from 'next/cache';

/**
 * Creates a static Supabase client for static generation (no cookies)
 */
function getStaticClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function _fetchApprovedTestimonials(): Promise<Testimonial[]> {
  const supabase = getStaticClient();

  const { data, error } = await supabase
    .from('testimonials')
    .select('id, rating, client_name, content_bg, created_at')
    .eq('is_published', true)
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return (data || [])
    .filter((testimonial): testimonial is NonNullable<typeof testimonial> & { rating: number } =>
      testimonial.rating !== null && testimonial.rating > 0
    )
    .map(testimonial => ({
      id: testimonial.id,
      rating: testimonial.rating,
      client_name: testimonial.client_name,
      comment_text: testimonial.content_bg,
      created_at: testimonial.created_at
    }));
}

/**
 * Fetches all approved testimonials, cached for 1 hour and tagged for on-demand revalidation.
 * Use this everywhere instead of getApprovedTestimonialsStatic.
 */
export const getCachedApprovedTestimonials = unstable_cache(
  _fetchApprovedTestimonials,
  ['approved-testimonials'],
  { tags: ['testimonials'], revalidate: 3600 }
);

/**
 * @deprecated Use getCachedApprovedTestimonials instead.
 */
export async function getApprovedTestimonialsStatic(): Promise<Testimonial[]> {
  return getCachedApprovedTestimonials();
}

/**
 * Fetches all approved testimonials from the database (dynamic version with cookies)
 * @returns Promise<Testimonial[]> - Array of approved testimonials
 */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await getServerClient();
    
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, rating, client_name, content_bg, created_at')
      .eq('is_published', true)
      .not('rating', 'is', null)
      .order('created_at', { ascending: false });

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
        client_name: testimonial.client_name,
        comment_text: testimonial.content_bg,
        created_at: testimonial.created_at
      }));
  } catch (error) {
    console.error('Error in getApprovedTestimonials:', error);
    return [];
  }
}

/**
 * Calculates aggregate rating from approved testimonials (static version for SSG)
 * @returns Promise<AggregateRating> - Object with average rating and review count
 */
export async function getAggregateRatingStatic(): Promise<AggregateRating> {
  try {
    const testimonials = await getCachedApprovedTestimonials();
    
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
    console.error('Error in getAggregateRatingStatic:', error);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Calculates aggregate rating from approved testimonials (dynamic version with cookies)
 * @returns Promise<AggregateRating> - Object with average rating and review count
 */
export async function getAggregateRating(): Promise<AggregateRating> {
  try {
    const testimonials = await getApprovedTestimonials();
    
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
    console.error('Error in getAggregateRating:', error);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Fetches testimonials for a specific property (for future use)
 * @param propertyId - The property ID to fetch testimonials for
 * @returns Promise<Testimonial[]> - Array of property-specific testimonials
 */
export async function getPropertyTestimonials(propertyId: number): Promise<Testimonial[]> {
  try {
    const supabase = await getServerClient();
    
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, rating, client_name, content_bg, created_at')
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
        client_name: testimonial.client_name,
        comment_text: testimonial.content_bg,
        created_at: testimonial.created_at
      }));
  } catch (error) {
    console.error('Error in getPropertyTestimonials:', error);
    return [];
  }
}