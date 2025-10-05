"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Check, TriangleAlert } from "lucide-react";
import { ContactInquirySchema } from "@/lib/validations";
import type { z } from "zod";

export interface PropertyContactProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
}

type InquiryFormData = z.infer<typeof ContactInquirySchema>;

function formatPriceEUR(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function PropertyContact({ propertyId, propertyTitle, propertyPrice }: PropertyContactProps): React.ReactElement {
  const numericPropertyId = Number(propertyId);
  const validPropertyId = Number.isFinite(numericPropertyId) ? numericPropertyId : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(ContactInquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      message: `Здравейте, интересувам се от имот '${propertyTitle}'. Моля, свържете се с мен за повече информация.`,
      propertyId: validPropertyId,
    },
    mode: "onSubmit",
  });

  const [success, setSuccess] = React.useState<boolean>(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit: SubmitHandler<InquiryFormData> = async (values) => {
    setApiError(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone?.trim() || undefined,
          message: values.message,
          propertyId: values.propertyId,
          subject: `Запитване за имот: ${propertyTitle}`,
          inquiry_type: "property_interest",
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Възникна грешка. Моля, опитайте отново.");
      }
      setSuccess(true);
      reset();
      // Auto-hide after 5s
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Няма връзка със сървъра";
      setApiError(msg);
    }
  };

  return (
    <aside className="sticky top-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-[#d4af37]/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-[#d4af37]" aria-hidden />
          </div>
          <h2 className="text-[#1a2642] text-xl font-semibold">Свържете се с нас</h2>
        </div>
        <p className="mb-6 text-sm text-gray-600">Попълнете формата за повече информация</p>

        {/* Property context */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-[#1a2642]/5 to-[#d4af37]/5 p-4 border border-gray-100">
          <div className="truncate text-sm font-semibold text-[#1a2642] mb-1" title={propertyTitle}>{propertyTitle}</div>
          <div className="text-lg font-bold text-[#d4af37]">{formatPriceEUR(propertyPrice)}</div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-green-50 p-3 text-green-800">
            <Check className="mt-0.5 h-5 w-5" aria-hidden />
            <div>Благодарим ви! Ще се свържем с вас скоро.</div>
          </div>
        )}

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-red-800">
            <TriangleAlert className="mt-0.5 h-5 w-5" aria-hidden />
            <div>{apiError}</div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Име и фамилия</label>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                disabled={isSubmitting}
                className={`w-full rounded-md border px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                placeholder="Иван Иванов"
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Имейл адрес</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                className={`w-full rounded-md border px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] ${errors.email ? "border-red-500" : "border-gray-300"}`}
                placeholder="name@example.com"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">Телефон <span className="text-gray-400">(по избор)</span></label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                disabled={isSubmitting}
                className={`w-full rounded-md border px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                placeholder="Формат: +359 XXX XXX XXX"
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">Съобщение</label>
              <textarea
                id="message"
                rows={5}
                {...register("message")}
                disabled={isSubmitting}
                className={`w-full resize-y rounded-md border px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] ${errors.message ? "border-red-500" : "border-gray-300"}`}
                placeholder="Напишете вашето съобщение тук..."
                aria-invalid={errors.message ? "true" : "false"}
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
            </div>

            {/* Hidden property id */}
            {validPropertyId !== undefined && (
              <input type="hidden" value={validPropertyId} {...register("propertyId", { valueAsNumber: true })} />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md bg-[#d4af37] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#c49d2f] ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  Изпращане...
                </span>
              ) : (
                "Изпратете запитване"
              )}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}


