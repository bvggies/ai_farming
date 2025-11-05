-- Create reminders table for vaccination schedules, feeding times, etc.

CREATE TABLE IF NOT EXISTS reminders (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          text NOT NULL, -- 'vaccination', 'feeding', 'medication', 'general'
  title         text NOT NULL,
  description   text DEFAULT '',
  reminder_date date NOT NULL,
  reminder_time time DEFAULT '08:00',
  is_completed  boolean DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);

