-- Feeding schedules per user
CREATE TABLE IF NOT EXISTS feeding_schedules (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_of_day     time NOT NULL,
  feed_type       text DEFAULT '',
  ration_grams    integer DEFAULT 0,
  notes           text DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feeding_user ON feeding_schedules(user_id);

-- Farm logs for daily metrics
CREATE TABLE IF NOT EXISTS farm_logs (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date        date NOT NULL DEFAULT CURRENT_DATE,
  num_birds       integer DEFAULT 0,
  feed_type       text DEFAULT '',
  daily_feed_kg   numeric(10,2) DEFAULT 0,
  mortality       integer DEFAULT 0,
  notes           text DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_farm_logs_user ON farm_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_logs_date ON farm_logs(log_date);
