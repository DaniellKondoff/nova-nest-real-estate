/**
 * Star Rating Component for Nova Nest Real Estate
 * Displays visual star ratings with optional numeric display
 */

import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  showNumber?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Star Rating Component
 * Displays rating as stars (★★★★☆) with optional numeric display
 * 
 * @param rating - The rating value (0-5)
 * @param showNumber - Whether to show the numeric rating next to stars
 * @param className - Additional CSS classes
 * @param size - Size variant for the stars
 */
export function StarRating({ 
  rating, 
  showNumber = true, 
  className,
  size = 'md'
}: StarRatingProps) {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  
  // Calculate star display
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Star color classes
  const filledStarClass = 'text-yellow-500';
  const emptyStarClass = 'text-gray-300';
  
  return (
    <div className={cn('flex items-center gap-1', sizeClasses[size], className)}>
      {/* Full Stars */}
      {Array.from({ length: fullStars }, (_, index) => (
        <span key={`full-${index}`} className={filledStarClass}>
          ★
        </span>
      ))}
      
      {/* Half Star */}
      {hasHalfStar && (
        <span className={filledStarClass}>
          ★
        </span>
      )}
      
      {/* Empty Stars */}
      {Array.from({ length: emptyStars }, (_, index) => (
        <span key={`empty-${index}`} className={emptyStarClass}>
          ☆
        </span>
      ))}
      
      {/* Numeric Rating */}
      {showNumber && (
        <span className="ml-1 text-gray-700 font-medium">
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/**
 * Star Rating with Review Count Component
 * Displays star rating with review count
 */
interface StarRatingWithCountProps extends StarRatingProps {
  reviewCount: number;
  showCount?: boolean;
}

export function StarRatingWithCount({ 
  rating, 
  reviewCount, 
  showCount = true,
  showNumber = true,
  className,
  size = 'md'
}: StarRatingWithCountProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StarRating 
        rating={rating} 
        showNumber={showNumber}
        size={size}
      />
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-gray-600">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}

/**
 * Interactive Star Rating Component (for future use)
 * Allows users to select ratings
 */
interface InteractiveStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveStarRating({ 
  value, 
  onChange, 
  disabled = false,
  className,
  size = 'md'
}: InteractiveStarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const handleStarClick = (starRating: number) => {
    if (!disabled) {
      onChange(starRating);
    }
  };
  
  return (
    <div className={cn('flex items-center gap-1', sizeClasses[size], className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= value;
        
        return (
          <button
            key={starRating}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={disabled}
            className={cn(
              'transition-colors duration-200',
              isFilled ? 'text-yellow-500' : 'text-gray-300',
              !disabled && 'hover:text-yellow-400 cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
            aria-label={`Rate ${starRating} star${starRating > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
