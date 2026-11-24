-- COMTESSE Academy V2 foundation.
-- Isolated schema: this migration does not alter or delete legacy Academy tables.
CREATE SCHEMA IF NOT EXISTS comtesse_v2;

CREATE TABLE IF NOT EXISTS comtesse_v2.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id VARCHAR(80) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainer', 'learner')),
  password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (role IN ('admin', 'trainer') AND password_hash IS NOT NULL)
    OR (role = 'learner' AND password_hash IS NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_comtesse_v2_users_email
  ON comtesse_v2.users (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_users_role_active
  ON comtesse_v2.users (role, is_active);

CREATE TABLE IF NOT EXISTS comtesse_v2.learner_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES comtesse_v2.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_access_codes_learner
  ON comtesse_v2.learner_access_codes (learner_id, expires_at DESC)
  WHERE consumed_at IS NULL AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS comtesse_v2.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES comtesse_v2.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_sessions_expiry
  ON comtesse_v2.sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS comtesse_v2.training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES comtesse_v2.users(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  current_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_programs_trainer
  ON comtesse_v2.training_programs (trainer_id, is_active);

CREATE TABLE IF NOT EXISTS comtesse_v2.program_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES comtesse_v2.training_programs(id) ON DELETE RESTRICT,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  change_summary TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, version_number),
  UNIQUE (id, program_id),
  CHECK ((status = 'published' AND published_at IS NOT NULL)
      OR status <> 'published')
);
ALTER TABLE comtesse_v2.training_programs
  ADD CONSTRAINT fk_comtesse_v2_program_current_version
  FOREIGN KEY (current_version_id, id)
  REFERENCES comtesse_v2.program_versions(id, program_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS comtesse_v2.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES comtesse_v2.training_programs(id) ON DELETE RESTRICT,
  module_key VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, module_key),
  UNIQUE (id, program_id)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.module_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES comtesse_v2.training_modules(id) ON DELETE RESTRICT,
  program_version_id UUID NOT NULL REFERENCES comtesse_v2.program_versions(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, program_version_id),
  UNIQUE (program_version_id, sort_order),
  UNIQUE (id, program_version_id)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.learning_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_version_id UUID NOT NULL REFERENCES comtesse_v2.module_versions(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_version_id, sort_order)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL UNIQUE,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size > 0),
  checksum_sha256 CHAR(64),
  uploaded_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comtesse_v2.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES comtesse_v2.learning_sequences(id) ON DELETE RESTRICT,
  block_type VARCHAR(24) NOT NULL
    CHECK (block_type IN ('text', 'image', 'image_gallery', 'audio')),
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  text_content TEXT,
  media_asset_id UUID REFERENCES comtesse_v2.media_assets(id) ON DELETE RESTRICT,
  caption TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sequence_id, sort_order),
  CHECK (
    (block_type = 'text' AND text_content IS NOT NULL AND media_asset_id IS NULL)
    OR (block_type IN ('image', 'audio') AND media_asset_id IS NOT NULL AND text_content IS NULL)
    OR (block_type = 'image_gallery' AND media_asset_id IS NULL AND text_content IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS comtesse_v2.content_block_gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_block_id UUID NOT NULL REFERENCES comtesse_v2.content_blocks(id) ON DELETE RESTRICT,
  media_asset_id UUID NOT NULL REFERENCES comtesse_v2.media_assets(id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  caption TEXT NOT NULL DEFAULT '',
  UNIQUE (content_block_id, sort_order),
  UNIQUE (content_block_id, media_asset_id)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.assessment_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_version_id UUID NOT NULL REFERENCES comtesse_v2.program_versions(id) ON DELETE RESTRICT,
  module_version_id UUID REFERENCES comtesse_v2.module_versions(id) ON DELETE RESTRICT,
  assessment_kind VARCHAR(20) NOT NULL
    CHECK (assessment_kind IN ('module_quiz', 'final')),
  title VARCHAR(200) NOT NULL,
  pass_score NUMERIC(5,2) NOT NULL DEFAULT 80 CHECK (pass_score BETWEEN 0 AND 100),
  max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (assessment_kind = 'module_quiz' AND module_version_id IS NOT NULL)
    OR (assessment_kind = 'final' AND module_version_id IS NULL)
  ),
  UNIQUE (id, program_version_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_comtesse_v2_module_quiz_version
  ON comtesse_v2.assessment_versions (module_version_id)
  WHERE assessment_kind = 'module_quiz';
CREATE UNIQUE INDEX IF NOT EXISTS uq_comtesse_v2_final_assessment_version
  ON comtesse_v2.assessment_versions (program_version_id)
  WHERE assessment_kind = 'final';

CREATE TABLE IF NOT EXISTS comtesse_v2.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_version_id UUID NOT NULL REFERENCES comtesse_v2.assessment_versions(id) ON DELETE RESTRICT,
  question_text TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  question_type VARCHAR(20) NOT NULL DEFAULT 'single_choice'
    CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
  points NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (points > 0),
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_version_id, sort_order)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.assessment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES comtesse_v2.assessment_questions(id) ON DELETE RESTRICT,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  UNIQUE (question_id, sort_order)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES comtesse_v2.training_programs(id) ON DELETE RESTRICT,
  learner_id UUID NOT NULL REFERENCES comtesse_v2.users(id) ON DELETE RESTRICT,
  pinned_program_version_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_by UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  UNIQUE (program_id, learner_id),
  FOREIGN KEY (pinned_program_version_id, program_id)
    REFERENCES comtesse_v2.program_versions(id, program_id)
    ON DELETE RESTRICT,
  CHECK (pinned_program_version_id IS NULL OR started_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_enrollments_learner
  ON comtesse_v2.enrollments (learner_id, is_active);

CREATE TABLE IF NOT EXISTS comtesse_v2.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_version_id UUID NOT NULL REFERENCES comtesse_v2.assessment_versions(id) ON DELETE RESTRICT,
  enrollment_id UUID NOT NULL REFERENCES comtesse_v2.enrollments(id) ON DELETE RESTRICT,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'graded', 'cancelled')),
  score NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  UNIQUE (assessment_version_id, enrollment_id, attempt_number)
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_attempts_enrollment
  ON comtesse_v2.assessment_attempts (enrollment_id, started_at DESC);

CREATE TABLE IF NOT EXISTS comtesse_v2.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES comtesse_v2.assessment_attempts(id) ON DELETE RESTRICT,
  question_id UUID NOT NULL REFERENCES comtesse_v2.assessment_questions(id) ON DELETE RESTRICT,
  selected_option_ids UUID[] NOT NULL DEFAULT '{}',
  is_correct BOOLEAN,
  awarded_points NUMERIC(6,2),
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS comtesse_v2.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL UNIQUE REFERENCES comtesse_v2.enrollments(id) ON DELETE RESTRICT,
  final_attempt_id UUID NOT NULL UNIQUE REFERENCES comtesse_v2.assessment_attempts(id) ON DELETE RESTRICT,
  certificate_number VARCHAR(80) NOT NULL UNIQUE,
  verification_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  learner_name_snapshot VARCHAR(160) NOT NULL,
  program_title_snapshot VARCHAR(200) NOT NULL,
  final_score NUMERIC(5,2) NOT NULL CHECK (final_score BETWEEN 0 AND 100),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS comtesse_v2.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES comtesse_v2.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comtesse_v2_audit_entity
  ON comtesse_v2.audit_logs (entity_type, entity_id, created_at DESC);

-- Keep publication pointer within the same program and point only to a published version.
CREATE OR REPLACE FUNCTION comtesse_v2.validate_current_program_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.current_version_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM comtesse_v2.program_versions pv
    WHERE pv.id = NEW.current_version_id
      AND pv.program_id = NEW.id
      AND pv.status = 'published'
  ) THEN
    RAISE EXCEPTION 'current_version_id must reference a published version of this program';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_comtesse_v2_validate_current_version
  ON comtesse_v2.training_programs;
CREATE TRIGGER trg_comtesse_v2_validate_current_version
BEFORE INSERT OR UPDATE OF current_version_id
ON comtesse_v2.training_programs
FOR EACH ROW EXECUTE FUNCTION comtesse_v2.validate_current_program_version();
