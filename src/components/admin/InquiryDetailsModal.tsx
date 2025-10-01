"use client";

import { useEffect, useRef } from "react";
import { X, Mail, Phone, Calendar, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    price_bgn: number | null;
    price_eur: number | null;
  } | null;
}

interface InquiryDetailsModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export default function InquiryDetailsModal({
  inquiry,
  isOpen,
  onClose,
  onStatusUpdate,
}: InquiryDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  // Format property price
  const formatPrice = (priceBgn: number | null, priceEur: number | null) => {
    if (priceEur !== null) {
      return new Intl.NumberFormat("bg-BG").format(priceEur) + " €";
    } else if (priceBgn !== null) {
      return new Intl.NumberFormat("bg-BG").format(priceBgn) + " лв";
    }
    return "Цена по договаряне";
  };

  // Handle status updates
  const handleMarkAsRead = () => {
    if (inquiry) {
      onStatusUpdate(inquiry.id.toString(), "in_progress");
    }
  };

  const handleMarkAsResponded = () => {
    if (inquiry) {
      onStatusUpdate(inquiry.id.toString(), "responded");
    }
  };

  if (!isOpen || !inquiry) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            Детайли за запитване
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Затвори"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              Контактна информация
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Име:</label>
                <p className="text-gray-900 font-medium">{inquiry.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Имейл:</label>
                <p className="text-gray-900">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-[#D4AF37] hover:text-[#B8941F] transition-colors"
                  >
                    {inquiry.email}
                  </a>
                </p>
              </div>
              {inquiry.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Телефон:</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-[#D4AF37] hover:text-[#B8941F] transition-colors"
                    >
                      {inquiry.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              Детайли за запитването
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Тип:</label>
                  <p className="text-gray-900">{getInquiryTypeLabel(inquiry.inquiry_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Дата:</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(inquiry.created_at)}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Статус:</label>
                <div className="mt-1">
                  {getStatusBadge(inquiry.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Related Property Section */}
          {inquiry.property && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[#D4AF37]" />
                Свързан имот
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {inquiry.property.title_bg}
                    </h4>
                    <p className="text-lg font-semibold text-[#D4AF37] mb-3">
                      {formatPrice(inquiry.property.price_bgn, inquiry.property.price_eur)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/properties/${inquiry.property.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#B8941F] font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Виж имота
                </Link>
              </div>
            </div>
          )}

          {/* Message Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              Съобщение
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                readOnly
                value={inquiry.message}
                className="w-full h-32 bg-white border border-gray-200 rounded-md p-3 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                placeholder="Няма съобщение..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {inquiry.status === "new" && (
              <Button
                onClick={handleMarkAsRead}
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
              >
                Маркирай като прочетено
              </Button>
            )}
            {inquiry.status === "in_progress" && (
              <Button
                onClick={handleMarkAsResponded}
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
              >
                Маркирай като отговорено
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Затвори
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
