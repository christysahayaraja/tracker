import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Phone,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  getNotificationPermission,
  getNotificationSettings,
  isNotificationSupported,
  requestNotificationPermission,
  saveNotificationSettings,
  sendPushNotification,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";

interface NotificationSettingsDialogProps {
  onClose: () => void;
  onSettingsChanged?: () => void;
}

export function NotificationSettingsDialog({ onClose, onSettingsChanged }: NotificationSettingsDialogProps) {
  const [settings, setSettings] = useState(() => getNotificationSettings());
  const [permission, setPermission] = useState(() => getNotificationPermission());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const supported = isNotificationSupported();

  async function handleRequestPermission() {
    const res = await requestNotificationPermission();
    setPermission(res);
    setSettings(getNotificationSettings());
    onSettingsChanged?.();
  }

  function toggleMasterEnabled() {
    const next = !settings.enabled;
    const updated = saveNotificationSettings({ enabled: next });
    setSettings(updated);
    onSettingsChanged?.();
  }

  function toggleSound() {
    const next = !settings.sound;
    const updated = saveNotificationSettings({ sound: next });
    setSettings(updated);
    onSettingsChanged?.();
  }

  async function handleSendTest() {
    setTesting(true);
    setTestResult(null);
    try {
      if (permission !== "granted") {
        const res = await requestNotificationPermission();
        setPermission(res);
        if (res !== "granted") {
          setTestResult("Permission not granted. Please enable notifications in your browser.");
          return;
        }
      }

      const success = await sendPushNotification("Daily Quest Alert · Better Than Yesterday", {
        body: "Level Up! Your reminder system is working perfectly. Complete today's quests and arise!",
        url: "/dashboard",
      });

      if (success) {
        setTestResult("Push notification sent! Check your screen or notification center.");
      } else {
        setTestResult("Failed to send notification. Please verify browser permissions.");
      }
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title">
      <div className="system-modal max-w-xl">
        <header className="modal-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="system-label">SETTINGS // ALERT DISPATCH</p>
              <h2 id="settings-dialog-title" className="text-xl font-extrabold tracking-wide">
                Notification Settings
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5">
          {/* Permission Status Box */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Browser Permission Status
                </span>
                <div className="mt-1 flex items-center gap-2">
                  {permission === "granted" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Granted & Active
                    </span>
                  )}
                  {permission === "denied" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="h-3.5 w-3.5" /> Denied / Blocked
                    </span>
                  )}
                  {permission === "default" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                      <BellOff className="h-3.5 w-3.5" /> Not Enabled Yet
                    </span>
                  )}
                  {permission === "unsupported" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-400 border border-slate-700">
                      Unsupported on this Browser
                    </span>
                  )}
                </div>
              </div>

              {permission !== "granted" && supported && (
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  className="btn-neon text-xs h-9 font-bold cursor-pointer"
                >
                  Request Permission
                </Button>
              )}
            </div>

            {/* Denied guidance instructions */}
            {permission === "denied" && (
              <div className="mt-4 pt-3 border-t border-rose-500/20 text-xs text-rose-200/90 space-y-2">
                <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  How to enable notifications in browser settings:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <p className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Laptop className="h-3.5 w-3.5" /> Chrome / Edge / Brave
                    </p>
                    <p className="mt-1">
                      Click the <strong>Padlock / Tuner</strong> icon in the address bar left of the URL → Toggle <strong>Notifications</strong> to <strong>Allow</strong> → Refresh page.
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <p className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Safari / iOS / Android
                    </p>
                    <p className="mt-1">
                      Open <strong>Settings</strong> → <strong>Safari / Chrome</strong> → <strong>Site Settings</strong> → <strong>Notifications</strong> → Allow for this site.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Master Toggle & Options */}
          <div className="space-y-3">
            <div className="reminder-row">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Scheduled Push Reminders</h4>
                  <p className="text-xs text-slate-400">
                    Receive alert notifications when scheduled tasks and habit check-ins are due.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={toggleMasterEnabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="reminder-row">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                  {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Audio Chime</h4>
                  <p className="text-xs text-slate-400">
                    Play a gentle futuristic chime when a reminder is triggered.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={toggleSound}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>

          {/* Test Notification Section */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Test Push Notification</h4>
                <p className="text-xs text-slate-400">
                  Verify that your current browser & device display push alerts properly.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={testing}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/50"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {testing ? "Sending..." : "Send Test Alert"}
              </Button>
            </div>

            {testResult && (
              <p
                className={`mt-2.5 text-xs p-2.5 rounded-lg border ${
                  testResult.includes("sent")
                    ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
                    : "border-amber-500/30 bg-amber-950/30 text-amber-300"
                }`}
              >
                {testResult}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
          <Button onClick={onClose} className="btn-neon cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
