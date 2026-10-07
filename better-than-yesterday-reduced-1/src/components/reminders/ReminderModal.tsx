import React, { useState } from "react";
import { Bell, Calendar, Clock, FileText, Sparkles, X } from "lucide-react";
import { computeScheduledAt, type TaskReminder } from "@/lib/notifications";
import { type Habit } from "@/lib/habits";
import { Button } from "@/components/ui/button";

interface ReminderModalProps {
  initial?: TaskReminder | null;
  habits?: Habit[];
  onClose: () => void;
  onSave: (reminder: TaskReminder) => void;
}

export function ReminderModal({ initial, habits = [], onClose, onSave }: ReminderModalProps) {
  const now = new Date();
  const defaultDate = initial?.scheduled_date || now.toISOString().split("T")[0];
  const defaultTime = initial?.scheduled_time || `${String(now.getHours() + 1).padStart(2, "0")}:00`;

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [scheduledTime, setScheduledTime] = useState(defaultTime);
  const [habitId, setHabitId] = useState(initial?.habit_id || "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Please provide a title for the reminder.");
      return;
    }
    if (!scheduledDate) {
      setError("Please pick a scheduled date.");
      return;
    }
    if (!scheduledTime) {
      setError("Please pick a scheduled time.");
      return;
    }

    const scheduledAt = computeScheduledAt(scheduledDate, scheduledTime);
    const scheduledMillis = new Date(scheduledAt).getTime();

    // Check if scheduled in the past by > 1 minute
    if (scheduledMillis < Date.now() - 60000 && !initial) {
      setError("The scheduled time has already passed. Please choose a future time.");
      return;
    }

    const reminder: TaskReminder = {
      id: initial?.id || `rem-${Date.now()}`,
      title: cleanTitle,
      description: description.trim() || null,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      scheduled_at: scheduledAt,
      status: initial?.status || "pending",
      habit_id: habitId || null,
      notified_at: initial?.notified_at || null,
      created_at: initial?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(reminder);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reminder-title">
      <div className="system-modal max-w-lg">
        <header className="modal-header">
          <div>
            <p className="system-label">SYSTEM // REMINDER DISPATCH</p>
            <h2 id="reminder-title" className="text-xl font-extrabold tracking-wide">
              {initial ? "Edit Reminder" : "New Task Reminder"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Task / Reminder Title *
            </label>
            <input
              type="text"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 100 Pushups Training, Daily Reflection"
              maxLength={120}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-cyan-400" />
                Scheduled Date *
              </label>
              <input
                type="date"
                className="field"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-cyan-400" />
                Scheduled Time *
              </label>
              <input
                type="time"
                className="field"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-cyan-400" />
              Description & Notes (Optional)
            </label>
            <textarea
              className="field min-h-20 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key targets, instructions or motivation..."
              maxLength={400}
            />
          </div>

          {habits.length > 0 && (
            <div>
              <label className="field-label mb-1.5 flex items-center gap-1.5">
                <Bell className="h-3 w-3 text-cyan-400" />
                Link to Habit Quest (Optional)
              </label>
              <select
                className="field bg-slate-900 cursor-pointer"
                value={habitId}
                onChange={(e) => setHabitId(e.target.value)}
              >
                <option value="">-- No linked habit --</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.emoji} {h.name} ({h.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-neon cursor-pointer">
              {initial ? "Save Changes" : "Create Reminder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
