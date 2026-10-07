import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toDateKey } from "@/lib/progression";
export { toDateKey };

export type HabitStatus = "completed" | "partial" | "skipped" | "missed";

export interface Habit {
  id: string; owner_id: string; name: string; description: string; emoji: string; color: string;
  category: string; priority: string; difficulty: string; target_value: number; target_unit: string;
  daily_score: number; reminder_enabled: boolean; reminder_time: string | null; sort_order: number;
  archived: boolean; active_from: string; deleted_at: string | null; created_at?: string;
}
export interface HabitLog {
  id: string; habit_id: string; log_date: string; status: HabitStatus; progress: number;
  note: string | null; score_awarded: number;
}

export const HABIT_COLORS = ["cyan", "purple", "emerald", "orange", "pink"] as const;
export const STATUS_META: Record<HabitStatus, { label: string; short: string; color: string }> = {
  completed: { label: "Completed", short: "✓", color: "var(--neon-emerald)" },
  partial: { label: "Partial", short: "◐", color: "var(--neon-orange)" },
  skipped: { label: "Skipped", short: "–", color: "var(--neon-purple)" },
  missed: { label: "Missed", short: "✕", color: "var(--destructive)" },
};
export const STATUS_CYCLE: HabitStatus[] = ["completed", "partial", "skipped", "missed"];

export function colorVar(color: string) {
  return `var(--neon-${HABIT_COLORS.includes(color as (typeof HABIT_COLORS)[number]) ? color : "cyan"})`;
}
export function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }

export const habitInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  emoji: z.string().trim().min(1).max(8),
  color: z.enum(HABIT_COLORS),
  category: z.string().trim().min(1).max(60),
  priority: z.enum(["low", "medium", "high"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  target_value: z.number().positive().max(1_000_000),
  target_unit: z.string().trim().min(1).max(40),
  daily_score: z.number().int().min(1).max(1000),
  reminder_enabled: z.boolean(),
  reminder_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
  sort_order: z.number().int().min(0).optional(),
  archived: z.boolean().optional(),
});

const logInputSchema = z.object({
  habitId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["completed", "partial", "skipped", "missed"]).nullable(),
  progress: z.number().min(0).max(100).optional(), note: z.string().trim().max(280).nullable().optional(),
});

import { DEFAULT_HABITS } from "./auth-defaults";

const DEMO_HABITS: Habit[] = DEFAULT_HABITS.map((h, i) => ({
  id: `demo-habit-${i + 1}`,
  owner_id: "demo-hunter-id",
  name: h.name,
  description: "",
  emoji: h.emoji,
  color: h.color,
  category: h.category,
  priority: h.priority,
  difficulty: h.difficulty,
  target_value: h.target_value,
  target_unit: h.target_unit,
  daily_score: 10,
  reminder_enabled: false,
  reminder_time: null,
  sort_order: i,
  archived: false,
  active_from: toDateKey(new Date()),
  deleted_at: null,
}));

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        return {
          id: "demo-user",
          full_name: "Sung Jin-Woo",
          username: "ShadowMonarch",
          user_id: "demo_hunter",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        };
      }
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const { data } = await supabase
        .from("profiles")
        .update({ timezone })
        .eq("id", auth.user.id)
        .select("*")
        .maybeSingle();
      return (
        data || {
          id: auth.user.id,
          full_name: (auth.user.user_metadata?.full_name as string) || "Hunter",
          username: (auth.user.user_metadata?.username as string) || "Hunter",
          user_id: (auth.user.user_metadata?.user_id as string) || "hunter",
          timezone,
        }
      );
    },
  });
}

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        const stored = localStorage.getItem("bty_demo_habits");
        return stored ? (JSON.parse(stored) as Habit[]) : DEMO_HABITS;
      }
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) {
        const stored = localStorage.getItem("bty_demo_habits");
        return stored ? (JSON.parse(stored) as Habit[]) : DEMO_HABITS;
      }
      if (!data || data.length === 0) {
        // Auto-seed default habits for new Supabase user
        await supabase
          .from("habits")
          .insert(
            DEFAULT_HABITS.map((h, i) => ({
              ...h,
              owner_id: auth.user!.id,
              sort_order: i,
              active_from: toDateKey(new Date()),
            }))
          );
        const { data: seeded } = await supabase
          .from("habits")
          .select("*")
          .order("sort_order", { ascending: true });
        return (seeded ?? DEMO_HABITS) as Habit[];
      }
      return (data ?? []) as Habit[];
    },
  });
}

export function useLogs(from?: string, to?: string) {
  return useQuery({
    queryKey: ["logs", from ?? "all", to ?? "all"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        const stored = localStorage.getItem("bty_demo_logs");
        return stored ? (JSON.parse(stored) as HabitLog[]) : [];
      }
      let query = supabase.from("habit_logs").select("*").order("log_date", { ascending: true });
      if (from) query = query.gte("log_date", from);
      if (to) query = query.lte("log_date", to);
      const { data, error } = await query;
      if (error) return [];
      return (data ?? []) as HabitLog[];
    },
  });
}

