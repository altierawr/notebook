CREATE TABLE IF NOT EXISTS notes(
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  raw_content text NOT NULL DEFAULT '',
  is_favorite boolean NOT NULL DEFAULT false,
  is_trashed boolean NOT NULL DEFAULT false,
  trashed_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  tags text[] NOT NULL DEFAULT array[]::text[],
  version integer NOT NULL DEFAULT 1
);
