-- Additional tables needed for admin panel and enhanced features

-- Posts table (if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  content       text NOT NULL,
  type          text NOT NULL DEFAULT 'question', -- 'question', 'tip', 'experience'
  is_approved   boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_approved ON posts(is_approved);

-- Post images table
CREATE TABLE IF NOT EXISTS post_images (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id       text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url           text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  post_id       text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id       text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON post_comments(author_id);

-- Notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          text NOT NULL, -- 'post_response', 'comment', 'ai_suggestion', 'reminder'
  title         text NOT NULL,
  message       text NOT NULL,
  link          text DEFAULT '',
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Reminders table (for vaccination schedules, feeding times, etc.)
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

