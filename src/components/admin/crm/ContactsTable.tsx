"use client";

import { Eye, Trash2, Loader2 } from "lucide-react";
import type { CrmContact, CrmContactStatus, CrmClientType } from "@/types/crm";
import { CRM_STATUS_LABELS, CRM_CLIENT_TYPE_LABELS } from "@/types/crm";

interface ContactsTableProps {
  contacts: CrmContact[];
  onDelete: (contact: CrmContact) => void;
  processingId: string | null;
}

const STATUS_BADGE: Record<CrmContactStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  closed: "bg-[#1a2642] text-white",
};

function formatBudget(contact: CrmContact): string {
  if (contact.budget_min == null && contact.budget_max == null) {
    return "Не е зададен";
  }
  const min = contact.budget_min != null ? contact.budget_min.toLocaleString("bg-BG") : "—";
  const max = contact.budget_max != null ? contact.budget_max.toLocaleString("bg-BG") : "—";
  return `${min} - ${max} ${contact.budget_currency}`;
}

export default function ContactsTable({ contacts, onDelete, processingId }: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg">
          Нямате контакти. Добавете първия си контакт.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Име</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Телефон</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Тип клиент</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Статус</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Бюджет</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm w-24">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contacts.map((contact) => {
              const isProcessing = processingId === contact.id;
              return (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{contact.full_name}</div>
                    {contact.email && (
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{contact.phone}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.client_types.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        contact.client_types.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {CRM_CLIENT_TYPE_LABELS[t as CrmClientType] ?? t}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[contact.status]}`}
                    >
                      {CRM_STATUS_LABELS[contact.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 whitespace-nowrap">
                      {formatBudget(contact)}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { window.location.href = `/admin/crm/${contact.id}/`; }}
                        disabled={isProcessing}
                        className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Преглед"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(contact)}
                        disabled={isProcessing}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Изтрий"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
