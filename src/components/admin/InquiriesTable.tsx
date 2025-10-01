"use client";

import { Eye } from "lucide-react";

interface Inquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  inquiry_type: "general" | "property_interest" | "viewing_request" | "valuation" | "selling" | "renting";
  message: string;
  status: "new" | "in_progress" | "responded" | "closed";
  created_at: string;
  property: {
    id: number;
    title_bg: string;
    price: number;
    price_currency: string;
  } | null;
}

interface InquiriesTableProps {
  inquiries: Inquiry[];
  onViewDetails?: (inquiry: Inquiry) => void;
}

export default function InquiriesTable({ inquiries, onViewDetails }: InquiriesTableProps) {
  // Format date to DD.MM.YYYY HH:mm
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Map inquiry types to Bulgarian
  const getInquiryTypeLabel = (type: string) => {
    const typeMap = {
      general: "Общо",
      property_interest: "Интерес към имот",
      viewing_request: "Заявка за оглед",
      valuation: "Оценка",
      selling: "Продажба",
      renting: "Наемане",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: {
        label: "Ново",
        className: "bg-blue-100 text-blue-800",
      },
      in_progress: {
        label: "Прочетено",
        className: "bg-gray-100 text-gray-800",
      },
      responded: {
        label: "Отговорено",
        className: "bg-green-100 text-green-800",
      },
      closed: {
        label: "Затворено",
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Handle view details
  const handleViewDetails = (inquiry: Inquiry) => {
    if (onViewDetails) {
      onViewDetails(inquiry);
    }
  };

  // Empty state
  if (inquiries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg">Няма получени запитвания</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Име
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Тип
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Имот
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Дата
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Статус
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(inquiry)}
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {inquiry.full_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {inquiry.email}
                  </div>
                  {inquiry.phone && (
                    <div className="text-xs text-gray-500">
                      {inquiry.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700">
                    {getInquiryTypeLabel(inquiry.inquiry_type)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700">
                    {inquiry.property?.title_bg || "Общо запитване"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700">
                    {formatDate(inquiry.created_at)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(inquiry.status)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(inquiry);
                    }}
                    className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37] hover:bg-opacity-10 rounded transition-colors"
                    title="Преглед на детайли"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
