import { Suspense } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import InquiriesTable from "@/components/admin/InquiriesTable";
import { Eye } from "lucide-react";

export default async function AdminInquiriesPage() {
  const supabase = await getSupabaseClient();

  // Fetch inquiries with property data
  const { data: inquiries, error } = await supabase
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
      property:properties(id, title_bg)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inquiries:", error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Грешка при зареждане на запитванията.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
      
      <Suspense fallback={
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане на запитвания...</p>
        </div>
      }>
        <InquiriesTable inquiries={inquiries || []} />
      </Suspense>
    </div>
  );
}
