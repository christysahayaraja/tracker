import { supabase } from "@/integrations/supabase/client";

export interface TaskReminder {
  id: string;
  owner_id?: string;
  title: string;
  description?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  scheduled_at: string; // ISO string
  status: "pending" | "completed" | "postponed" | "dismissed";
  habit_id?: string | null;
  notified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  dismissedPrompt: boolean;
}

const SETTINGS_KEY = "bty_notification_settings";
const LOCAL_REMINDERS_KEY = "bty_task_reminders";

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { enabled: true, sound: true, dismissedPrompt: false };
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>) {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      saveNotificationSettings({ enabled: true });
      registerServiceWorker();
    }
    return perm;
  } catch {
    return "denied";
  }
}

export async function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return reg;
    } catch {
      // SW fallback
    }
  }
  return null;
}

export async function sendPushNotification(
  title: string,
  options: { body: string; icon?: string; tag?: string; url?: string }
): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.enabled) return false;
  if (!isNotificationSupported() || Notification.permission !== "granted") return false;

  const iconUrl = options.icon || "/better-than-yesterday-logo.jpg";

  // Play subtle sound if enabled
  if (settings.sound) {
    playNotificationSound();
  }

  // Try service worker first
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, {
          body: options.body,
          icon: iconUrl,
          badge: "/favicon.png",
          tag: options.tag || `bty-${Date.now()}`,
          data: { url: options.url || "/dashboard" },
        });
        return true;
      }
    } catch {
      // fallback to standard Notification
    }
  }

  try {
    const notif = new Notification(title, {
      body: options.body,
      icon: iconUrl,
      tag: options.tag || `bty-${Date.now()}`,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch {
    return false;
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked
  }
}

export function computeScheduledAt(dateStr: string, timeStr: string): string {
  // Format YYYY-MM-DD and HH:mm into ISO string
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return d.toISOString();
}

export function formatTimeDisplay(dateStr: string, timeStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const d = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timeFormatted = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    if (isToday) return `Today at ${timeFormatted}`;
    if (isTomorrow) return `Tomorrow at ${timeFormatted}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeFormatted}`;
  } catch {
    return `${dateStr} ${timeStr}`;
  }
}

export function postponeDate(
  currentDateStr: string,
  currentTimeStr: string,
  mode: 5 | 15 | 60 | "tomorrow"
): { date: string; time: string; iso: string } {
  const [year, month, day] = currentDateStr.split("-").map(Number);
  const [hours, minutes] = currentTimeStr.split(":").map(Number);
  const target = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();

  // If the target is in the past, calculate relative to now
  const base = target.getTime() < now.getTime() ? now : target;
  const next = new Date(base.getTime());

  if (mode === 5) {
    next.setMinutes(next.getMinutes() + 5);
  } else if (mode === 15) {
    next.setMinutes(next.getMinutes() + 15);
  } else if (mode === 60) {
    next.setHours(next.getHours() + 1);
  } else if (mode === "tomorrow") {
    next.setDate(next.getDate() + 1);
  }

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  const h = String(next.getHours()).padStart(2, "0");
  const min = String(next.getMinutes()).padStart(2, "0");
  const timeStr = `${h}:${min}`;

  return { date: dateStr, time: timeStr, iso: next.toISOString() };
}

// Storage helpers
export function loadLocalReminders(): TaskReminder[] {
  try {
    const raw = localStorage.getItem(LOCAL_REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalReminders(reminders: TaskReminder[]) {
  try {
    localStorage.setItem(LOCAL_REMINDERS_KEY, JSON.stringify(reminders));
  } catch {
    // ignore
  }
}

// Fetch reminders from Supabase + localStorage
export async function fetchReminders(): Promise<TaskReminder[]> {
  const local = loadLocalReminders();
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return local;

    const { data, error } = await supabase
      .from("task_reminders")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (error || !data) return local;

    // Merge and sync
    saveLocalReminders(data as TaskReminder[]);
    return data as TaskReminder[];
  } catch {
    return local;
  }
}

export async function upsertReminder(reminder: TaskReminder): Promise<TaskReminder> {
  const local = loadLocalReminders();
  const index = local.findIndex((r) => r.id === reminder.id);
  const updatedLocal = index >= 0 ? local.map((r) => (r.id === reminder.id ? reminder : r)) : [...local, reminder];
  saveLocalReminders(updatedLocal);

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      await supabase.from("task_reminders").upsert({
        id: reminder.id,
        owner_id: auth.user.id,
        title: reminder.title,
        description: reminder.description || null,
        scheduled_date: reminder.scheduled_date,
        scheduled_time: reminder.scheduled_time,
        scheduled_at: reminder.scheduled_at,
        status: reminder.status,
        habit_id: reminder.habit_id || null,
        notified_at: reminder.notified_at || null,
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // local fallback already persisted
  }

  return reminder;
}

export async function deleteReminder(id: string): Promise<void> {
  const local = loadLocalReminders();
  saveLocalReminders(local.filter((r) => r.id !== id));

  try {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      await supabase.from("task_reminders").delete().eq("id", id);
    }
  } catch {
    // ignore
  }
}
