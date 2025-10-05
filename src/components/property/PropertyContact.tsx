"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Check, TriangleAlert, Home, Phone, Copy, X } from "lucide-react";
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
  const [isPhoneModalOpen, setIsPhoneModalOpen] = React.useState<boolean>(false);
  const [copySuccess, setCopySuccess] = React.useState<boolean>(false);

  const phoneNumber = "+359 888 123 456";
  const phoneNumberForCall = "+359888123456";

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

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
        {/* Agent Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gray-100 rounded-full border border-gray-200">
              <Home className="h-6 w-6 text-[#1a2642]" aria-hidden />
            </div>
            <div>
              <h2 className="text-[#1a2642] text-xl font-bold">Атанаска Кондова</h2>
              <p className="text-gray-600 text-sm">Агент по недвижими имоти</p>
            </div>
          </div>
          
          {/* Phone Number Button */}
          <button 
            onClick={() => setIsPhoneModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-[#1a2642] hover:bg-[#2a3a5c] text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
          >
            <Phone className="h-5 w-5" aria-hidden />
            <span>{phoneNumber}</span>
          </button>
        </div>

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

        {/* Contact Form Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#d4af37]/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-[#d4af37]" aria-hidden />
            </div>
            <h3 className="text-[#1a2642] text-lg font-semibold">Изпратете запитване</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600">Попълнете формата за повече информация</p>
        </div>

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

      {/* Phone Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPhoneModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Затвори"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a2642] mb-2">Атанаска Кондова</h3>
              <p className="text-gray-600">Агент по недвижими имоти</p>
            </div>

            {/* Phone Number */}
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-[#1a2642] mb-4">{phoneNumber}</p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Call Button */}
                <a
                  href={`tel:${phoneNumberForCall}`}
                  className="w-full flex items-center justify-center gap-3 bg-[#d4af37] hover:bg-[#c49d2f] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  <Phone className="h-5 w-5" />
                  <span>Позвънете</span>
                </a>
                
                {/* Copy Button */}
                <button
                  onClick={handleCopyPhone}
                  className="w-full flex items-center justify-center gap-3 border-2 border-[#1a2642] hover:bg-[#1a2642] hover:text-white text-[#1a2642] font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Копирано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span>Копирайте номера</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-500">
              <p>Работно време: Пон-Пет 9:00-18:00</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}


