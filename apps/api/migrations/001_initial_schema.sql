CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(80) UNIQUE NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('learner', 'manager', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_number SMALLINT UNIQUE NOT NULL CHECK (module_number BETWEEN 1 AND 6),
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    publication_status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (publication_status IN ('draft', 'approved', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
    title VARCHAR(180) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    lesson_order INTEGER NOT NULL DEFAULT 1 CHECK (lesson_order > 0),
    publication_status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (publication_status IN ('draft', 'approved', 'published')),
    UNIQUE (module_id, lesson_order)
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
    question_text TEXT NOT NULL,
    answer_options JSONB NOT NULL,
    correct_option_ids JSONB NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    publication_status VARCHAR(20) NOT NULL DEFAULT 'proposed'
        CHECK (publication_status IN ('draft', 'proposed', 'approved', 'published', 'rejected')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (jsonb_typeof(answer_options) = 'array'),
    CHECK (jsonb_typeof(correct_option_ids) = 'array')
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score SMALLINT CHECK (score BETWEEN 0 AND 20),
    passed BOOLEAN,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'submitted', 'graded', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS exam_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    selected_option_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_correct BOOLEAN,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (attempt_id, question_id),
    CHECK (jsonb_typeof(selected_option_ids) = 'array')
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attempt_id UUID NOT NULL UNIQUE REFERENCES exam_attempts(id) ON DELETE RESTRICT,
    verification_code UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module
    ON lessons(module_id, lesson_order);

CREATE INDEX IF NOT EXISTS idx_questions_module_status
    ON questions(module_id, publication_status);

CREATE INDEX IF NOT EXISTS idx_attempts_user_date
    ON exam_attempts(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry
    ON sessions(expires_at);
