"use client";

import { Star, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

interface Testimonial {
  id: number;
  client_name: string;
  rating: number | null;
  content_bg: string;
  is_published: boolean;
  created_at: string;
}

interface TestimonialsTableProps {
  testimonials: Testimonial[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
  processingId?: number | null;
}

export default function TestimonialsTable({ 
  testimonials, 
  onApprove,
  onReject,
  onDelete,
  processingId
}: TestimonialsTableProps) {
  // Format date to DD.MM.YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  // Render stars for rating
  const renderStars = (rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingValue ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"
          }`}
        />
      );
    }
    
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Get status badge
  const getStatusBadge = (is_published: boolean) => {
    if (is_published) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Одобрено
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          В очакване
        </span>
      );
    }
  };

  // Truncate review text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  // Empty state
  if (testimonials.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg">Няма добавени отзиви</p>
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
                Име на клиент
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Рейтинг
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Отзив (преглед)
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Статус
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                Дата
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-32">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <tr
                key={testimonial.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {testimonial.client_name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {renderStars(testimonial.rating)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700 max-w-md">
                    {truncateText(testimonial.content_bg)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(testimonial.is_published)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700">
                    {formatDate(testimonial.created_at)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Edit button */}
                    <button
                      onClick={() => window.location.href = `/admin/testimonials/${testimonial.id}/edit`}
                      disabled={processingId === testimonial.id}
                      className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37] hover:bg-opacity-10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Редактирай"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Approve button - only show if pending */}
                    {!testimonial.is_published && onApprove && (
                      <button
                        onClick={() => onApprove(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Одобри"
                      >
                        {processingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Reject button - only show if approved */}
                    {testimonial.is_published && onReject && (
                      <button
                        onClick={() => onReject(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Отхвърли"
                      >
                        {processingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Delete button */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Изтрий"
                      >
                        {processingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

