
-- Traçabilité de l'approbation des modules.
ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS approved_by UUID
        REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Traçabilité de l'approbation des leçons.
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS approved_by UUID
        REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Index utiles pour retrouver les contenus en attente de validation.
CREATE INDEX IF NOT EXISTS idx_modules_publication_status
    ON modules(publication_status);

CREATE INDEX IF NOT EXISTS idx_lessons_publication_status
    ON lessons(module_id, publication_status);
