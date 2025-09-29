"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { ContactFormSchema, type ContactFormData } from "@/lib/validations";

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ContactForm({
  onSubmit,
  onSuccess,
  onError,
  className,
}: ContactFormProps): React.ReactElement {
  const [serverMessage, setServerMessage] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isSubmitted },
    setError,
    clearErrors,
    setFocus,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  React.useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0] as keyof ContactFormData;
      setFocus(firstKey);
    }
  }, [errors, isSubmitted, setFocus]);

  const nameValue = watch("full_name");
  const messageValue = watch("message");

  const onLocalSubmit = async (data: ContactFormData) => {
    setServerMessage(null);
    setServerError(null);
    try {
      // Placeholder behavior: simulate processing and log
      // Will be replaced with Supabase integration in next step
      // eslint-disable-next-line no-console
      console.log("ContactForm submit:", data);
      await onSubmit(data);
      setServerMessage("Вашето запитване беше изпратено успешно.");
      onSuccess?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Възникна неочаквана грешка.";
      setServerError(msg);
      onError?.(msg);
    }
  };

  const baseInput =
    "block w-full rounded-md border bg-white text-[16px] leading-[1.5] transition duration-200 placeholder:text-gray-400 text-[#2d3748]";
  const inputPadding = "px-4 py-3"; // ~12px 16px
  const inputBorderDefault = "border-[#e5e7eb]";
  const inputFocus =
    "focus:outline-none focus:border-2 focus:border-[#d4af37] focus:ring-0 focus:[box-shadow:0_0_0_3px_rgba(212,175,55,0.1)]";
  const inputError = "border-[#ef4444] bg-[#fef2f2]";
  const inputDisabled = "disabled:bg-[#f9fafb] disabled:text-[#9ca3af] disabled:cursor-not-allowed";

  const labelBase = "mb-2 block text-sm font-medium text-[#1a2642]";
  const helperText = "mt-1 text-[13px] text-[#6b7280]";
  const errorText = "mt-1 flex items-center gap-1 text-[13px] text-[#ef4444]";

  const buttonBase =
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-white transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const buttonGold =
    "bg-[#d4af37] hover:bg-[#c29d2f] focus-visible:ring-[#d4af37] disabled:bg-[#9ca3af]";

  return (
    <form
      aria-label="Форма за контакт"
      onSubmit={handleSubmit(onLocalSubmit)}
      className={cn("rounded-md bg-white p-6 md:p-8 shadow-subtle", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setServerError(null);
          setServerMessage(null);
          clearErrors();
        }
      }}
      noValidate
    >
      {/* Note for required fields */}
      <p className="mb-4 text-[13px] text-[#6b7280]">* Задължителни полета</p>

      {/* Name */}
      <div>
        <label htmlFor="full_name" className={labelBase}>
          Име и фамилия <span className="text-[#d4af37]" aria-hidden="true">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          inputMode="text"
          aria-required="true"
          aria-invalid={!!errors.full_name || undefined}
          aria-describedby={errors.full_name ? "full_name_error" : undefined}
          placeholder="Въведете вашето име"
          {...register("full_name")}
          className={cn(
            baseInput,
            inputPadding,
            errors.full_name ? inputError : inputBorderDefault,
            inputFocus,
            inputDisabled
          )}
          disabled={isSubmitting}
        />
        {errors.full_name && (
          <p id="full_name_error" role="alert" className={errorText} aria-live="polite">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.full_name.message?.toString()}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mt-5">
        <label htmlFor="email" className={labelBase}>
          Имейл адрес <span className="text-[#d4af37]" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          aria-required="true"
          aria-invalid={!!errors.email || undefined}
          aria-describedby={errors.email ? "email_error" : undefined}
          placeholder="email@example.com"
          {...register("email")}
          className={cn(
            baseInput,
            inputPadding,
            errors.email ? inputError : inputBorderDefault,
            inputFocus,
            inputDisabled
          )}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email_error" role="alert" className={errorText} aria-live="polite">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.email.message?.toString()}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="phone" className={labelBase}>
            Телефон
          </label>
          <span className={helperText}>(Незадължително. Формат: +359 XXX XXX XXX)</span>
        </div>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          aria-required="false"
          aria-invalid={!!errors.phone || undefined}
          aria-describedby={errors.phone ? "phone_error" : undefined}
          placeholder="+359 XXX XXX XXX"
          {...register("phone")}
          className={cn(
            baseInput,
            inputPadding,
            errors.phone ? inputError : inputBorderDefault,
            inputFocus,
            inputDisabled
          )}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p id="phone_error" role="alert" className={errorText} aria-live="polite">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {errors.phone.message?.toString()}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="mt-5">
        <label htmlFor="message" className={labelBase}>
          Съобщение <span className="text-[#d4af37]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          aria-required="true"
          aria-invalid={!!errors.message || undefined}
          aria-describedby={errors.message ? "message_error" : undefined}
          placeholder="Как можем да ви помогнем?"
          {...register("message")}
          className={cn(
            baseInput,
            "min-h-[120px] resize-y",
            inputPadding,
            errors.message ? inputError : inputBorderDefault,
            inputFocus,
            inputDisabled
          )}
          disabled={isSubmitting}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.message ? (
            <p id="message_error" role="alert" className={errorText} aria-live="polite">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {errors.message.message?.toString()}
            </p>
          ) : (
            <span className={helperText}>{(messageValue?.length ?? 0)}/1000</span>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          className={cn(buttonBase, buttonGold, "w-full sm:w-auto")}
          disabled={!isValid || isSubmitting || !nameValue || !messageValue}
          aria-disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Изпращане...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" aria-hidden="true" />
              Изпратете запитване
            </>
          )}
        </button>
      </div>

      {/* Live regions for SR announcements */}
      <p className="sr-only" aria-live="polite">
        {serverMessage ?? ""}
      </p>
      <p className="sr-only" aria-live="assertive">
        {serverError ?? ""}
      </p>
    </form>
  );
}


