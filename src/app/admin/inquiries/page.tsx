"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
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
  }, []);

  // Handle view details
  const handleViewDetails = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
    
    // Auto-mark as read if status is 'new'
    if (inquiry.status === "new") {
      await updateStatus(inquiry.id.toString(), "in_progress");
    }
  };

  // Update inquiry status
  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Неуспешно обновяване на статуса.");
      }

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
    } catch (err) {
      console.error("Error updating status:", err);
      // You could show a toast notification here
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
        onStatusUpdate={updateStatus}
      />
    </div>
  );
}
