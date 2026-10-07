import { useEffect } from "react";
import { Bell, CheckCircle2, Sparkles, X } from "lucide-react";

interface PushAlertBannerProps {
  title: string;
  body: string;
  onClose: () => void;
}

export function PushAlertBanner({ title, body, onClose }: PushAlertBannerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,30rem)] animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/60 bg-[#0d101c]/95 p-4 shadow-[0_0_50px_rgba(34,211,238,0.35)] backdrop-blur-xl">
        {/* Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Bell className="h-5 w-5 animate-bounce" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase">
                PUSH NOTIFICATION TRIGGERED
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-2.5 w-2.5" /> LIVE
              </span>
            </div>

            <h4 className="mt-0.5 text-sm font-bold text-slate-100 truncate">
              {title}
            </h4>

            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {body}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="h-3 w-3" /> Better Than Yesterday · Daily System
              </span>
              <span>Just now</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
