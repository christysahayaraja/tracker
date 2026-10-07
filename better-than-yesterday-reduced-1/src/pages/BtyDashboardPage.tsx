import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Flame, LogOut, Plus, Star, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { daysInMonth, toDateKey, useHabitMutations, useHabits, useLogs, useProfile, type Habit } from "@/lib/habits";
import { calculateAchievements, calculateLevel, calculateStreak, calculateTodayProgress, calculateTotalScore } from "@/lib/progression";
import { startLocalReminderScheduler } from "@/lib/reminders";
import {
  deleteReminder,
  fetchReminders,
  getNotificationSettings,
  postponeDate,
  registerServiceWorker,
  sendPushNotification,
  upsertReminder,
  type TaskReminder,
} from "@/lib/notifications";
import { HabitEditor } from "@/components/dashboard/HabitEditor";
import { HabitList } from "@/components/dashboard/HabitList";
import { MonthGrid } from "@/components/dashboard/MonthGrid";
import { Analytics } from "@/components/dashboard/Analytics";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { Achievements } from "@/components/dashboard/Achievements";
import { DeleteHabitDialog } from "@/components/dashboard/DeleteHabitDialog";
import { NotificationPermissionPrompt } from "@/components/reminders/NotificationPermissionPrompt";
import { ReminderModal } from "@/components/reminders/ReminderModal";
import { RemindersWidget } from "@/components/reminders/RemindersWidget";
import { NotificationSettingsDialog } from "@/components/reminders/NotificationSettingsDialog";
import { PushAlertBanner } from "@/components/reminders/PushAlertBanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BtyDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Habit | "new" | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [questComplete, setQuestComplete] = useState(false);
  const finishLoading = useCallback(() => setLoading(false), []);

  // Reminders & Push Notifications state
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [editingReminder, setEditingReminder] = useState<TaskReminder | "new" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePushAlert, setActivePushAlert] = useState<{ title: string; body: string } | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const monthStart = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const monthEnd = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), daysInMonth(today.getFullYear(), today.getMonth())),
    [today]
  );

  const { data: profile } = useProfile();
  const { data: habits = [], isLoading } = useHabits();
  const { data: logs = [] } = useLogs();
  const { saveHabit, deleteHabit, setLog } = useHabitMutations();

  const currentHabits = useMemo(() => habits.filter((habit) => !habit.deleted_at), [habits]);
  const activeHabits = useMemo(() => currentHabits.filter((habit) => !habit.archived), [currentHabits]);
  const monthLogs = useMemo(
    () => logs.filter((log) => log.log_date >= toDateKey(monthStart) && log.log_date <= toDateKey(monthEnd)),
    [logs, monthStart, monthEnd]
  );
  const todayLogs = useMemo(() => logs.filter((log) => log.log_date === todayKey), [logs, todayKey]);
  const totalScore = useMemo(() => calculateTotalScore(logs), [logs]);
  const level = useMemo(() => calculateLevel(totalScore), [totalScore]);
  const streak = useMemo(() => calculateStreak(habits, logs, todayKey), [habits, logs, todayKey]);
  const todayProgress = useMemo(
    () => calculateTodayProgress(activeHabits, logs, todayKey),
    [activeHabits, logs, todayKey]
  );
  const achievements = useMemo(() => calculateAchievements(totalScore, streak, logs), [totalScore, streak, logs]);

  // Load reminders & initialize Service Worker
  useEffect(() => {
    registerServiceWorker();
    fetchReminders().then(setReminders);
  }, []);

  // Background reminder scheduler
  useEffect(() => {
    const interval = window.setInterval(() => {
      const nowIso = new Date().toISOString();
      const settings = getNotificationSettings();
      if (!settings.enabled) return;

      setReminders((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          if (
            (r.status === "pending" || r.status === "postponed") &&
            !r.notified_at &&
            r.scheduled_at <= nowIso
          ) {
            changed = true;
            sendPushNotification(r.title, {
              body: r.description || "It's time for your scheduled reminder!",
              tag: r.id,
              url: "/dashboard",
            });
            const updated: TaskReminder = {
              ...r,
              notified_at: nowIso,
            };
            upsertReminder(updated);
            return updated;
          }
          return r;
        });
        return changed ? next : prev;
      });
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return startLocalReminderScheduler(activeHabits);
  }, [activeHabits]);

  useEffect(() => {
    if (todayProgress.allComplete && activeHabits.length > 0) {
      setQuestComplete(true);
      const timer = window.setTimeout(() => setQuestComplete(false), 3600);
      return () => window.clearTimeout(timer);
    }
  }, [todayProgress.allComplete, activeHabits.length]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    localStorage.removeItem("ut_last_user");
    navigate("/");
  }

  // Reminder Actions
  async function handleTestAlert() {
    const title = "Daily Quest Alert · Better Than Yesterday";
    const body = "Level Up! Your reminder alert is working properly. Complete today's quests and arise!";
    setActivePushAlert({ title, body });
    await sendPushNotification(title, {
      body,
      url: "/dashboard",
    });
    toast.success("Push notification sent! Check your screen and notification tray.");
  }

  async function handleSaveReminder(reminder: TaskReminder) {
    await upsertReminder(reminder);
    setReminders((prev) => {
      const idx = prev.findIndex((r) => r.id === reminder.id);
      if (idx >= 0) return prev.map((r) => (r.id === reminder.id ? reminder : r));
      return [...prev, reminder];
    });
    setEditingReminder(null);
  }

  async function handleDeleteReminder(id: string) {
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleCompleteReminder(reminder: TaskReminder) {
    const nextStatus = reminder.status === "completed" ? "pending" : "completed";
    const updated: TaskReminder = {
      ...reminder,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    await upsertReminder(updated);
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? updated : r)));
  }

  async function handlePostponeReminder(reminder: TaskReminder, mode: 5 | 15 | 60 | "tomorrow") {
    const next = postponeDate(reminder.scheduled_date, reminder.scheduled_time, mode);
    const updated: TaskReminder = {
      ...reminder,
      scheduled_date: next.date,
      scheduled_time: next.time,
      scheduled_at: next.iso,
      status: "postponed",
      notified_at: null, // allow notification to trigger again at new time
      updated_at: new Date().toISOString(),
    };
    await upsertReminder(updated);
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? updated : r)));
  }

  if (loading) return <LoadingScreen onComplete={finishLoading} />;

  return (
    <div className="dashboard-shell">
      {activePushAlert && (
        <PushAlertBanner
          title={activePushAlert.title}
          body={activePushAlert.body}
          onClose={() => setActivePushAlert(null)}
        />
      )}

      {questComplete && (
        <div className="quest-toast" role="status">
          <p>QUEST COMPLETE</p>
          <strong>TOTAL SCORE INCREASED</strong>
          <span>STREAK MAINTAINED · ARISE.</span>
        </div>
      )}

      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark overflow-hidden">
            <img
              src="/better-than-yesterday-logo.jpg"
              alt="BTY"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p>BETTER THAN YESTERDAY</p>
            <span>PERSONAL PROGRESSION SYSTEM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="text-slate-300 hover:text-cyan-400"
            title="Notification & Reminder Settings"
          >
            <Bell className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Alerts</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-300 hover:text-white">
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Friendly notification permission prompt */}
        <NotificationPermissionPrompt />

        <WelcomeCard
          name={profile?.full_name?.split(" ")[0] ?? "Hunter"}
          score={todayProgress.percentage}
          totalScore={totalScore}
          level={level.level}
        />

        <section className="stats-grid">
          <Stat icon={Star} label="Current level" value={`LEVEL ${String(level.level).padStart(2, "0")}`} tone="cyan" />
          <Stat icon={Trophy} label="Total score" value={totalScore.toLocaleString()} tone="purple" />
          <Stat icon={Flame} label="Current streak" value={`${streak.current} DAYS`} tone="orange" />
          <Stat icon={Target} label="Today's progress" value={`${todayProgress.completed} / ${todayProgress.total}`} tone="emerald" />
        </section>

        {/* Reminders & Push Notification Widget */}
        <RemindersWidget
          reminders={reminders}
          habits={activeHabits}
          onAddReminder={() => setEditingReminder("new")}
          onEditReminder={(r) => setEditingReminder(r)}
          onDeleteReminder={handleDeleteReminder}
          onCompleteReminder={handleCompleteReminder}
          onPostponeReminder={handlePostponeReminder}
          onOpenSettings={() => setSettingsOpen(true)}
          onTestNotification={handleTestAlert}
        />

        {/* Today's Quests & Habit List */}
        <section className="system-panel p-5 sm:p-6">
          <div className="section-heading">
            <div>
              <p className="system-label">DAILY QUEST</p>
              <h2>Today's quests</h2>
              <span>{todayProgress.completed} of {todayProgress.total} missions complete</span>
            </div>
            <Button className="btn-neon cursor-pointer" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4 mr-1" />
              Create habit
            </Button>
          </div>

          <HabitList
            habits={activeHabits}
            logs={todayLogs}
            loading={isLoading}
            onToggle={(habitId, status) => setLog.mutate({ habitId, date: todayKey, status })}
            onNote={(habitId, note, status) => setLog.mutate({ habitId, date: todayKey, status: status ?? "partial", note })}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        </section>

        <MonthGrid
          habits={activeHabits}
          logs={monthLogs}
          year={today.getFullYear()}
          month={today.getMonth()}
          onToggle={(habitId, date, status) => setLog.mutate({ habitId, date, status })}
        />

        <Achievements achievements={achievements} />

        <Analytics habits={activeHabits} logs={logs} monthLogs={monthLogs} />

        {currentHabits.some((habit) => habit.archived) && (
          <section className="system-panel p-5">
            <p className="system-label mb-3">ARCHIVED QUESTS</p>
            <div className="flex flex-wrap gap-2">
              {currentHabits
                .filter((habit) => habit.archived)
                .map((habit) => (
                  <Button
                    key={habit.id}
                    variant="outline"
                    className="border-slate-700 hover:border-cyan-500"
                    onClick={() => saveHabit.mutate({ ...habit, archived: false })}
                  >
                    {habit.emoji} {habit.name} · restore
                  </Button>
                ))}
            </div>
          </section>
        )}
      </main>

      {/* Habit Editor Modal */}
      {editing && (
        <HabitEditor
          habit={editing === "new" ? null : editing}
          nextOrder={activeHabits.length}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            saveHabit.mutate(values);
            setEditing(null);
          }}
          onDelete={(habit) => {
            setEditing(null);
            setDeleting(habit);
          }}
        />
      )}

      {/* Habit Delete Dialog */}
      <DeleteHabitDialog
        habit={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={(habit) => {
          deleteHabit.mutate(habit.id);
          setDeleting(null);
        }}
      />

      {/* Reminder Create/Edit Modal */}
      {editingReminder && (
        <ReminderModal
          initial={editingReminder === "new" ? null : editingReminder}
          habits={activeHabits}
          onClose={() => setEditingReminder(null)}
          onSave={handleSaveReminder}
        />
      )}

      {/* Notification Settings Dialog */}
      {settingsOpen && (
        <NotificationSettingsDialog
          onClose={() => setSettingsOpen(false)}
          onSettingsChanged={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className="stat-tile">
      <div className="stat-icon" data-tone={tone}>
        <Icon />
      </div>
      <div className="min-w-0">
        <p>{label}</p>
        <strong className="truncate">{value}</strong>
      </div>
    </article>
  );
}
