import React from "react";

export default function Loading() {
  return (
    <main className="bg-white animate-pulse">
      {/* Back link skeleton */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </section>

      {/* Breadcrumbs skeleton */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto mb-8 flex items-center gap-2 text-sm">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </section>

      {/* Main layout skeleton */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="w-full aspect-video bg-gray-200 rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-10 w-1/2 bg-gray-200 rounded" />
            <div className="h-28 w-full bg-gray-200 rounded" />
          </div>
        </div>
      </section>

      {/* Details skeleton */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
      </section>

      {/* Features skeleton */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhood skeleton */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      </section>
    </main>
  );
}


