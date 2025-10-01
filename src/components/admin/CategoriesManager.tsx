"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typography";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

interface Category {
  id: number;
  name_bg: string;
  name_en?: string;
  slug: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface CategoryFormData {
  name_bg: string;
  name_en: string;
  slug: string;
  icon: string;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  name_bg: "",
  name_en: "",
  slug: "",
  icon: "",
  is_active: true,
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to load categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when Bulgarian name changes
      if (field === "name_bg" && typeof value === "string") {
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
    const newErrors: Partial<CategoryFormData> = {};
    
    if (!formData.name_bg.trim()) {
      newErrors.name_bg = "Българското име е задължително";
    } else if (formData.name_bg.length > 50) {
      newErrors.name_bg = "Българското име не може да бъде повече от 50 символа";
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug е задължителен";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug може да съдържа само малки букви, цифри и тирета";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      
      const method = editingCategory ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }
      
      await loadCategories();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      // You could add a toast notification here
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_bg: category.name_bg,
      name_en: category.name_en || "",
      slug: category.slug,
      icon: category.icon || "",
      is_active: category.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }
      
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      // You could add a toast notification here
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !category.is_active }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }
      
      await loadCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      // You could add a toast notification here
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCategory(null);
    setShowForm(false);
    setErrors({});
  };

  const openDeleteModal = (category: Category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const confirmDelete = () => {
    if (deleteModal.category) {
      handleDelete(deleteModal.category);
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
            Категории имоти
          </Typography>
          <Typography variant="p" className="text-gray-600 mt-1">
            Управление на категории за имоти
          </Typography>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Добави категория
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Typography variant="h3" className="text-lg font-medium text-gray-900 mb-4">
            {editingCategory ? "Редактиране на категория" : "Нова категория"}
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
                  placeholder="Например: Апартаменти"
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
                  placeholder="Например: Apartments"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="apartments"
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Икона (Lucide)
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  placeholder="Например: home"
                />
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
                Активна категория
              </label>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit">
                {editingCategory ? "Запази промените" : "Създай категория"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
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
                  Slug
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
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Няма създадени категории
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.icon ? (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">{category.icon}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name_bg}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.name_en || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.is_active ? (
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
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
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
        propertyTitle={deleteModal.category?.name_bg || ""}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Изтриване на категория"
        message={`Сигурни ли сте, че искате да изтриете категорията "${deleteModal.category?.name_bg}"? Това действие не може да бъде отменено.`}
      />
    </div>
  );
}
