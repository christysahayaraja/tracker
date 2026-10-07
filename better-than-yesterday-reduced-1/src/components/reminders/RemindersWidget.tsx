import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  Clock,
  Edit2,
  FastForward,
  MoreVertical,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import {
  formatTimeDisplay,
  postponeDate,
  type TaskReminder,
} from "@/lib/notifications";
import { type Habit } from "@/lib/habits";
import { Button } from "@/components/ui/button";

interface RemindersWidgetProps {
  reminders: TaskReminder[];
  habits?: Habit[];
  onAddReminder: () => void;
  onEditReminder: (reminder: TaskReminder) => void;
  onDeleteReminder: (id: string) => void;
  onCompleteReminder: (reminder: TaskReminder) => void;
  onPostponeReminder: (reminder: TaskReminder, mode: 5 | 15 | 60 | "tomorrow") => void;
  onOpenSettings: () => void;
  onTestNotification: () => void;
}

export function RemindersWidget({
  reminders,
  habits = [],
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder,
  onPostponeReminder,
  onOpenSettings,
  onTestNotification,
}: RemindersWidgetProps) {
  const [postponeMenuOpen, setPostponeMenuOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");

  const now = Date.now();

  const filteredReminders = reminders.filter((r) => {
    if (filter === "pending") return r.status === "pending" || r.status === "postponed";
    if (filter === "completed") return r.status === "completed";
    return true;
  });

  return (
    <section className="system-panel p-5 sm:p-6 mb-6">
      <div className="section-heading">
        <div>
          <p className="system-label">SCHEDULED // PUSH DISPATCH</p>
          <div className="flex items-center gap-3">
            <h2>Reminders & Alerts</h2>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/30">
              {reminders.filter((r) => r.status === "pending").length} active
            </span>
          </div>
          <span>Never miss scheduled habits, training, or reflection</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTestNotification}
            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60 hover:text-white"
            title="Send Immediate Test Push Notification"
          >
            <Bell className="h-4 w-4 sm:mr-1.5 text-cyan-400" />
            <span className="hidden sm:inline">Test Alert</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white"
            title="Notification Settings"
          >
            <Settings className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            size="sm"
            onClick={onAddReminder}
            className="btn-neon text-xs h-9 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5">
          {(["pending", "completed", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filter === tab
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="empty-quests py-8">
          <Bell className="mx-auto h-8 w-8 text-cyan-400/50 mb-2" />
          <h3 className="text-base font-bold">No {filter} reminders</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Schedule a push alert for habit quests, training routines, or daily reflection.
          </p>
          <Button
            size="sm"
            onClick={onAddReminder}
            className="mt-4 btn-neon text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Reminder
          </Button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filteredReminders.map((reminder) => {
            const isPastDue =
              reminder.status === "pending" && new Date(reminder.scheduled_at).getTime() < now;
            const linkedHabit = habits.find((h) => h.id === reminder.habit_id);
            const isCompleted = reminder.status === "completed";

            return (
              <article
                key={reminder.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-slate-900/40 border-slate-800 opacity-60"
                    : isPastDue
                    ? "bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                    : "bg-[#141728]/80 border-slate-800 hover:border-cyan-500/40 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onCompleteReminder(reminder)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold"
                        : "border-slate-700 hover:border-cyan-400 hover:bg-cyan-500/10 text-transparent"
                    }`}
                    title={isCompleted ? "Completed" : "Mark as completed"}
                  >
                    <Check className={`h-3.5 w-3.5 ${isCompleted ? "block" : ""}`} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-100"
                        }`}
                      >
                        {reminder.title}
                      </h4>

                      {linkedHabit && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-slate-700">
                          {linkedHabit.emoji} {linkedHabit.name}
                        </span>
                      )}

                      {isPastDue && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                          <AlertCircle className="h-3 w-3" /> Past Due
                        </span>
                      )}
                    </div>

                    {reminder.description && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                        {reminder.description}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatTimeDisplay(reminder.scheduled_date, reminder.scheduled_time)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {!isCompleted && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setPostponeMenuOpen(
                            postponeMenuOpen === reminder.id ? null : reminder.id
                          )
                        }
                        className="text-xs h-8 px-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800"
                        title="Postpone Reminder"
                      >
                        <FastForward className="h-3.5 w-3.5 mr-1" />
                        <span>Postpone</span>
                      </Button>

                      {postponeMenuOpen === reminder.id && (
                        <div
                          className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-1 sm:mb-0 sm:mt-1 z-30 w-36 rounded-xl border border-slate-700 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-md"
                          onMouseLeave={() => setPostponeMenuOpen(null)}
                        >
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Postpone by
                          </div>
                          {[
                            { label: "+5 minutes", mode: 5 as const },
                            { label: "+15 minutes", mode: 15 as const },
                            { label: "+1 hour", mode: 60 as const },
                            { label: "Tomorrow", mode: "tomorrow" as const },
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                onPostponeReminder(reminder, opt.mode);
                                setPostponeMenuOpen(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-cyan-950/60 hover:text-cyan-300 rounded-md transition-colors"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditReminder(reminder)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
