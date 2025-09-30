"use client";

import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/admin/dashboard/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo 
            size="xl" 
            variant="dark" 
            className="mx-auto"
          />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Вход за администратори
          </h1>
        </div>

        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
