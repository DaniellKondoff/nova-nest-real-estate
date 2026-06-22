"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckSquare, Loader2 } from "lucide-react";
import type { CrmTaskType, CrmTaskWithContact } from "@/types/crm";

const TASK_TYPE_ICONS: Record<CrmTaskType, string> = {
  call: "📞",
  meeting: "🤝",
  follow_up: "🔔",
  other: "📌",
};

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDueDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

export function TodaysTasksWidget() {
  const [tasks, setTasks] = useState<CrmTaskWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const today = getToday();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/crm/tasks/today", { credentials: "include" });
      if (!res.ok) throw new Error("Грешка при зареждане");
      const data: CrmTaskWithContact[] = await res.json();
      setTasks(data);
    } catch {
      setError("Грешка при зареждане на задачите");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (task: CrmTaskWithContact) => {
    if (togglingId) return;
    setTogglingId(task.id);

    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      const res = await fetch(
        `/api/admin/crm/contacts/${task.contact.id}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ is_done: true }),
        }
      );

      if (!res.ok) {
        // Rollback
        setTasks((prev) => [task, ...prev]);
      }
    } catch {
      // Rollback on network error
      setTasks((prev) => [task, ...prev]);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[#1a2642]" />
          <h3 className="text-sm font-semibold text-gray-900">Днешни задачи</h3>
        </div>
        <Link
          href="/admin/crm/"
          className="text-xs text-[#1a2642] hover:underline font-medium"
        >
          Към CRM
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-red-500 text-center py-4">{error}</p>
      )}

      {!loading && !error && tasks.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Няма задачи за днес 🎉
        </p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="divide-y divide-gray-100">
          {tasks.map((task) => {
            const overdue = task.due_date < today;
            const isToggling = togglingId === task.id;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 py-2.5 ${
                  overdue ? "border-l-2 border-red-400 pl-2 -ml-2" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleComplete(task)}
                  disabled={isToggling}
                  aria-label="Маркирай като завършена"
                  className="flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 hover:border-[#1a2642] disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isToggling && (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />
                  )}
                </button>

                {/* Type icon */}
                <span className="flex-shrink-0 text-base" aria-hidden>
                  {TASK_TYPE_ICONS[task.type as CrmTaskType]}
                </span>

                {/* Contact + title */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/crm/${task.contact.id}/`}
                    className="block text-xs font-medium text-[#1a2642] hover:underline truncate"
                  >
                    {task.contact.full_name}
                  </Link>
                  <p className="text-sm text-gray-700 truncate">{task.title}</p>
                </div>

                {/* Due date */}
                <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                  <span
                    className={`text-xs font-medium ${
                      overdue ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {formatDueDate(task.due_date)}
                  </span>
                  {overdue && (
                    <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">
                      Просрочена
                    </span>
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
