"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import TestimonialsTable from "@/components/admin/TestimonialsTable";
import { Plus } from "lucide-react";

interface Testimonial {
  id: number;
  client_name: string;
  rating: number | null;
  content_bg: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const supabase = getBrowserClient();
      
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, client_name, rating, content_bg, is_published, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTestimonials(data || []);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError("Грешка при зареждане на отзивите.");
    } finally {
      setLoading(false);
    }
  };

  // Load testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
    
    // Check authentication state
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          console.log("User not logged in - redirecting to login");
          alert("Моля, влезте в системата за да можете да управлявате отзиви.");
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

  // Handle approve
  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_published: true }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Неоторизиран достъп. Моля, влезте отново в системата.");
          window.location.href = '/admin/login';
          return;
        }
        throw new Error("Неуспешно одобряване на отзива");
      }

      // Update local state
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === id 
            ? { ...testimonial, is_published: true }
            : testimonial
        )
      );
    } catch (err) {
      console.error("Error approving testimonial:", err);
      alert("Грешка при одобряване на отзива");
    }
  };

  // Handle reject
  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_published: false }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Неоторизиран достъп. Моля, влезте отново в системата.");
          window.location.href = '/admin/login';
          return;
        }
        throw new Error("Неуспешно отхвърляне на отзива");
      }

      // Update local state
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === id 
            ? { ...testimonial, is_published: false }
            : testimonial
        )
      );
    } catch (err) {
      console.error("Error rejecting testimonial:", err);
      alert("Грешка при отхвърляне на отзива");
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този отзив?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Неоторизиран достъп. Моля, влезте отново в системата.");
          window.location.href = '/admin/login';
          return;
        }
        throw new Error("Неуспешно изтриване на отзива");
      }

      // Update local state
      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert("Грешка при изтриване на отзива");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Отзиви</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане на отзиви...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Отзиви</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchTestimonials}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Отзиви</h1>
        <button
          onClick={() => window.location.href = '/admin/testimonials/create'}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#B8941F] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добави отзив
        </button>
      </div>
      
      <TestimonialsTable 
        testimonials={testimonials}
        onApprove={isAuthenticated ? handleApprove : undefined}
        onReject={isAuthenticated ? handleReject : undefined}
        onDelete={isAuthenticated ? handleDelete : undefined}
      />
    </div>
  );
}

