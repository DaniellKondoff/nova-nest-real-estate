"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typography";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

interface Feature {
  id: number;
  name_bg: string;
  name_en?: string;
  category: "interior" | "exterior" | "building" | "location";
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface FeatureFormData {
  name_bg: string;
  name_en: string;
  category: "interior" | "exterior" | "building" | "location";
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const initialFormData: FeatureFormData = {
  name_bg: "",
  name_en: "",
  category: "interior",
  icon: "",
  is_active: true,
  sort_order: 0,
};

const categoryLabels = {
  interior: "Интериор",
  exterior: "Екстериор", 
  building: "Сграда",
  location: "Локация"
};

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState<FeatureFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; feature: Feature | null }>({
    isOpen: false,
    feature: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeatureFormData, string>>>({});
  
  // Filter and sort states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name_bg" | "category" | "sort_order" | "created_at">("sort_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Load features
  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/features");
      if (!response.ok) throw new Error("Failed to load features");
      const data = await response.json();
      setFeatures(data.features || []);
    } catch (error) {
      console.error("Error loading features:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  // Filter and sort features
  const filteredAndSortedFeatures = features
    .filter(feature => {
      if (selectedCategory === "all") return true;
      return feature.category === selectedCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle date comparison
      if (sortBy === "created_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleInputChange = (field: keyof FeatureFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FeatureFormData, string>> = {};
    
    if (!formData.name_bg.trim()) {
      newErrors.name_bg = "Българското име е задължително";
    } else if (formData.name_bg.length > 100) {
      newErrors.name_bg = "Българското име не може да бъде повече от 100 символа";
    }
    
    if (formData.sort_order < 0) {
      newErrors.sort_order = "Сортиращият ред не може да бъде отрицателен";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const url = editingFeature 
        ? `/api/admin/features/${editingFeature.id}`
        : "/api/admin/features";
      
      const method = editingFeature ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save feature");
      }
      
      await loadFeatures();
      resetForm();
    } catch (error) {
      console.error("Error saving feature:", error);
      // You could add a toast notification here
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      name_bg: feature.name_bg,
      name_en: feature.name_en || "",
      category: feature.category,
      icon: feature.icon || "",
      is_active: feature.is_active,
      sort_order: feature.sort_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/admin/features/${feature.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete feature");
      }
      
      await loadFeatures();
    } catch (error) {
      console.error("Error deleting feature:", error);
      // You could add a toast notification here
    }
  };

  const toggleActive = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/admin/features/${feature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !feature.is_active }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update feature");
      }
      
      await loadFeatures();
    } catch (error) {
      console.error("Error updating feature:", error);
      // You could add a toast notification here
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingFeature(null);
    setShowForm(false);
    setErrors({});
  };

  const openDeleteModal = (feature: Feature) => {
    setDeleteModal({ isOpen: true, feature });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, feature: null });
  };

  const confirmDelete = () => {
    if (deleteModal.feature) {
      handleDelete(deleteModal.feature);
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
            Характеристики на имоти
          </Typography>
          <Typography variant="p" className="text-gray-600 mt-1">
            Управление на характеристики за имоти
          </Typography>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Добави характеристика
        </Button>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Филтър по категория:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">
                  Всички категории ({features.length})
                </option>
                {Object.entries(categoryLabels).map(([value, label]) => {
                  const count = features.filter(f => f.category === value).length;
                  return (
                    <option key={value} value={value}>
                      {label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Сортиране по:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="sort_order">Сортиращ ред</option>
                <option value="name_bg">Име (български)</option>
                <option value="category">Категория</option>
                <option value="created_at">Дата на създаване</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                title={`Сортиране ${sortOrder === "asc" ? "възходящо" : "низходящо"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Results Count and Clear Filter */}
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Показване на {filteredAndSortedFeatures.length} от {features.length} характеристики
            </div>
            {(selectedCategory !== "all" || sortBy !== "sort_order" || sortOrder !== "asc") && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSortBy("sort_order");
                  setSortOrder("asc");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Изчисти филтри
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <Typography variant="h3" className="text-lg font-medium text-gray-900 mb-6">
            {editingFeature ? "Редактиране на характеристика" : "Нова характеристика"}
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
                  placeholder="Например: Паркинг"
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
                  placeholder="Например: Parking"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value as FeatureFormData["category"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Икона (Lucide)
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  placeholder="Например: car"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сортиращ ред
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.sort_order ? "border-red-500" : ""}
                />
                {errors.sort_order && (
                  <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Активна характеристика
              </label>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                className="min-w-[160px] font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {editingFeature ? "Запази промените" : "Създай характеристика"}
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
                  Икона
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Име (български)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Име (английски)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сортиращ ред
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFeatures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {features.length === 0 
                      ? "Няма създадени характеристики" 
                      : "Няма характеристики, отговарящи на филтъра"
                    }
                  </td>
                </tr>
              ) : (
                filteredAndSortedFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feature.icon ? (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">{feature.icon}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {feature.name_bg}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {feature.name_en || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryLabels[feature.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {feature.sort_order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(feature)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          feature.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {feature.is_active ? (
                          <>
                            <Eye className="h-3 w-3" />
                            Активна
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Неактивна
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(feature)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(feature)}
                          className="text-red-600 hover:text-red-900"
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
        propertyTitle={deleteModal.feature?.name_bg || ""}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Изтриване на характеристика"
        message={`Сигурни ли сте, че искате да изтриете характеристиката "${deleteModal.feature?.name_bg}"? Това действие не може да бъде отменено.`}
      />
    </div>
  );
}
