"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, X, Check, Loader2, Plus } from "lucide-react";
import { bgPhoneRegex, emailRegex } from "@/lib/validations";
import type { CrmContactWithRelations, CrmContactStatus, CrmClientType } from "@/types/crm";
import {
  CRM_STATUS_LABELS,
  CRM_CLIENT_TYPE_LABELS,
} from "@/types/crm";
import type { Tables } from "@/types/database.generated";

const editSchema = z.object({
  full_name: z.string().min(1, "Пълното ime е задължително"),
  phone: z.string().regex(bgPhoneRegex, "Невалиден телефонен номер. Използвайте: +359 XX XXX XXXX или 08X XXX XXX"),
  email: z
    .string()
    .optional()
    .refine((v) => !v || emailRegex.test(v), { message: "Невалиден имейл адрес" }),
  client_types: z.array(z.string()).optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  budget_currency: z.enum(["EUR", "BGN"]),
  general_notes: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

const CLIENT_TYPE_OPTIONS: { value: CrmClientType; label: string }[] = [
  { value: "buyer", label: "Купувач" },
  { value: "seller", label: "Продавач" },
  { value: "renter", label: "Наемател" },
  { value: "landlord", label: "Наемодател" },
];

const STATUS_BADGE: Record<CrmContactStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  closed: "bg-[#1a2642] text-white",
};

interface ContactInfoCardProps {
  contact: CrmContactWithRelations;
}

export default function ContactInfoCard({ contact }: ContactInfoCardProps) {
  const [data, setData] = useState(contact);
  const [neighborhoods, setNeighborhoods] = useState<Tables<"neighborhoods">[]>(contact.neighborhoods);

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [statusSaving, setStatusSaving] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [allNeighborhoods, setAllNeighborhoods] = useState<Tables<"neighborhoods">[]>([]);
  const [showNeighborhoodPicker, setShowNeighborhoodPicker] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [neighborhoodLoading, setNeighborhoodLoading] = useState(false);
  const [neighborhoodError, setNeighborhoodError] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      full_name: data.full_name,
      phone: data.phone,
      email: data.email ?? "",
      client_types: data.client_types,
      budget_min: data.budget_min != null ? String(data.budget_min) : "",
      budget_max: data.budget_max != null ? String(data.budget_max) : "",
      budget_currency: (data.budget_currency as "EUR" | "BGN") ?? "EUR",
      general_notes: data.general_notes ?? "",
    },
  });

  const selectedTypes = watch("client_types") ?? [];

  // Close neighborhood picker on outside click
  useEffect(() => {
    if (!showNeighborhoodPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowNeighborhoodPicker(false);
        setNeighborhoodSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNeighborhoodPicker]);

  // ESC to cancel edit
  useEffect(() => {
    if (!isEditing) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) cancelEdit();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isSubmitting]);

  const startEdit = () => {
    reset({
      full_name: data.full_name,
      phone: data.phone,
      email: data.email ?? "",
      client_types: data.client_types,
      budget_min: data.budget_min != null ? String(data.budget_min) : "",
      budget_max: data.budget_max != null ? String(data.budget_max) : "",
      budget_currency: (data.budget_currency as "EUR" | "BGN") ?? "EUR",
      general_notes: data.general_notes ?? "",
    });
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const toggleClientType = (value: string) => {
    const current = selectedTypes.includes(value)
      ? selectedTypes.filter((t) => t !== value)
      : [...selectedTypes, value];
    setValue("client_types", current);
  };

  const onSubmitEdit = async (formData: EditFormValues) => {
    setEditError(null);
    try {
      const response = await fetch(`/api/admin/crm/contacts/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || null,
          client_types: formData.client_types ?? [],
          budget_min: formData.budget_min ? Number(formData.budget_min) : null,
          budget_max: formData.budget_max ? Number(formData.budget_max) : null,
          budget_currency: formData.budget_currency,
          general_notes: formData.general_notes || null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setEditError(json.error ?? "Грешка при запазване");
        return;
      }

      setData((prev) => ({ ...prev, ...json.contact }));
      setIsEditing(false);
    } catch {
      setEditError("Грешка при свързване със сървъра");
    }
  };

  const handleStatusChange = async (newStatus: CrmContactStatus) => {
    if (statusSaving) return;
    setStatusSaving(true);
    try {
      const response = await fetch(`/api/admin/crm/contacts/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const json = await response.json();
        setData((prev) => ({ ...prev, status: json.contact.status }));
        setStatusSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setStatusSaved(false), 2000);
      }
    } finally {
      setStatusSaving(false);
    }
  };

  const openNeighborhoodPicker = async () => {
    setShowNeighborhoodPicker(true);
    setNeighborhoodSearch("");
    if (allNeighborhoods.length > 0) return;
    setNeighborhoodLoading(true);
    setNeighborhoodError(null);
    try {
      const res = await fetch("/api/neighborhoods", { credentials: "include" });
      const json = await res.json();
      setAllNeighborhoods(json.data?.neighborhoods ?? []);
    } catch {
      setNeighborhoodError("Грешка при зареждане на квартали");
    } finally {
      setNeighborhoodLoading(false);
    }
  };

  const handleLinkNeighborhood = async (neighborhood: Tables<"neighborhoods">) => {
    setShowNeighborhoodPicker(false);
    setNeighborhoodSearch("");
    try {
      const response = await fetch(`/api/admin/crm/contacts/${data.id}/neighborhoods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ neighborhood_id: neighborhood.id }),
      });
      if (response.ok) {
        setNeighborhoods((prev) => [...prev, neighborhood]);
      }
    } catch {
      // silently fail — user can retry
    }
  };

  const handleUnlinkNeighborhood = async (neighborhoodId: number) => {
    try {
      const response = await fetch(`/api/admin/crm/contacts/${data.id}/neighborhoods`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ neighborhood_id: neighborhoodId }),
      });
      if (response.ok) {
        setNeighborhoods((prev) => prev.filter((n) => n.id !== neighborhoodId));
      }
    } catch {
      // silently fail
    }
  };

  const linkedNeighborhoodIds = new Set(neighborhoods.map((n) => n.id));
  const availableNeighborhoods = allNeighborhoods.filter(
    (n) =>
      !linkedNeighborhoodIds.has(n.id) &&
      (neighborhoodSearch === "" ||
        n.name_bg.toLowerCase().includes(neighborhoodSearch.toLowerCase()))
  );

  function formatBudget(): string {
    if (data.budget_min == null && data.budget_max == null) return "Не е зададен";
    const min = data.budget_min != null ? data.budget_min.toLocaleString("bg-BG") : "—";
    const max = data.budget_max != null ? data.budget_max.toLocaleString("bg-BG") : "—";
    return `${min} – ${max} ${data.budget_currency}`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header: name + status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight">
          {isEditing ? "Редактиране" : data.full_name}
        </h2>

        {!isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {statusSaved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Запазено
              </span>
            )}
            <div className="relative">
              <select
                value={data.status}
                onChange={(e) => handleStatusChange(e.target.value as CrmContactStatus)}
                disabled={statusSaving}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 ${STATUS_BADGE[data.status]}`}
              >
                {Object.entries(CRM_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {statusSaving && (
                <Loader2 className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin" />
              )}
            </div>

            <button
              onClick={startEdit}
              className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors"
              title="Редактирай"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        /* ── Edit form ── */
        <form onSubmit={handleSubmit(onSubmitEdit as SubmitHandler<EditFormValues>)} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Пълно ime <span className="text-red-500">*</span>
            </label>
            <input
              {...register("full_name")}
              type="text"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Телефон <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone")}
              type="text"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Имейл</label>
            <input
              {...register("email")}
              type="email"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Client types */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Тип клиент</label>
            <div className="flex flex-wrap gap-2">
              {CLIENT_TYPE_OPTIONS.map(({ value, label }) => {
                const selected = selectedTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleClientType(value)}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                      selected
                        ? "bg-[#1a2642] text-white border-[#1a2642]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#1a2642]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Бюджет</label>
            <div className="flex gap-2 items-center">
              <input
                {...register("budget_min")}
                type="number"
                min={0}
                disabled={isSubmitting}
                placeholder="От"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                {...register("budget_max")}
                type="number"
                min={0}
                disabled={isSubmitting}
                placeholder="До"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              />
              <select
                {...register("budget_currency")}
                disabled={isSubmitting}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              >
                <option value="EUR">EUR</option>
                <option value="BGN">BGN</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Бележки</label>
            <textarea
              {...register("general_notes")}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50 resize-none"
            />
          </div>

          {editError && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-xs text-red-800">{editError}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#D4AF37] text-white text-sm font-medium rounded-md hover:bg-[#B8941F] disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Запази
            </button>
          </div>
        </form>
      ) : (
        /* ── Display mode ── */
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Телефон</span>
            <p className="text-gray-900 mt-0.5">{data.phone}</p>
          </div>

          {data.email && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Имейл</span>
              <p className="text-gray-900 mt-0.5">{data.email}</p>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Тип клиент</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.client_types.length === 0 ? (
                <span className="text-gray-400">—</span>
              ) : (
                data.client_types.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {CRM_CLIENT_TYPE_LABELS[t as CrmClientType] ?? t}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Бюджет</span>
            <p className="text-gray-900 mt-0.5">{formatBudget()}</p>
          </div>

          {data.general_notes && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Бележки</span>
              <p className="text-gray-700 mt-0.5 whitespace-pre-wrap">{data.general_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Preferred neighborhoods ── */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Предпочитани квартали
          </span>
          <button
            onClick={openNeighborhoodPicker}
            className="p-1 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors"
            title="Добави квартал"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {neighborhoods.length === 0 ? (
          <p className="text-xs text-gray-400">Няма добавени квартали</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {n.name_bg}
                <button
                  onClick={() => handleUnlinkNeighborhood(n.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                  title="Премахни"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Neighborhood picker dropdown */}
        {showNeighborhoodPicker && (
          <div
            ref={pickerRef}
            className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-56 overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={neighborhoodSearch}
                onChange={(e) => setNeighborhoodSearch(e.target.value)}
                placeholder="Търси квартал..."
                autoFocus
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {neighborhoodLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                </div>
              ) : neighborhoodError ? (
                <p className="p-3 text-xs text-red-600">{neighborhoodError}</p>
              ) : availableNeighborhoods.length === 0 ? (
                <p className="p-3 text-xs text-gray-400">Няма налични квартали</p>
              ) : (
                availableNeighborhoods.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleLinkNeighborhood(n)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {n.name_bg}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
