"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { Plus, Home, MessageSquare, Star, Settings } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  badge?: {
    count: number;
    urgent: boolean;
  };
}

interface QuickActionsProps {
  showCounts?: boolean;
}

export function QuickActions({ showCounts = true }: QuickActionsProps) {
  const router = useRouter();
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActionData = async () => {
      try {
        setLoading(true);
        const supabase = getBrowserClient();

        // Fetch counts for badges if needed
        let newInquiriesCount = 0;
        let pendingTestimonialsCount = 0;

        if (showCounts) {
          const [inquiriesRes, testimonialsRes] = await Promise.all([
            supabase
              .from("inquiries")
              .select("id", { count: "exact", head: true })
              .eq("status", "new"),
            supabase
              .from("testimonials")
              .select("id", { count: "exact", head: true })
              .eq("is_published", false),
          ]);

          newInquiriesCount = inquiriesRes.count || 0;
          pendingTestimonialsCount = testimonialsRes.count || 0;
        }

        const quickActions: QuickAction[] = [
          {
            id: "add-property",
            title: "Добави имот",
            icon: ({ className }) => (
              <div className="relative">
                <Home className={className} />
                <Plus className="absolute -top-1 -right-1 h-3 w-3" />
              </div>
            ),
            color: "text-[#d4af37] bg-[#d4af37]/10",
            href: "/admin/properties/create",
          },
          {
            id: "view-inquiries",
            title: "Запитвания",
            icon: MessageSquare,
            color: "text-blue-600 bg-blue-100",
            href: "/admin/inquiries",
            badge: newInquiriesCount > 0 ? {
              count: newInquiriesCount,
              urgent: newInquiriesCount > 5, // Consider urgent if more than 5 new inquiries
            } : undefined,
          },
          {
            id: "manage-testimonials",
            title: "Отзиви",
            icon: Star,
            color: "text-yellow-600 bg-yellow-100",
            href: "/admin/testimonials",
            badge: pendingTestimonialsCount > 0 ? {
              count: pendingTestimonialsCount,
              urgent: false,
            } : undefined,
          },
          {
            id: "settings",
            title: "Настройки",
            icon: Settings,
            color: "text-gray-600 bg-gray-100",
            href: "/admin/settings",
          },
        ];

        setActions(quickActions);
      } catch (error) {
        console.error("Error fetching quick actions data:", error);
        // Fallback to actions without counts
        const fallbackActions: QuickAction[] = [
          {
            id: "add-property",
            title: "Добави имот",
            icon: ({ className }) => (
              <div className="relative">
                <Home className={className} />
                <Plus className="absolute -top-1 -right-1 h-3 w-3" />
              </div>
            ),
            color: "text-[#d4af37] bg-[#d4af37]/10",
            href: "/admin/properties/create",
          },
          {
            id: "view-inquiries",
            title: "Запитвания",
            icon: MessageSquare,
            color: "text-blue-600 bg-blue-100",
            href: "/admin/inquiries",
          },
          {
            id: "manage-testimonials",
            title: "Отзиви",
            icon: Star,
            color: "text-yellow-600 bg-yellow-100",
            href: "/admin/testimonials",
          },
          {
            id: "settings",
            title: "Настройки",
            icon: Settings,
            color: "text-gray-600 bg-gray-100",
            href: "/admin/settings",
          },
        ];
        setActions(fallbackActions);
      } finally {
        setLoading(false);
      }
    };

    fetchActionData();
  }, [showCounts]);

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Бързи действия
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Бързи действия
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.href)}
              className="relative bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              {/* Badge */}
              {action.badge && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  action.badge.urgent ? 'bg-red-500' : 'bg-red-400'
                }`}>
                  {action.badge.count > 99 ? '99+' : action.badge.count}
                </div>
              )}
              
              {/* Icon */}
              <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className="h-6 w-6" />
              </div>
              
              {/* Title */}
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                {action.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
