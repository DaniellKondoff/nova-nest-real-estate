"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentInquiries } from "@/components/admin/RecentInquiries";
import { RecentProperties } from "@/components/admin/RecentProperties";
import { QuickActions } from "@/components/admin/QuickActions";
import { Home, MessageSquare, Star, TrendingUp } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalProperties: number;
  activeInquiries: number;
  pendingTestimonials: number;
  propertiesThisMonth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeInquiries: 0,
    pendingTestimonials: 0,
    propertiesThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getBrowserClient();

        // Get current month start date
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all statistics in parallel
        const [propertiesRes, activeInquiriesRes, pendingTestimonialsRes, monthlyPropertiesRes] = await Promise.all([
          // Total properties (excluding archived)
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .neq("status", "archived"),
          
          // Active inquiries (new or in_progress status)
          supabase
            .from("inquiries")
            .select("id", { count: "exact", head: true })
            .in("status", ["new", "in_progress"]),
          
          // Pending testimonials (not published)
          supabase
            .from("testimonials")
            .select("id", { count: "exact", head: true })
            .eq("is_published", false),
          
          // Properties created this month
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .gte("created_at", monthStart.toISOString()),
        ]);

        // Check for errors
        if (propertiesRes.error || activeInquiriesRes.error || pendingTestimonialsRes.error || monthlyPropertiesRes.error) {
          throw new Error("Грешка при зареждане на статистиките от базата данни");
        }

        setStats({
          totalProperties: propertiesRes.count || 0,
          activeInquiries: activeInquiriesRes.count || 0,
          pendingTestimonials: pendingTestimonialsRes.count || 0,
          propertiesThisMonth: monthlyPropertiesRes.count || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err instanceof Error ? err.message : "Възникна грешка при зареждането на статистиките");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader pageTitle="Табло за управление" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="text-right">
                    <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader pageTitle="Табло за управление" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Грешка:</strong> {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Опитай отново
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader pageTitle="Табло за управление" />
      
      <div className="p-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Общо имоти"
            value={stats.totalProperties}
            icon={Home}
            color="blue"
            trend="Активни имоти"
          />
          
          <StatsCard
            title="Активни запитвания"
            value={stats.activeInquiries}
            icon={MessageSquare}
            color="green"
            trend="Нови и прочетени"
          />
          
          <StatsCard
            title="Чакащи отзиви"
            value={stats.pendingTestimonials}
            icon={Star}
            color="yellow"
            trend="За одобрение"
          />
          
          <StatsCard
            title="Имоти този месец"
            value={stats.propertiesThisMonth}
            icon={TrendingUp}
            color="purple"
            trend="Новодобавени"
          />
        </div>

        {/* Recent Activity Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentInquiries limit={8} />
          <RecentProperties limit={8} />
        </div>

        {/* Quick Actions Section */}
        <QuickActions />
      </div>
    </div>
  );
}