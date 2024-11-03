CREATE TABLE IF NOT EXISTS notes(
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] NOT NULL
);
