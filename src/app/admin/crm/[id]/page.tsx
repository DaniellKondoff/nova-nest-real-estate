import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { getCrmContactById } from "@/lib/queries/crm";
import ContactInfoCard from "@/components/admin/crm/ContactInfoCard";
import LinkedProperties from "@/components/admin/crm/LinkedProperties";
import ActivityTimeline from "@/components/admin/crm/ActivityTimeline";

export default async function CrmContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await getServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminProfile) {
    redirect("/admin/login");
  }

  const contact = await getCrmContactById(id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/dashboard" className="hover:text-gray-700 transition-colors">
          Админ
        </Link>
        <span>/</span>
        <Link href="/admin/crm/" className="hover:text-gray-700 transition-colors">
          CRM
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{contact.full_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: contact info + neighborhoods */}
        <div className="lg:col-span-1">
          <ContactInfoCard contact={contact} />
        </div>

        {/* Right column: linked properties + activity timeline */}
        <div className="lg:col-span-2 space-y-6">
          <LinkedProperties
            contactId={id}
            initialProperties={contact.properties}
          />
          <ActivityTimeline
            contactId={id}
            initialActivities={contact.activities}
          />
        </div>
      </div>
    </div>
  );
}
