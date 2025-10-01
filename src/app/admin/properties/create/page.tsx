"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to create property
      console.log("Form data:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirect to properties list on success
      router.push("/admin/properties/");
    } catch (error) {
      console.error("Error creating property:", error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link
          href="/admin/dashboard/"
          className="hover:text-[#D4AF37] transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/admin/properties/"
          className="hover:text-[#D4AF37] transition-colors"
        >
          Імоти
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Добави</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Добави нов имот</h1>
        <p className="mt-2 text-gray-600">
          Попълнете информацията за новия имот
        </p>
      </div>

      {/* Property Form */}
      <PropertyForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}

