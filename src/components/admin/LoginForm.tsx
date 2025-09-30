"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/lib/auth";

interface LoginFormProps {
  onSuccess: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithEmail(data.email, data.password);
      
      if (result.success) {
        onSuccess();
      } else {
        setError("Грешен имейл или парола");
      }
    } catch (err) {
      setError("Грешен имейл или парола");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            {...register("email", {
              required: "Имейлът е задължителен",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Невалиден имейл адрес",
              },
            })}
            type="email"
            label="Имейл"
            placeholder="example@email.com"
            required
            error={errors.email?.message}
            className="h-12"
          />

          <div className="relative">
            <Input
              {...register("password", {
                required: "Паролата е задължителна",
                minLength: {
                  value: 6,
                  message: "Паролата трябва да бъде поне 6 символа",
                },
              })}
              type={showPassword ? "text" : "password"}
              label="Парола"
              placeholder="Въведете паролата си"
              required
              error={errors.password?.message}
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#d4af37] hover:bg-[#b8941f] text-white font-medium h-12"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Влезте в системата
        </Button>
      </form>
    </div>
  );
}