export function useHabitMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["habits"] });
    qc.invalidateQueries({ queryKey: ["logs"] });
  };

  const saveHabit = useMutation({
    mutationFn: async (raw: unknown) => {
      const habit = habitInputSchema.parse(raw);
      const { data: auth } = await supabase.auth.getUser();
      const reminderTime = habit.reminder_enabled ? habit.reminder_time : null;

      if (!auth.user) {
        // Local demo mode
        const current: Habit[] = JSON.parse(localStorage.getItem("bty_demo_habits") || JSON.stringify(DEMO_HABITS));
        if (habit.id) {
          const updated = current.map((h) => (h.id === habit.id ? { ...h, ...habit, reminder_time: reminderTime } : h));
          localStorage.setItem("bty_demo_habits", JSON.stringify(updated));
        } else {
          const newHabit: Habit = {
            id: `demo-habit-${Date.now()}`,
            owner_id: "demo-hunter-id",
            name: habit.name,
            description: habit.description || "",
            emoji: habit.emoji,
            color: habit.color,
            category: habit.category,
            priority: habit.priority,
            difficulty: habit.difficulty,
            target_value: habit.target_value,
            target_unit: habit.target_unit,
            daily_score: habit.daily_score,
            reminder_enabled: habit.reminder_enabled,
            reminder_time: reminderTime,
            sort_order: current.length,
            archived: false,
            active_from: toDateKey(new Date()),
            deleted_at: null,
          };
          localStorage.setItem("bty_demo_habits", JSON.stringify([...current, newHabit]));
        }
        return;
      }

      if (habit.reminder_enabled && !reminderTime) throw new Error("Choose a reminder time.");
      try {
        if (habit.id) {
          const { id, ...patch } = habit;
          const { error } = await supabase
            .from("habits")
            .update({ ...patch, reminder_time: reminderTime } as never)
            .eq("id", id)
            .eq("owner_id", auth.user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("habits")
            .insert({
              ...habit,
              reminder_time: reminderTime,
              owner_id: auth.user.id,
              active_from: toDateKey(new Date()),
            } as never);
          if (error) throw error;
        }
      } catch {
        // Fallback to local storage if remote tables are not yet created
        const current: Habit[] = JSON.parse(localStorage.getItem("bty_demo_habits") || JSON.stringify(DEMO_HABITS));
        if (habit.id) {
          const updated = current.map((h) => (h.id === habit.id ? { ...h, ...habit, reminder_time: reminderTime } : h));
          localStorage.setItem("bty_demo_habits", JSON.stringify(updated));
        } else {
          const newHabit: Habit = {
            id: `demo-habit-${Date.now()}`,
            owner_id: auth.user.id,
            name: habit.name,
            description: habit.description || "",
            emoji: habit.emoji,
            color: habit.color,
            category: habit.category,
            priority: habit.priority,
            difficulty: habit.difficulty,
            target_value: habit.target_value,
            target_unit: habit.target_unit,
            daily_score: habit.daily_score,
            reminder_enabled: habit.reminder_enabled,
            reminder_time: reminderTime,
            sort_order: current.length,
            archived: false,
            active_from: toDateKey(new Date()),
            deleted_at: null,
          };
          localStorage.setItem("bty_demo_habits", JSON.stringify([...current, newHabit]));
        }
      }
    },
    onSuccess: invalidate,
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        const current: Habit[] = JSON.parse(localStorage.getItem("bty_demo_habits") || JSON.stringify(DEMO_HABITS));
        const updated = current.filter((h) => h.id !== id);
        localStorage.setItem("bty_demo_habits", JSON.stringify(updated));
        return;
      }
      const parsed = z.string().uuid().parse(id);
      const { error } = await supabase
        .from("habits")
        .update({ deleted_at: new Date().toISOString(), archived: true } as never)
        .eq("id", parsed)
        .eq("owner_id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setLog = useMutation({
    mutationFn: async (raw: unknown) => {
      const input = logInputSchema.parse(raw);
      if (input.date !== toDateKey(new Date())) throw new Error("Previous days are locked.");
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        // Local demo storage
        const currentLogs: HabitLog[] = JSON.parse(localStorage.getItem("bty_demo_logs") || "[]");
        if (input.status === null) {
          const filtered = currentLogs.filter((l) => !(l.habit_id === input.habitId && l.log_date === input.date));
          localStorage.setItem("bty_demo_logs", JSON.stringify(filtered));
          return;
        }
        const existingIdx = currentLogs.findIndex((l) => l.habit_id === input.habitId && l.log_date === input.date);
        const progress = input.progress ?? (input.status === "completed" ? 100 : input.status === "partial" ? 50 : 0);
        const newLog: HabitLog = {
          id: existingIdx >= 0 ? currentLogs[existingIdx].id : `demo-log-${Date.now()}`,
          habit_id: input.habitId,
          log_date: input.date,
          status: input.status,
          progress,
          note: input.note ?? null,
          score_awarded: input.status === "completed" ? 10 : 0,
        };
        if (existingIdx >= 0) {
          currentLogs[existingIdx] = newLog;
        } else {
          currentLogs.push(newLog);
        }
        localStorage.setItem("bty_demo_logs", JSON.stringify(currentLogs));
        return;
      }

      if (input.status === null) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", input.habitId)
          .eq("log_date", input.date);
        if (error) throw error;
        return;
      }
      const progress = input.progress ?? (input.status === "completed" ? 100 : input.status === "partial" ? 50 : 0);
      const { error } = await supabase.from("habit_logs").upsert(
        {
          owner_id: auth.user.id,
          habit_id: input.habitId,
          log_date: input.date,
          status: input.status,
          progress,
          note: input.note ?? null,
          score_awarded: input.status === "completed" ? 10 : 0,
        } as never,
        { onConflict: "habit_id,log_date" }
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { saveHabit, deleteHabit, setLog };
}
