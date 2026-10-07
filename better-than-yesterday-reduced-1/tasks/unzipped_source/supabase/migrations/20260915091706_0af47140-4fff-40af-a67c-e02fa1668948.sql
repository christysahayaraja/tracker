ALTER TABLE public.profiles
  ADD COLUMN timezone text NOT NULL DEFAULT 'UTC';

ALTER TABLE public.habits
  ADD COLUMN description text NOT NULL DEFAULT '',
  ADD COLUMN daily_score integer NOT NULL DEFAULT 10,
  ADD COLUMN reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN active_from date,
  ADD COLUMN deleted_at timestamptz;

UPDATE public.habits
SET active_from = created_at::date
WHERE active_from IS NULL;

ALTER TABLE public.habits
  ALTER COLUMN active_from SET DEFAULT CURRENT_DATE,
  ALTER COLUMN active_from SET NOT NULL,
  ADD CONSTRAINT habits_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  ADD CONSTRAINT habits_description_length CHECK (char_length(description) <= 500),
  ADD CONSTRAINT habits_category_length CHECK (char_length(btrim(category)) BETWEEN 1 AND 60),
  ADD CONSTRAINT habits_daily_score_range CHECK (daily_score BETWEEN 1 AND 1000),
  ADD CONSTRAINT habits_reminder_consistent CHECK (NOT reminder_enabled OR reminder_time IS NOT NULL),
  ADD CONSTRAINT habits_reminder_time_format CHECK (reminder_time IS NULL OR reminder_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE public.habit_logs
  ADD COLUMN score_awarded integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT habit_logs_valid_status CHECK (status IN ('completed', 'partial', 'skipped', 'missed')),
  ADD CONSTRAINT habit_logs_progress_range CHECK (progress BETWEEN 0 AND 100),
  ADD CONSTRAINT habit_logs_note_length CHECK (note IS NULL OR char_length(note) <= 280),
  ADD CONSTRAINT habit_logs_score_range CHECK (score_awarded BETWEEN 0 AND 1000);

UPDATE public.habit_logs
SET score_awarded = 10
WHERE status = 'completed';

CREATE OR REPLACE FUNCTION public.validate_habit_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'Habit owner does not match signed-in user';
  END IF;
  NEW.name := btrim(NEW.name);
  NEW.category := btrim(NEW.category);
  IF NEW.reminder_enabled = false THEN
    NEW.reminder_time := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_habit_write_trigger
BEFORE INSERT OR UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION public.validate_habit_write();

CREATE OR REPLACE FUNCTION public.validate_habit_log_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_owner uuid;
  target_score integer;
  user_timezone text;
  expected_date date;
  target_deleted_at timestamptz;
BEGIN
  SELECT h.owner_id, h.daily_score, h.deleted_at
    INTO target_owner, target_score, target_deleted_at
  FROM public.habits h
  WHERE h.id = COALESCE(NEW.habit_id, OLD.habit_id);

  IF target_owner IS NULL OR target_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Invalid habit';
  END IF;

  SELECT p.timezone INTO user_timezone
  FROM public.profiles p
  WHERE p.id = auth.uid();

  BEGIN
    expected_date := (now() AT TIME ZONE COALESCE(user_timezone, 'UTC'))::date;
  EXCEPTION WHEN invalid_parameter_value THEN
    expected_date := (now() AT TIME ZONE 'UTC')::date;
  END;

  IF TG_OP = 'DELETE' THEN
    IF OLD.log_date <> expected_date THEN
      RAISE EXCEPTION 'Historical completion records are locked';
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.owner_id <> auth.uid() OR NEW.log_date <> expected_date THEN
    RAISE EXCEPTION 'Only today can be changed';
  END IF;

  IF target_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Deleted habits cannot be changed';
  END IF;

  NEW.score_awarded := CASE WHEN NEW.status = 'completed' THEN target_score ELSE 0 END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_habit_log_write_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.habit_logs
FOR EACH ROW EXECUTE FUNCTION public.validate_habit_log_write();

REVOKE DELETE ON public.habits FROM authenticated;

CREATE INDEX habits_owner_active_idx ON public.habits(owner_id, deleted_at, archived, sort_order);
CREATE INDEX habit_logs_owner_score_idx ON public.habit_logs(owner_id, status, log_date);