export type ReminderPermissionResult = "enabled" | "denied" | "unsupported" | "open-in-new-tab";

export async function requestReminderPermission(): Promise<ReminderPermissionResult> {
  if (!("Notification" in window)) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  if (Notification.permission === "granted") return "enabled";
  if (Notification.permission === "denied") return "denied";
  return (await Notification.requestPermission()) === "granted" ? "enabled" : "denied";
}

export function reminderPermissionMessage(result: ReminderPermissionResult) {
  if (result === "open-in-new-tab") return "Open the app in its own tab to enable notifications.";
  if (result === "denied") return "Notifications are blocked. Allow them in your browser site settings.";
  if (result === "unsupported") return "This browser does not support local notifications.";
  return "Reminder enabled. Keep the installed app available for local alerts.";
}

export function startLocalReminderScheduler(
  habits: Array<{ id: string; name: string; reminder_enabled: boolean; reminder_time: string | null }>,
) {
  if (!("Notification" in window) || Notification.permission !== "granted") return () => undefined;
  const check = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    habits.filter((habit) => habit.reminder_enabled && habit.reminder_time === time).forEach((habit) => {
      const key = `bty-reminder-${habit.id}-${date}-${time}`;
      if (localStorage.getItem(key)) return;
      new Notification("Daily quest awaits", { body: habit.name, icon: "/favicon.png", tag: habit.id });
      localStorage.setItem(key, "sent");
    });
  };
  check();
  const timer = window.setInterval(check, 30_000);
  return () => window.clearInterval(timer);
}
