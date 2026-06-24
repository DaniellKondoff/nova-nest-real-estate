"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import ContactsTable from "@/components/admin/crm/ContactsTable";
import CreateContactModal from "@/components/admin/crm/CreateContactModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import type { CrmContact, CrmContactStatus, CrmClientType } from "@/types/crm";

export default function AdminCrmPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CrmContactStatus | "">("");
  const [clientTypeFilter, setClientTypeFilter] = useState<CrmClientType | "">("");

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<CrmContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const PAGE_SIZE = 20;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, clientTypeFilter]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (clientTypeFilter) params.set("client_type", clientTypeFilter);
      params.set("page", String(currentPage));
      params.set("limit", String(PAGE_SIZE));

      const response = await fetch(`/api/admin/crm/contacts?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Неоторизиран достъп. Моля, влезте отново в системата.");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Грешка при зареждане на контактите");
      }

      const json = await response.json();
      setContacts(json.contacts ?? []);
      setTotalContacts(json.total ?? 0);
    } catch (err) {
      console.error("Error fetching CRM contacts:", err);
      setError("Грешка при зареждане на контактите.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, clientTypeFilter, currentPage]);

  // Auth check + initial fetch
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          alert("Моля, влезте в системата за да можете да управлявате CRM.");
          window.location.href = "/admin/login";
          return;
        }

        const supabase = getBrowserClient();
        const { data: adminProfile, error } = await supabase
          .from("admin_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !adminProfile) {
          alert("Нямате администраторски права.");
          window.location.href = "/admin/login";
          return;
        }

        setIsAuthenticated(true);
      } catch {
        alert("Грешка при проверка на автентичността.");
        window.location.href = "/admin/login";
      }
    };

    checkAuth();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchContacts();
  }, [isAuthenticated, fetchContacts]);

  const handleDelete = (contact: CrmContact) => {
    setContactToDelete(contact);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    setProcessingId(contactToDelete.id);

    try {
      const response = await fetch(`/api/admin/crm/contacts/${contactToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Неоторизиран достъп. Моля, влезте отново в системата.");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Грешка при изтриване");
      }

      setDeleteModalOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Грешка при изтриване на контакта");
    } finally {
      setIsDeleting(false);
      setProcessingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setContactToDelete(null);
  };

  const handleContactCreated = (_contact: CrmContact) => {
    setCurrentPage(1);
    fetchContacts();
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">CRM - Контакти</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">CRM - Контакти</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchContacts}
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM - Контакти</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#B8941F] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Нов контакт
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търси по име, телефон, имейл..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CrmContactStatus | "")}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
        >
          <option value="">Всички статуси</option>
          <option value="active">Активен</option>
          <option value="inactive">Неактивен</option>
          <option value="closed">Затворен</option>
        </select>

        <select
          value={clientTypeFilter}
          onChange={(e) => setClientTypeFilter(e.target.value as CrmClientType | "")}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
        >
          <option value="">Всички типове</option>
          <option value="buyer">Купувач</option>
          <option value="seller">Продавач</option>
          <option value="renter">Наемател</option>
          <option value="landlord">Наемодател</option>
        </select>
      </div>

      {/* Loading overlay while filters apply */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане на контакти...</p>
        </div>
      ) : (
        <>
          <ContactsTable
            contacts={contacts}
            onDelete={handleDelete}
            processingId={processingId}
          />
          <AdminPagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalContacts / PAGE_SIZE)}
            totalResults={totalContacts}
            onPageChange={setCurrentPage}
            itemsPerPage={PAGE_SIZE}
          />
        </>
      )}

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        propertyTitle={contactToDelete?.full_name ?? ""}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={isDeleting}
        title="Изтриване на контакт"
        message={
          contactToDelete ? (
            <>
              Сигурни ли сте, че искате да изтриете контакт{" "}
              <span className="font-semibold text-gray-900">{contactToDelete.full_name}</span>?
              Това действие не може да бъде отменено.
            </>
          ) : ""
        }
      />

      {/* Create modal */}
      <CreateContactModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleContactCreated}
      />
    </div>
  );
}
