"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils";
import { 
  Home, 
  MessageSquare, 
  Star, 
  Trash2, 
  Edit, 
  Plus,
  Clock,
  ChevronRight
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'property_created' | 'property_updated' | 'property_deleted' | 'inquiry_received' | 'testimonial_approved' | 'testimonial_added';
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link?: string;
  linkText?: string;
}

interface ActivityLogProps {
  limit?: number;
  className?: string;
}

export function ActivityLog({ limit = 10, className = "" }: ActivityLogProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();

        // Fetch recent data from all tables
        const [propertiesRes, inquiriesRes, testimonialsRes] = await Promise.all([
          // Recent properties
          supabase
            .from("properties")
            .select("id, title_bg, created_at, updated_at")
            .order("created_at", { ascending: false })
            .limit(5),
          
          // Recent inquiries
          supabase
            .from("inquiries")
            .select("id, full_name, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          
          // Recent testimonials
          supabase
            .from("testimonials")
            .select("id, client_name, is_published, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (propertiesRes.error || inquiriesRes.error || testimonialsRes.error) {
          throw new Error("Грешка при зареждане на данните");
        }

        const activities: ActivityItem[] = [];

        // Add property activities
        propertiesRes.data?.forEach((property) => {
          activities.push({
            id: `property-${property.id}`,
            type: 'property_created',
            description: `Добавен нов имот: ${property.title_bg}`,
            timestamp: property.created_at,
            icon: Plus,
            color: 'text-blue-600 bg-blue-100',
            link: `/admin/properties/${property.id}/edit`,
            linkText: 'Виж имота',
          });
        });

        // Add inquiry activities
        inquiriesRes.data?.forEach((inquiry) => {
          activities.push({
            id: `inquiry-${inquiry.id}`,
            type: 'inquiry_received',
            description: `Получено запитване от ${inquiry.full_name}`,
            timestamp: inquiry.created_at,
            icon: MessageSquare,
            color: 'text-green-600 bg-green-100',
            link: '/admin/inquiries',
            linkText: 'Виж запитванията',
          });
        });

        // Add testimonial activities
        testimonialsRes.data?.forEach((testimonial) => {
          if (testimonial.is_published) {
            activities.push({
              id: `testimonial-approved-${testimonial.id}`,
              type: 'testimonial_approved',
              description: `Одобрен отзив от ${testimonial.client_name}`,
              timestamp: testimonial.created_at,
              icon: Star,
              color: 'text-yellow-600 bg-yellow-100',
              link: '/admin/testimonials',
              linkText: 'Виж отзивите',
            });
          } else {
            activities.push({
              id: `testimonial-added-${testimonial.id}`,
              type: 'testimonial_added',
              description: `Добавен нов отзив от ${testimonial.client_name}`,
              timestamp: testimonial.created_at,
              icon: Star,
              color: 'text-yellow-600 bg-yellow-100',
              link: '/admin/testimonials',
              linkText: 'Виж отзивите',
            });
          }
        });

        // Sort by timestamp and limit
        const sortedActivities = activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);

        setActivities(sortedActivities);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError("Грешка при зареждане на активността");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [limit]);

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.link) {
      router.push(activity.link);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-600" />
          Последна активност
        </h3>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-600" />
          Последна активност
        </h3>
        
        <div className="text-center py-6">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-gray-600" />
        Последна активност
      </h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Няма последна активност</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            
            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className="flex items-start">
                  {/* Icon */}
                  <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleActivityClick(activity)}
                      className="text-left hover:bg-gray-50 p-2 -m-2 rounded transition-colors w-full"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        
                        {activity.link && (
                          <span className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            {activity.linkText}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
