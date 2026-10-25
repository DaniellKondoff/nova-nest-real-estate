"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import type { z } from "zod";
import { ContactFormSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

type InquiryFormData = z.infer<typeof ContactFormSchema>;

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-base text-primary placeholder:text-gray-400 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60";

/** Property inquiry form (client island). Sends the property id so the agent knows which listing it is about. */
export default function PropertyInquiryForm({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
  const [success, setSuccess] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      message: `Здравейте, интересувам се от имот „${propertyTitle}“. Моля, свържете се с мен за повече информация.`,
    },
  });

  const onSubmit: SubmitHandler<InquiryFormData> = async (values) => {
    setApiError(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone?.trim() || undefined,
          message: values.message,
          property_id: propertyId,
          inquiry_type: "property_interest",
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json?.success) throw new Error(json?.error || "Възникна грешка. Моля, опитайте отново.");
      setSuccess(true);
      reset();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Няма връзка със сървъра");
    }
  };

  if (success) {
    return (
      <div role="status" className="flex flex-col items-center rounded-xl bg-green-50 px-4 py-8 text-center text-green-800">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 font-semibold">Благодарим ви!</p>
        <p className="mt-1 text-sm">Ще се свържем с вас възможно най-скоро.</p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 min-h-11 text-sm font-semibold text-primary underline decoration-accent underline-offset-4"
        >
          Изпратете ново запитване
        </button>
      </div>
    );
  }

  const field = (
    name: keyof InquiryFormData,
    label: React.ReactNode,
    props: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div>
      <label htmlFor={`inq-${name}`} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={`inq-${name}`}
        {...register(name)}
        {...props}
        disabled={isSubmitting}
        aria-invalid={errors[name] ? "true" : "false"}
        aria-describedby={errors[name] ? `inq-${name}-error` : undefined}
        className={cn(inputClass, errors[name] ? "border-red-500" : "border-gray-300")}
      />
      {errors[name] && (
        <p id={`inq-${name}-error`} className="mt-1 text-sm text-red-600">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {apiError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {apiError}
        </div>
      )}

      {field("full_name", "Име и фамилия", { type: "text", autoComplete: "name", placeholder: "Иван Иванов" })}
      {field("email", "Имейл", { type: "email", autoComplete: "email", inputMode: "email", placeholder: "name@example.com" })}
      {field("phone", <>Телефон <span className="font-normal text-charcoal/50">(по избор)</span></>, {
        type: "tel",
        autoComplete: "tel",
        inputMode: "tel",
        placeholder: "+359 8XX XXX XXX",
      })}

      <div>
        <label htmlFor="inq-message" className="mb-1.5 block text-sm font-medium text-primary">
          Съобщение
        </label>
        <textarea
          id="inq-message"
          rows={4}
          {...register("message")}
          disabled={isSubmitting}
          aria-invalid={errors.message ? "true" : "false"}
          className={cn(inputClass, "resize-y", errors.message ? "border-red-500" : "border-gray-300")}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Изпращане...
          </>
        ) : (
          "Изпратете запитване"
        )}
      </button>
      <p className="text-center text-xs text-charcoal/50">Отговаряме в рамките на работния ден.</p>
    </form>
  );
}
