import { pool } from "./client";

const GAME_REQUESTS_MIGRATION = "20260903_game_requests_v1";

const gameRequestsSql = `
DO $$ BEGIN CREATE TYPE game_request_status AS ENUM ('draft','submitted','under_review','info_requested','approved','declined','in_development','delivered'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE game_request_category AS ENUM ('role_based','scenario_based','simulation_strategy','puzzle','mini_games','creative','exploration'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE game_request_age_group AS ENUM ('4_6','7_9','10_12','13_15','16_18'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE game_request_domain AS ENUM ('literacy','activities','environment','developmental_skills','social_relations'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE game_request_tier AS ENUM ('tier_1','tier_2','tier_3'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE game_request_scope AS ENUM ('collection_only','collection_and_analysis'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS game_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  status game_request_status NOT NULL DEFAULT 'draft',
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_entity text NOT NULL,
  requester_phone text,
  game_name text NOT NULL,
  game_description text NOT NULL,
  category game_request_category NOT NULL,
  secondary_tags text[] NOT NULL DEFAULT '{}',
  age_group game_request_age_group NOT NULL,
  languages text[] NOT NULL DEFAULT '{}',
  sample_url text,
  sample_file_path text,
  sample_file_name text,
  sample_file_type text,
  sample_file_size text,
  domain game_request_domain NOT NULL,
  indicator_needed text NOT NULL,
  indicator_is_new boolean NOT NULL,
  source_classes text[] NOT NULL DEFAULT '{}',
  tier game_request_tier NOT NULL,
  scope game_request_scope NOT NULL,
  target_date text,
  notes text,
  missing_required_fields text[] NOT NULL DEFAULT '{}',
  access_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);
ALTER TABLE game_requests ADD COLUMN IF NOT EXISTS missing_required_fields text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS game_requests_access_idx ON game_requests(access_hash);
CREATE INDEX IF NOT EXISTS game_requests_status_idx ON game_requests(status, updated_at);
CREATE INDEX IF NOT EXISTS game_requests_domain_idx ON game_requests(domain);
CREATE TABLE IF NOT EXISTS game_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  from_status game_request_status,
  to_status game_request_status NOT NULL,
  actor_id uuid,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_request_events_request_idx ON game_request_events(request_id, created_at);
CREATE TABLE IF NOT EXISTS game_request_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_request_notifications_created_idx ON game_request_notifications(created_at);
`;

export async function runDatabaseMigrations() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('bunayn_database_migrations'))");
    await client.query("CREATE TABLE IF NOT EXISTS bunayn_schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const existing = await client.query("SELECT 1 FROM bunayn_schema_migrations WHERE id = $1", [GAME_REQUESTS_MIGRATION]);
    if (existing.rowCount === 0) {
      await client.query(gameRequestsSql);
      await client.query("INSERT INTO bunayn_schema_migrations (id) VALUES ($1)", [GAME_REQUESTS_MIGRATION]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}