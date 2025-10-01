"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typography";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

interface Neighborhood {
  id: number;
  name_bg: string;
  name_en?: string;
  slug: string;
  description?: string;
  center_lat?: number;
  center_lng?: number;
  amenities?: any;
  transport_info?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface NeighborhoodFormData {
  name_bg: string;
  name_en: string;
  slug: string;
  description: string;
  center_lat: string;
  center_lng: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const initialFormData: NeighborhoodFormData = {
  name_bg: "",
  name_en: "",
  slug: "",
  description: "",
  center_lat: "",
  center_lng: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

export default function NeighborhoodsManager() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null);
  const [formData, setFormData] = useState<NeighborhoodFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; neighborhood: Neighborhood | null }>({
    isOpen: false,
    neighborhood: null,
  });
  const [errors, setErrors] = useState<Partial<NeighborhoodFormData>>({});

  // Load neighborhoods
  const loadNeighborhoods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/neighborhoods");
      if (!response.ok) throw new Error("Failed to load neighborhoods");
      const data = await response.json();
      setNeighborhoods(data.neighborhoods || []);
    } catch (error) {
      console.error("Error loading neighborhoods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  // Auto-generate slug from Bulgarian name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const handleInputChange = (field: keyof NeighborhoodFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when Bulgarian name changes
      if (field === "name_bg") {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NeighborhoodFormData> = {};
    
    if (!formData.name_bg.trim()) {
      newErrors.name_bg = "Българското име е задължително";
    } else if (formData.name_bg.length > 100) {
      newErrors.name_bg = "Българското име не може да бъде повече от 100 символа";
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug е задължителен";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug може да съдържа само малки букви, цифри и тирета";
    }

    // Validate coordinates - both or neither
    const hasLat = formData.center_lat.trim() !== "";
    const hasLng = formData.center_lng.trim() !== "";
    
    if (hasLat !== hasLng) {
      newErrors.center_lat = "Ако е предоставена една координата, трябва да бъдат предоставени и двете";
      newErrors.center_lng = "Ако е предоставена една координата, трябва да бъдат предоставени и двете";
    }

    // Validate coordinate values if provided
    if (hasLat && hasLng) {
      const lat = parseFloat(formData.center_lat);
      const lng = parseFloat(formData.center_lng);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.center_lat = "Невалидна ширина (трябва да бъде между -90 и 90)";
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.center_lng = "Невалидна дължина (трябва да бъде между -180 и 180)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const url = editingNeighborhood 
        ? `/api/admin/neighborhoods/${editingNeighborhood.id}`
        : "/api/admin/neighborhoods";
      
      const method = editingNeighborhood ? "PUT" : "POST";
      
      // Prepare data for API
      const apiData: any = {
        name_bg: formData.name_bg,
        name_en: formData.name_en || undefined,
        slug: formData.slug,
        description: formData.description || undefined,
        seo_title: formData.seo_title || undefined,
        seo_description: formData.seo_description || undefined,
        seo_keywords: formData.seo_keywords || undefined,
      };

      // Add coordinates if both are provided
      if (formData.center_lat.trim() && formData.center_lng.trim()) {
        apiData.center_lat = parseFloat(formData.center_lat);
        apiData.center_lng = parseFloat(formData.center_lng);
      }
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save neighborhood");
      }
      
      await loadNeighborhoods();
      resetForm();
    } catch (error) {
      console.error("Error saving neighborhood:", error);
      // You could add a toast notification here
    }
  };

  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood);
    setFormData({
      name_bg: neighborhood.name_bg,
      name_en: neighborhood.name_en || "",
      slug: neighborhood.slug,
      description: neighborhood.description || "",
      center_lat: neighborhood.center_lat?.toString() || "",
      center_lng: neighborhood.center_lng?.toString() || "",
      seo_title: neighborhood.seo_title || "",
      seo_description: neighborhood.seo_description || "",
      seo_keywords: neighborhood.seo_keywords || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (neighborhood: Neighborhood) => {
    try {
      const response = await fetch(`/api/admin/neighborhoods/${neighborhood.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete neighborhood");
      }
      
      await loadNeighborhoods();
    } catch (error) {
      console.error("Error deleting neighborhood:", error);
      // You could add a toast notification here
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingNeighborhood(null);
    setShowForm(false);
    setErrors({});
  };

  const openDeleteModal = (neighborhood: Neighborhood) => {
    setDeleteModal({ isOpen: true, neighborhood });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, neighborhood: null });
  };

  const confirmDelete = () => {
    if (deleteModal.neighborhood) {
      handleDelete(deleteModal.neighborhood);
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <Typography variant="p" className="text-gray-500 mt-2">Зареждане...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-xl font-semibold text-gray-900">
            Квартали Стара Загора
          </Typography>
          <Typography variant="p" className="text-gray-600 mt-1">
            Управление на квартали в Стара Загора
          </Typography>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Добави квартал
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <Typography variant="h3" className="text-lg font-medium text-gray-900 mb-6">
            {editingNeighborhood ? "Редактиране на квартал" : "Нов квартал"}
          </Typography>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име (български) *
                </label>
                <Input
                  value={formData.name_bg}
                  onChange={(e) => handleInputChange("name_bg", e.target.value)}
                  placeholder="Например: Център"
                  className={errors.name_bg ? "border-red-500" : ""}
                />
                {errors.name_bg && (
                  <p className="text-red-500 text-sm mt-1">{errors.name_bg}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име (английски)
                </label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => handleInputChange("name_en", e.target.value)}
                  placeholder="Например: Center"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="centar"
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Кратко описание на квартала..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Централна ширина (lat)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.center_lat}
                  onChange={(e) => handleInputChange("center_lat", e.target.value)}
                  placeholder="42.4258"
                  className={errors.center_lat ? "border-red-500" : ""}
                />
                {errors.center_lat && (
                  <p className="text-red-500 text-sm mt-1">{errors.center_lat}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Централна дължина (lng)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.center_lng}
                  onChange={(e) => handleInputChange("center_lng", e.target.value)}
                  placeholder="25.6345"
                  className={errors.center_lng ? "border-red-500" : ""}
                />
                {errors.center_lng && (
                  <p className="text-red-500 text-sm mt-1">{errors.center_lng}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO заглавие
                </label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange("seo_title", e.target.value)}
                  placeholder="SEO заглавие"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO описание
                </label>
                <Input
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange("seo_description", e.target.value)}
                  placeholder="SEO описание"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO ключови думи
                </label>
                <Input
                  value={formData.seo_keywords}
                  onChange={(e) => handleInputChange("seo_keywords", e.target.value)}
                  placeholder="ключови, думи, разделени, със, запетаи"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                className="min-w-[160px] font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {editingNeighborhood ? "Запази промените" : "Създай квартал"}
              </Button>
              <Button 
                type="button" 
                onClick={resetForm}
                className="min-w-[100px] bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Отказ
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Име (български)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Име (английски)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Координати
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {neighborhoods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Няма създадени квартали
                  </td>
                </tr>
              ) : (
                neighborhoods.map((neighborhood) => (
                  <tr key={neighborhood.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {neighborhood.name_bg}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {neighborhood.name_en || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {neighborhood.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {neighborhood.center_lat && neighborhood.center_lng ? (
                          <span className="font-mono">
                            {neighborhood.center_lat.toFixed(4)}, {neighborhood.center_lng.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(neighborhood)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Редактирай"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(neighborhood)}
                          className="text-red-600 hover:text-red-900"
                          title="Изтрий"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        propertyTitle={deleteModal.neighborhood?.name_bg || ""}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Изтриване на квартал"
        message={`Сигурни ли сте, че искате да изтриете квартала "${deleteModal.neighborhood?.name_bg}"? Това действие не може да бъде отменено.`}
      />
    </div>
  );
}
