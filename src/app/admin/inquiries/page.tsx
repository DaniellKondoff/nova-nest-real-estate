"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import InquiriesTable from "@/components/admin/InquiriesTable";
import InquiryDetailsModal from "@/components/admin/InquiryDetailsModal";
import InquiriesFilter from "@/components/admin/InquiriesFilter";
import { Eye } from "lucide-react";

interface Inquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  inquiry_type: "general" | "property_interest" | "viewing_request" | "valuation" | "selling" | "renting";
  message: string;
  status: "new" | "in_progress" | "responded" | "closed";
  created_at: string;
  property: {
    id: number;
    title_bg: string;
    price_bgn: number | null;
    price_eur: number | null;
  } | null;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const supabase = getBrowserClient();
      
      const { data, error } = await supabase
        .from("inquiries")
        .select(`
          id,
          full_name,
          email,
          phone,
          inquiry_type,
          message,
          status,
          created_at,
          property:properties(id, title_bg, price_bgn, price_eur)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setInquiries(data || []);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError("Грешка при зареждане на запитванията.");
    } finally {
      setLoading(false);
    }
  };

  // Load inquiries on component mount
  useEffect(() => {
    fetchInquiries();
    
    // Check authentication state
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          console.log("User not logged in - redirecting to login");
          alert("Моля, влезте в системата за да можете да управлявате запитванията.");
          window.location.href = '/admin/login';
          return;
        }
        
        // Check if user is admin
        const supabase = getBrowserClient();
        const { data: adminProfile, error } = await supabase
          .from("admin_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
          
        if (error || !adminProfile) {
          alert("Нямате администраторски права.");
          window.location.href = '/admin/login';
          return;
        }
        
        setIsAuthenticated(true);
      } catch (err) {
        alert("Грешка при проверка на автентичността.");
        window.location.href = '/admin/login';
      }
    };
    checkAuth();
  }, []);

  // Handle view details
  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
    
    // Note: Auto-mark as read functionality removed to prevent authentication errors
    // Users can manually mark as read using the button in the modal
  };

  // Update inquiry status
  const updateStatus = async (id: string, status: string) => {
    try {
      
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If it's an authentication error, show a specific message
        if (response.status === 401) {
          const errorMsg = "Неоторизиран достъп. Моля, влезте отново в системата.";
          console.error(errorMsg);
          alert(errorMsg);
          // Redirect to login
          window.location.href = '/admin/login';
          return;
        }
        
        throw new Error(`Неуспешно обновяване на статуса: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === parseInt(id) 
            ? { ...inquiry, status: status as Inquiry["status"] }
            : inquiry
        )
      );

      // Update selected inquiry if it's the same one
      if (selectedInquiry?.id === parseInt(id)) {
        setSelectedInquiry(prev => 
          prev ? { ...prev, status: status as Inquiry["status"] } : null
        );
      }

      // Auto-close modal after successful status update
      setTimeout(() => {
        handleCloseModal();
      }, 1000); // Close after 1 second to show the success
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Грешка при обновяване на статуса: ${err instanceof Error ? err.message : 'Неизвестна грешка'}`);
      // Don't re-throw to prevent unhandled promise rejections
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInquiry(null);
  };

  // Filter inquiries based on selected filters
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inquiry => {
      const statusMatch = !statusFilter || inquiry.status === statusFilter;
      const typeMatch = !typeFilter || inquiry.inquiry_type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [inquiries, statusFilter, typeFilter]);

  // Check if user is authenticated before showing status update buttons
  const canUpdateStatus = isAuthenticated;

  // Handle filter changes
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
  };

  const handleTypeFilter = (type: string | null) => {
    setTypeFilter(type);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане на запитвания...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchInquiries}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
      
      <InquiriesFilter
        onStatusFilter={handleStatusFilter}
        onTypeFilter={handleTypeFilter}
      />
      
      {/* Results summary */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredInquiries.length === inquiries.length ? (
          <span>Показват се всички {inquiries.length} запитвания</span>
        ) : (
          <span>
            Показват се {filteredInquiries.length} от {inquiries.length} запитвания
          </span>
        )}
      </div>
      
      <InquiriesTable 
        inquiries={filteredInquiries} 
        onViewDetails={handleViewDetails}
      />
      
      <InquiryDetailsModal
        inquiry={selectedInquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={canUpdateStatus ? updateStatus : async () => {}}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
