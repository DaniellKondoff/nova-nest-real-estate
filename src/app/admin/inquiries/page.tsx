"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InquiriesTable from "@/components/admin/InquiriesTable";
import InquiryDetailsModal from "@/components/admin/InquiryDetailsModal";
import InquiriesFilter, {
  INQUIRIES_CHANGED_EVENT,
  statusOptions,
  typeOptions,
} from "@/components/admin/InquiriesFilter";
import AdminPagination from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import type { AdminInquiry as Inquiry } from "@/types/admin";

const PAGE_SIZE = 20;

/** Only accept values the filter offers – anything else in the URL is ignored */
function pickOption(value: string | null, options: { value: string | null }[]): string | null {
  return value && options.some((o) => o.value === value) ? value : null;
}

function AdminInquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useAdminToast();

  const statusFilter = pickOption(searchParams.get("status"), statusOptions);
  const typeFilter = pickOption(searchParams.get("type"), typeOptions);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Writes filters/page to the URL; any filter change goes back to page 1 */
  const updateQuery = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (params.get("page") === "1") params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE) });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("inquiry_type", typeFilter);

    setRefreshing(true);
    fetch(`/api/admin/inquiries/?${params}`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          window.location.href = "/admin/login/";
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        setInquiries(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching inquiries:", err);
        setError("Грешка при зареждане на запитванията.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setRefreshing(false);
        setInitialLoading(false);
      });

    return () => controller.abort();
  }, [statusFilter, typeFilter, currentPage, reloadKey]);

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedInquiry(null);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        window.location.href = "/admin/login/";
        return;
      }
      if (!response.ok) {
        throw new Error(`Неуспешно обновяване на статуса: ${response.status}`);
      }

      const inquiryId = Number(id);
      const nextStatus = status as Inquiry["status"];
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? { ...i, status: nextStatus } : i)));
      setSelectedInquiry((prev) => (prev?.id === inquiryId ? { ...prev, status: nextStatus } : prev));
      window.dispatchEvent(new Event(INQUIRIES_CHANGED_EVENT));
      toast.success("Статусът е обновен.");

      // Auto-close the modal; with a status filter the row may no longer belong on this page
      setTimeout(() => {
        handleCloseModal();
        if (statusFilter) setReloadKey((k) => k + 1);
      }, 1000);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(`Грешка при обновяване на статуса: ${err instanceof Error ? err.message : "Неизвестна грешка"}`);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-500">Зареждане на запитвания...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Запитвания</h1>

      <InquiriesFilter
        status={statusFilter}
        type={typeFilter}
        onStatusChange={(status) => updateQuery({ status, page: null })}
        onTypeChange={(type) => updateQuery({ type, page: null })}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Опитай отново
          </button>
        </div>
      ) : (
        <div className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={refreshing}>
          <InquiriesTable inquiries={inquiries} onViewDetails={handleViewDetails} />
          <AdminPagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            totalResults={total}
            onPageChange={(page) => updateQuery({ page: String(page) })}
            itemsPerPage={PAGE_SIZE}
          />
        </div>
      )}

      <InquiryDetailsModal
        inquiry={selectedInquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={updateStatus}
      />
    </div>
  );
}

/** Admin auth is enforced by middleware.ts and admin/layout.tsx – no client re-check here */
export default function AdminInquiriesPage() {
  return (
    <Suspense fallback={null}>
      <AdminInquiriesContent />
    </Suspense>
  );
}
