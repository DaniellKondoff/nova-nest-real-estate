"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertiesListPage() {
  const router = useRouter();

  return (
    <div>
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Імоти</h1>
        <p className="mt-2 text-gray-600">
          Управление на имоти и обяви
        </p>
      </div>

      {/* Placeholder content - will be implemented later */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500 mb-4">
          Списъкът с имоти ще бъде добавен тук
        </p>
        <button
          onClick={() => router.push("/admin/properties/create/")}
          className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
        >
          Добави имот
        </button>
      </div>
    </div>
  );
}

