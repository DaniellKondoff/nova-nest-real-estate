"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { formatTimeAgo, getStatusBadgeClasses, getInquiryTypeName } from "@/lib/utils";
import { MessageSquare, ArrowRight } from "lucide-react";

interface Inquiry {
  id: number;
  full_name: string;
  inquiry_type: "general" | "property_interest" | "viewing_request" | "valuation" | "selling" | "renting";
  status: "new" | "in_progress" | "responded" | "closed";
  created_at: string;
}

interface RecentInquiriesProps {
  limit?: number;
}

export function RecentInquiries({ limit = 10 }: RecentInquiriesProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentInquiries = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();

        const { data, error: fetchError } = await supabase
          .from("inquiries")
          .select("id, full_name, inquiry_type, status, created_at")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (fetchError) {
          throw fetchError;
        }

        setInquiries(data || []);
      } catch (err) {
        console.error("Error fetching recent inquiries:", err);
        setError("Грешка при зареждане на запитванията");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentInquiries();
  }, [limit]);

  const handleInquiryClick = (inquiryId: number) => {
    router.push(`/admin/inquiries`);
  };

  const handleViewAll = () => {
    router.push("/admin/inquiries");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
            Последни запитвания
          </h3>
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              {i < 2 && <div className="border-b border-gray-100"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
            Последни запитвания
          </h3>
        </div>
        
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          Последни запитвания
        </h3>
        
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
        >
          Виж всички
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Inquiries List */}
      {inquiries.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Няма нови запитвания</p>
        </div>
      ) : (
        <div className="space-y-0">
          {inquiries.map((inquiry, index) => (
            <div key={inquiry.id}>
              <button
                onClick={() => handleInquiryClick(inquiry.id)}
                className="w-full text-left hover:bg-gray-50 transition-colors duration-150 py-3 px-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Client Name */}
                    <p className="font-medium text-gray-900 truncate">
                      {inquiry.full_name}
                    </p>
                    
                    {/* Inquiry Type and Time */}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {getInquiryTypeName(inquiry.inquiry_type)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(inquiry.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="ml-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(inquiry.status)}`}>
                      {inquiry.status === 'new' && 'Ново'}
                      {inquiry.status === 'in_progress' && 'В процес'}
                      {inquiry.status === 'responded' && 'Отговорено'}
                      {inquiry.status === 'closed' && 'Затворено'}
                    </span>
                  </div>
                </div>
              </button>
              
              {/* Border between items */}
              {index < inquiries.length - 1 && (
                <div className="border-b border-gray-100"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
