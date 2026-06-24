"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PropertiesTable from "@/components/admin/PropertiesTable";
import PropertiesSearchBar from "@/components/admin/PropertiesSearchBar";
import AdminPagination from "@/components/admin/AdminPagination";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { getBrowserClient } from "@/lib/supabase/client";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import type { PropertyWithDetails } from "@/types/property";
import type { PropertyCategory } from "@/types/property";

const ITEMS_PER_PAGE = 20;

export default function PropertiesListPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Success/error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllPropertyCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = getBrowserClient();
        
        // Build query
        let query = supabase
          .from("properties")
          .select(`
            *,
            category:property_categories(*),
            neighborhood:neighborhoods(*),
            images:property_images(id, url, is_primary, sort_order)
          `, { count: 'exact' })
          .order("created_at", { ascending: false });

        // Apply search filter
        if (searchTerm) {
          query = query.or(`title_bg.ilike.%${searchTerm}%,address_bg.ilike.%${searchTerm}%`);
        }

        // Apply category filter
        if (categoryFilter) {
          query = query.eq("category_id", parseInt(categoryFilter));
        }

        // Apply status filter
        if (statusFilter) {
          query = query.eq("status", statusFilter as any);
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        // Transform data to PropertyWithDetails format
        const transformedData: PropertyWithDetails[] = (data || []).map((item: any) => ({
          property: item,
          category: item.category,
          neighborhood: item.neighborhood,
          images: item.images || [],
        }));

        setProperties(transformedData);
        setTotalResults(count || 0);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Грешка при зареждане на имотите");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchTerm, categoryFilter, statusFilter, currentPage]);

  // Clear selection when filters/page change
  useEffect(() => {
    setSelectedIds([]);
  }, [searchTerm, categoryFilter, statusFilter, currentPage]);

  const handleEdit = (id: string) => {
    router.push(`/admin/properties/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    const property = properties.find((p) => p.property.id.toString() === id);
    if (property) {
      setPropertyToDelete({
        id,
        title: property.property.title_bg,
      });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Грешка при изтриване на имота");
      }

      // Refresh properties list
      setProperties((prev) =>
        prev.filter((p) => p.property.id.toString() !== propertyToDelete.id)
      );
      setTotalResults((prev) => prev - 1);
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error("Error deleting property:", err);
      alert(err instanceof Error ? err.message : "Грешка при изтриване на имота");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const response = await fetch("/api/admin/properties/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyIds: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изтриване на имотите");
      }

      // Show success message
      setSuccessMessage(data.message || `Успешно изтрити ${data.deleted} имота`);

      // Refresh properties list
      const supabase = getBrowserClient();
      let query = supabase
        .from("properties")
        .select(
          `
          *,
          category:property_categories(*),
          neighborhood:neighborhoods(*),
          images:property_images(*)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Reapply filters
      if (searchTerm) {
        query = query.or(
          `title_bg.ilike.%${searchTerm}%,address_bg.ilike.%${searchTerm}%`
        );
      }
      if (categoryFilter) {
        query = query.eq("category_id", parseInt(categoryFilter));
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter as any);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: refreshedData, count } = await query;

      if (refreshedData) {
        const transformedData: PropertyWithDetails[] = refreshedData.map(
          (item: any) => ({
            property: item,
            category: item.category,
            neighborhood: item.neighborhood,
            images: item.images || [],
          })
        );
        setProperties(transformedData);
        setTotalResults(count || 0);
      }

      // Clear selection
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error bulk deleting properties:", err);
      alert(
        err instanceof Error ? err.message : "Грешка при изтриване на имотите"
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Імоти</h1>
        <p className="mt-2 text-gray-600">Управление на имоти и обяви</p>
      </div>

      {/* Search Bar */}
      <PropertiesSearchBar
        onSearch={setSearchTerm}
        onCategoryFilter={setCategoryFilter}
        onStatusFilter={setStatusFilter}
        categories={categories}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              Избрани {selectedIds.length} имота
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Изтрий избраните
            </button>
          </div>
          <button
            onClick={handleClearSelection}
            className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
          >
            Отмени избора
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <span className="ml-3 text-gray-600">Зареждане...</span>
        </div>
      ) : (
        <>
          {/* Properties Table */}
          <PropertiesTable
            properties={properties}
            selectedIds={selectedIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={setSelectedIds}
          />

          {/* Pagination */}
          {totalResults > 0 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        propertyTitle={propertyToDelete?.title || ""}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        loading={isDeleting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        propertyTitle={`${selectedIds.length} имота`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteModalOpen(false)}
        loading={isBulkDeleting}
        isBulk={true}
      />
    </div>
  );
}

