CREATE TABLE IF NOT EXISTS research_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  x_label TEXT NOT NULL,
  y_label TEXT NOT NULL,
  graph_mode TEXT NOT NULL CHECK (graph_mode IN ('origin', 'quadrant')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('text', 'link')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  x REAL NOT NULL,
  y REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES research_projects (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocks_project_id_updated_at
ON blocks (project_id, updated_at);

CREATE TABLE IF NOT EXISTS chat_channels (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES research_projects (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_channels_project_id_created_at
ON chat_channels (project_id, created_at);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES research_projects (id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES chat_channels (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id_created_at
ON chat_messages (channel_id, created_at);
