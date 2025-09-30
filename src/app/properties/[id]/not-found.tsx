import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-white py-16 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Home className="h-8 w-8 text-gray-400" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold text-[#1a2642]">Имотът не е намерен</h1>
        <p className="mt-2 text-gray-600">Този имот не съществува или е бил премахнат</p>
        <div className="mt-6">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-md bg-[#d4af37] px-5 py-2.5 text-white hover:bg-[#c09d2f]"
          >
            Разгледайте всички имоти
          </Link>
        </div>
      </div>
    </main>
  );
}


