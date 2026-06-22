"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, ChevronDown, ChevronUp, CheckSquare } from "lucide-react";
import type { CrmTask, CrmTaskType } from "@/types/crm";
import { CRM_TASK_TYPE_LABELS } from "@/types/crm";

const TASK_TYPE_ICONS: Record<CrmTaskType, string> = {
  call: "📞",
  meeting: "🤝",
  follow_up: "🔔",
  other: "📌",
};

const VALID_TASK_TYPES: CrmTaskType[] = ["call", "meeting", "follow_up", "other"];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDueDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function insertByDueDate(task: CrmTask, list: CrmTask[]): CrmTask[] {
  const next = [...list, task];
  next.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return next;
}

interface TasksSectionProps {
  contactId: string;
  initialTasks: CrmTask[];
}

export default function TasksSection({ contactId, initialTasks }: TasksSectionProps) {
  const [openTasks, setOpenTasks] = useState<CrmTask[]>(() =>
    initialTasks.filter((t) => !t.is_done).sort((a, b) => a.due_date.localeCompare(b.due_date))
  );
  const [doneTasks, setDoneTasks] = useState<CrmTask[]>(() =>
    initialTasks.filter((t) => t.is_done).sort((a, b) => {
      if (!a.completed_at || !b.completed_at) return 0;
      return b.completed_at.localeCompare(a.completed_at);
    })
  );
  const [showDone, setShowDone] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<CrmTaskType>("call");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(getTomorrow);

  const today = useMemo(() => getToday(), []);
  const isOverdue = (task: CrmTask) => task.due_date < today;

  const resetForm = () => {
    setTaskType("call");
    setTaskTitle("");
    setTaskDueDate(getTomorrow());
    setFormError(null);
  };

  const handleToggle = async (task: CrmTask) => {
    if (togglingId) return;
    setTogglingId(task.id);

    const newDone = !task.is_done;

    // Optimistic update
    if (newDone) {
      setOpenTasks((prev) => prev.filter((t) => t.id !== task.id));
      setDoneTasks((prev) => [
        { ...task, is_done: true, completed_at: new Date().toISOString() },
        ...prev,
      ]);
    } else {
      setDoneTasks((prev) => prev.filter((t) => t.id !== task.id));
      setOpenTasks((prev) =>
        insertByDueDate({ ...task, is_done: false, completed_at: null }, prev)
      );
    }

    try {
      const res = await fetch(
        `/api/admin/crm/contacts/${contactId}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ is_done: newDone }),
        }
      );

      if (!res.ok) {
        // Rollback on failure
        if (newDone) {
          setDoneTasks((prev) => prev.filter((t) => t.id !== task.id));
          setOpenTasks((prev) => insertByDueDate(task, prev));
        } else {
          setOpenTasks((prev) => prev.filter((t) => t.id !== task.id));
          setDoneTasks((prev) => [task, ...prev]);
        }
      }
    } catch {
      // Rollback on network error
      if (newDone) {
        setDoneTasks((prev) => prev.filter((t) => t.id !== task.id));
        setOpenTasks((prev) => insertByDueDate(task, prev));
      } else {
        setOpenTasks((prev) => prev.filter((t) => t.id !== task.id));
        setDoneTasks((prev) => [task, ...prev]);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setFormError("Заглавието е задължително");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/crm/contacts/${contactId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: taskType,
          title: taskTitle.trim(),
          due_date: taskDueDate,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Грешка при създаване на задачата");
        return;
      }

      setOpenTasks((prev) => insertByDueDate(json as CrmTask, prev));
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
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[#1a2642]" />
          <h3 className="text-sm font-semibold text-gray-900">Задачи</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1a2642] text-white rounded-md hover:bg-[#0f1829] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Нова задача
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-5 p-4 bg-[#1a2642]/5 border border-[#1a2642]/20 rounded-lg space-y-3"
        >
          <h4 className="text-sm font-medium text-[#1a2642]">Нова задача</h4>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as CrmTaskType)}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2642] focus:border-transparent disabled:bg-gray-100"
            >
              {VALID_TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_ICONS[t]} {CRM_TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Заглавие <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={submitting}
              placeholder="Обади се за оферта"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2642] focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Краен срок</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2642] focus:border-transparent disabled:bg-gray-100"
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
              onClick={() => { resetForm(); setShowForm(false); }}
              disabled={submitting}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1a2642] text-white text-sm font-medium rounded-md hover:bg-[#0f1829] disabled:opacity-50 transition-colors"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Създай
            </button>
          </div>
        </form>
      )}

      {/* Open tasks */}
      {openTasks.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Няма активни задачи</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {openTasks.map((task) => {
            const overdue = isOverdue(task);
            const isToggling = togglingId === task.id;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 py-2.5 ${overdue ? "border-l-2 border-red-400 pl-2 -ml-2" : ""}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  disabled={isToggling}
                  aria-label="Маркирай като завършена"
                  className="flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 hover:border-[#1a2642] disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isToggling && <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />}
                </button>

                {/* Type icon */}
                <span className="flex-shrink-0 text-base" aria-hidden>
                  {TASK_TYPE_ICONS[task.type as CrmTaskType]}
                </span>

                {/* Title */}
                <span className="flex-1 text-sm text-gray-800 min-w-0 truncate">
                  {task.title}
                </span>

                {/* Due date */}
                <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                  <span
                    className={`text-xs font-medium ${overdue ? "text-red-500" : "text-gray-400"}`}
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

      {/* Done tasks toggle */}
      {doneTasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showDone ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Завършени задачи ({doneTasks.length})
          </button>

          {showDone && (
            <div className="mt-3 space-y-1">
              {doneTasks.map((task) => {
                const isToggling = togglingId === task.id;

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-md"
                  >
                    {/* Checked indicator */}
                    <div className="flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 bg-gray-300 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Type icon */}
                    <span className="flex-shrink-0 text-base opacity-40" aria-hidden>
                      {TASK_TYPE_ICONS[task.type as CrmTaskType]}
                    </span>

                    {/* Title (strikethrough) */}
                    <span className="flex-1 text-sm text-gray-400 line-through min-w-0 truncate">
                      {task.title}
                    </span>

                    {/* Reopen */}
                    <button
                      onClick={() => handleToggle(task)}
                      disabled={isToggling}
                      className="flex-shrink-0 text-xs text-[#1a2642] hover:underline disabled:opacity-50 transition-opacity"
                    >
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "отвори отново"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
