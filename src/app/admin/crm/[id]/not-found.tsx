import Link from "next/link";

export default function CrmContactNotFound() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-md w-full">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Контактът не е намерен
        </h2>
        <p className="text-gray-500 mb-6">
          Контактът, който търсите, не съществува или е бил изтрит.
        </p>
        <Link
          href="/admin/crm/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2642] text-white font-medium rounded-md hover:bg-[#243152] transition-colors"
        >
          ← Обратно към CRM
        </Link>
      </div>
    </div>
  );
}
