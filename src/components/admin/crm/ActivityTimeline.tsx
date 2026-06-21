"use client";

import { useState } from "react";
import { Plus, Loader2, FileText, Phone, Users } from "lucide-react";
import type { CrmActivity, CrmActivityType } from "@/types/crm";
import { CRM_ACTIVITY_TYPE_LABELS } from "@/types/crm";

const ACTIVITY_ICONS: Record<CrmActivityType, React.ReactNode> = {
  note: <FileText className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
};

const ACTIVITY_ICON_BG: Record<CrmActivityType, string> = {
  note: "bg-blue-100 text-blue-600",
  call: "bg-green-100 text-green-600",
  meeting: "bg-purple-100 text-purple-600",
};

const OUTCOME_LABEL: Record<CrmActivityType, string | null> = {
  note: null,
  call: "Резултат от обаждането",
  meeting: "Резултат от срещата",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface ActivityTimelineProps {
  contactId: string;
  initialActivities: CrmActivity[];
}

export default function ActivityTimeline({ contactId, initialActivities }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<CrmActivity[]>(initialActivities);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [activityType, setActivityType] = useState<CrmActivityType>("note");
  const [content, setContent] = useState("");
  const [outcome, setOutcome] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => toLocalDatetimeValue(new Date()));

  const resetForm = () => {
    setActivityType("note");
    setContent("");
    setOutcome("");
    setOccurredAt(toLocalDatetimeValue(new Date()));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError("Съдържанието е задължително");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: activityType,
          content: content.trim(),
          outcome: outcome.trim() || null,
          occurred_at: new Date(occurredAt).toISOString(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Грешка при добавяне на активност");
        return;
      }

      setActivities((prev) => [json.activity as CrmActivity, ...prev]);
      resetForm();
      setShowForm(false);
    } catch {
      setFormError("Грешка при свързване със сървъра");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">История на активности</h3>
        {!showForm && (
          <button
            onClick={() => {
              setOccurredAt(toLocalDatetimeValue(new Date()));
              setShowForm(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#D4AF37] text-white rounded-md hover:bg-[#B8941F] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Добави активност
          </button>
        )}
      </div>

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3"
        >
          <h4 className="text-sm font-medium text-gray-800">Нова активност</h4>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
            <select
              value={activityType}
              onChange={(e) => {
                setActivityType(e.target.value as CrmActivityType);
                setOutcome("");
              }}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100"
            >
              {(["note", "call", "meeting"] as CrmActivityType[]).map((t) => (
                <option key={t} value={t}>
                  {CRM_ACTIVITY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Съдържание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={3}
              placeholder={
                activityType === "note"
                  ? "Опишете бележката..."
                  : activityType === "call"
                  ? "За какво беше обаждането?"
                  : "За какво беше срещата?"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Outcome (only for call/meeting) */}
          {OUTCOME_LABEL[activityType] && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{OUTCOME_LABEL[activityType]}</label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                disabled={submitting}
                placeholder="Незадължително"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Дата и час</label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-xs text-red-800">{formError}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={submitting}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#D4AF37] text-white text-sm font-medium rounded-md hover:bg-[#B8941F] disabled:opacity-50 transition-colors"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Запази
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Няма добавени активности</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const type = activity.type as CrmActivityType;
            const iconBg = ACTIVITY_ICON_BG[type] ?? "bg-gray-100 text-gray-600";
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Icon + connector line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {ACTIVITY_ICONS[type]}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {CRM_ACTIVITY_TYPE_LABELS[type]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(activity.occurred_at)}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{activity.content}</p>
                  {activity.outcome && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {getOutcomeLabel(type)}: {activity.outcome}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getOutcomeLabel(type: CrmActivityType): string {
  return OUTCOME_LABEL[type] ?? "Резултат";
}
