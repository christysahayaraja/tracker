import { useState } from "react";
import { Bell, ShieldAlert, Sparkles, X } from "lucide-react";
import {
  getNotificationPermission,
  getNotificationSettings,
  isNotificationSupported,
  requestNotificationPermission,
  saveNotificationSettings,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";

export function NotificationPermissionPrompt({
  onStatusChange,
}: {
  onStatusChange?: (status: NotificationPermission | "unsupported") => void;
}) {
  const [dismissed, setDismissed] = useState(() => {
    const settings = getNotificationSettings();
    const perm = getNotificationPermission();
    return settings.dismissedPrompt || perm === "granted" || !isNotificationSupported();
  });
  const [requesting, setRequesting] = useState(false);

  if (dismissed) return null;

  const currentPermission = getNotificationPermission();
  if (currentPermission === "granted" || currentPermission === "unsupported") return null;

  async function handleEnable() {
    setRequesting(true);
    try {
      const res = await requestNotificationPermission();
      onStatusChange?.(res);
      setDismissed(true);
    } finally {
      setRequesting(false);
    }
  }

  function handleDismiss() {
    saveNotificationSettings({ dismissedPrompt: true });
    setDismissed(true);
  }

  return (
    <aside
      aria-label="Notification Reminder Prompt"
      className="relative mb-6 overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#121626]/95 via-[#1a2238]/90 to-[#121626]/95 p-4 sm:p-5 shadow-xl shadow-cyan-950/40 backdrop-blur-md"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Dismiss notification prompt"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-wide uppercase text-slate-100">
                Never Miss a Daily Quest
              </h4>
              <span className="inline-flex items-center gap-1 rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                <Sparkles className="h-2.5 w-2.5" /> Recommended
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
              Enable push notifications to receive timely alerts for your scheduled tasks and habit routines. We only notify you about reminders you specifically schedule.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={requesting}
            className="btn-neon text-xs h-9 px-4 font-bold cursor-pointer"
          >
            {requesting ? "Enabling..." : "Enable Reminders"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
