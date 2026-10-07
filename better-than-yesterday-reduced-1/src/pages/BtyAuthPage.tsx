import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_HABITS, USER_ID_RE, internalEmailFor } from "@/lib/auth-defaults";
import { toDateKey } from "@/lib/progression";

export function BtyAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginId, setLoginId] = useState(() => localStorage.getItem("ut_last_user") ?? "");
  const [loginPw, setLoginPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    userId: "",
    email: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: unknown } }) => {
      if (res.data.session) navigate("/dashboard");
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const cleanId = loginId.trim().toLowerCase();
    if (!cleanId) {
      setError("Please enter your User ID.");
      setBusy(false);
      return;
    }

    try {
      const authEmail = internalEmailFor(cleanId);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: loginPw,
      });

      if (signInError) {
        // Fallback: Check if demo hunter
        if (cleanId === "demo" || cleanId === "hunter") {
          loginAsDemo();
          return;
        }
        throw new Error("Incorrect User ID or password. Try 'demo' or create a new account.");
      }

      if (remember) localStorage.setItem("ut_last_user", cleanId);
      else localStorage.removeItem("ut_last_user");

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function loginAsDemo() {
    setBusy(true);
    setError(null);
    try {
      const demoEmail = "demo_hunter@id.upgradetracker.app";
      const demoPw = "hunter123456";
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPw,
      });

      if (signInError) {
        // Create demo account if not exists
        const { data: created } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPw,
          options: {
            data: { full_name: "Sung Jin-Woo", user_id: "demo_hunter" },
          },
        });

        if (created.user) {
          await supabase.from("profiles").upsert({
            id: created.user.id,
            full_name: "Sung Jin-Woo",
            username: "ShadowMonarch",
            user_id: "demo_hunter",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          });

          await supabase.from("habits").insert(
            DEFAULT_HABITS.map((h, i) => ({
              ...h,
              owner_id: created.user!.id,
              sort_order: i,
              active_from: toDateKey(new Date()),
            }))
          );
        }
      }

      localStorage.setItem("ut_last_user", "demo_hunter");
      navigate("/dashboard");
    } catch {
      // Direct navigate if local
      localStorage.setItem("ut_demo_mode", "true");
      navigate("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanUserId = form.userId.trim().toLowerCase();

    if (!USER_ID_RE.test(cleanUserId)) {
      return setError("User ID must be 3–32 characters (letters, numbers, . _ -).");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      const authEmail = internalEmailFor(cleanUserId);

      // Check if user_id is taken
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", cleanUserId)
        .maybeSingle();

      if (existingProfile) {
        throw new Error("That User ID is already taken. Please choose another.");
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password: form.password,
        options: {
          data: {
            user_id: cleanUserId,
            full_name: form.fullName.trim(),
            username: form.username.trim(),
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || "Failed to create account.");
      }

      const userId = signUpData.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: form.fullName.trim(),
          username: form.username.trim(),
          user_id: cleanUserId,
          email: form.email.trim() || null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        });

        await supabase.from("habits").insert(
          DEFAULT_HABITS.map((h, i) => ({
            ...h,
            owner_id: userId,
            sort_order: i,
            active_from: toDateKey(new Date()),
          }))
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: form.password,
      });

      if (signInError) {
        setMode("login");
        setLoginId(cleanUserId);
        setNotice("Account created successfully! Please sign in with your User ID.");
        return;
      }

      localStorage.setItem("ut_last_user", cleanUserId);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-[#08090f] text-slate-100">
      <div className="w-full max-w-5xl gap-10 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <section className="mb-10 lg:mb-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#22d3ee] uppercase backdrop-blur-md">
            <img
              src="/better-than-yesterday-logo.jpg"
              alt="Better Than Yesterday logo"
              className="h-5 w-5 rounded-md object-cover"
            />
            Daily growth system
          </span>

          <div className="mt-5 mb-4 flex h-20 w-20 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/20">
            <img
              src="/better-than-yesterday-logo.jpg"
              alt="Better Than Yesterday logo"
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="mt-2 text-4xl leading-tight font-extrabold sm:text-6xl text-white">
            Better <span className="neon-text">Than Yesterday</span>
          </h1>

          <p className="mt-4 max-w-md text-lg text-slate-400">
            Become better than yesterday. Track habits, streaks, Total Score and productivity with a dashboard
            built for consistent daily progress.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            {[
              { icon: Zap, text: "Streaks, Total Score & levels" },
              { icon: Sparkles, text: "Live habit analytics" },
              { icon: ShieldCheck, text: "Private User ID login" },
              { icon: Zap, text: "Fully editable habits" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="glass-tile flex items-center gap-3 px-4 py-3">
                <Icon className="h-4 w-4 text-[#22d3ee]" />
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-4">
            <button
              type="button"
              onClick={loginAsDemo}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Quick Demo Hunter Access (Instant Trial)
            </button>
          </div>
        </section>

        <section className="glass-panel p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-900/80 p-1 text-sm font-semibold border border-white/5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`rounded-lg py-2 transition-all ${
                  mode === m
                    ? "btn-neon text-black font-bold shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Login" : "Create Account"}
              </button>
            ))}
          </div>

          {notice && (
            <p className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-sm text-cyan-300">
              {notice}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="User ID">
                <input
                  className="field"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="your-user-id (e.g. demo_hunter)"
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label="Password">
                <input
                  className="field"
                  type="password"
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400 rounded"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      "Password recovery: If you forget your password, sign in with demo hunter or create a new account.",
                    )
                  }
                  className="text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={busy} className="btn-neon w-full py-3 cursor-pointer">
                {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Enter Dashboard"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name">
                  <input
                    className="field"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Sung Jin-Woo"
                    required
                  />
                </Field>
                <Field label="Username">
                  <input
                    className="field"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="ShadowMonarch"
                    required
                  />
                </Field>
              </div>
              <Field label="User ID (unique)">
                <input
                  className="field"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  placeholder="hunter_01"
                  required
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  className="field"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hunter@example.com"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password">
                  <input
                    className="field"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters"
                    required
                  />
                </Field>
                <Field label="Confirm Password">
                  <input
                    className="field"
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Repeat password"
                    required
                  />
                </Field>
              </div>
              <button type="submit" disabled={busy} className="btn-neon w-full py-3 cursor-pointer">
                {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Create My Account"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
