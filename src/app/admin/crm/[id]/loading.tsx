export default function CrmContactDetailLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <span className="text-gray-300">/</span>
        <div className="h-4 bg-gray-200 rounded w-12" />
        <span className="text-gray-300">/</span>
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info card skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Name + status */}
            <div className="flex items-start justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-40" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>

            {/* Client type pills */}
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
            </div>

            {/* Budget */}
            <div className="mt-4 h-4 bg-gray-200 rounded w-48" />

            {/* Notes */}
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>

            {/* Neighborhoods */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Properties + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Properties card skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-14 h-14 bg-gray-200 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
