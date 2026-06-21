"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { bgPhoneRegex, emailRegex } from "@/lib/validations";
import type { CrmContact } from "@/types/crm";

const schema = z.object({
  full_name: z.string().min(1, "Пълното име е задължително"),
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

type FormValues = z.infer<typeof schema>;

const CLIENT_TYPE_OPTIONS = [
  { value: "buyer", label: "Купувач" },
  { value: "seller", label: "Продавач" },
  { value: "renter", label: "Наемател" },
  { value: "landlord", label: "Наемодател" },
];

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: CrmContact) => void;
}

export default function CreateContactModal({ isOpen, onClose, onSuccess }: CreateContactModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      budget_currency: "EUR",
      client_types: [],
    },
  });

  const selectedTypes = watch("client_types") ?? [];

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !isSubmitting) onClose();
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const toggleClientType = (value: string) => {
    const current = selectedTypes.includes(value)
      ? selectedTypes.filter((t) => t !== value)
      : [...selectedTypes, value];
    setValue("client_types", current);
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/admin/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          client_types: data.client_types ?? [],
          budget_min: data.budget_min ? Number(data.budget_min) : null,
          budget_max: data.budget_max ? Number(data.budget_max) : null,
          budget_currency: data.budget_currency,
          general_notes: data.general_notes || null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setSubmitError(json.error ?? "Грешка при създаване на контакта");
        return;
      }

      reset();
      setSubmitError(null);
      onSuccess(json.contact as CrmContact);
      onClose();
    } catch {
      setSubmitError("Грешка при свързване със сървъра");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-contact-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="create-contact-title" className="text-lg font-semibold text-gray-900">
            Нов контакт
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FormValues>)} className="px-6 py-4 space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пълно име <span className="text-red-500">*</span>
            </label>
            <input
              {...register("full_name")}
              type="text"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              placeholder="Иван Иванов"
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone")}
              type="text"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              placeholder="+359 88 123 4567"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
            <input
              {...register("email")}
              type="email"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
              placeholder="ivan@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Client types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип клиент</label>
            <div className="flex flex-wrap gap-2">
              {CLIENT_TYPE_OPTIONS.map(({ value, label }) => {
                const selected = selectedTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleClientType(value)}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Бюджет</label>
            <div className="flex gap-2 items-center">
              <input
                {...register("budget_min")}
                type="number"
                min={0}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
                placeholder="От"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                {...register("budget_max")}
                type="number"
                min={0}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50"
                placeholder="До"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Бележки</label>
            <textarea
              {...register("general_notes")}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-50 resize-none"
              placeholder="Допълнителна информация..."
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-md hover:bg-[#B8941F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Създай контакт
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
