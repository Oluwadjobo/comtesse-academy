
import type { FastifyInstance } from "fastify";
import type { QueryResultRow } from "pg";
import { db } from "./db.js";
import { requireRole } from "./authorization.js";

interface QuestionParams {
  questionId: string;
}

interface StatusBody {
  publicationStatus: "approved" | "published" | "rejected" | "draft";
}

interface Option {
  id: string;
  text: string;
}

interface QuestionRow extends QueryResultRow {
  id: string;
  module_id: string;
  question_text: string;
  answer_options?: Option[];
  correct_option_ids?: string[];
  explanation?: string;
  publication_status: string;
  is_critical: boolean;
  approved_by: string | null;
  approved_at: Date | null;
}

export async function registerQuestionRoutes(
  app: FastifyInstance,
): Promise<void> {
  // Liste des questions et détails nécessaires à leur validation.
  app.get(
    "/admin/questions",
    { preHandler: requireRole("manager", "admin") },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Base de données indisponible.",
        });
      }

      try {
        const result = await db.query<QuestionRow>(
          `SELECT id, module_id, question_text, answer_options,
                  correct_option_ids, explanation, publication_status,
                  is_critical, approved_by, approved_at
           FROM questions
           ORDER BY module_id, id`,
        );

        return { questions: result.rows };
      } catch (error) {
        request.log.error({ err: error }, "Failed to list questions");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de charger les questions.",
        });
      }
    },
  );

  // Approbation ou rejet d'une question.
  app.patch<{ Params: QuestionParams; Body: StatusBody }>(
    "/admin/questions/:questionId/status",
    {
      preHandler: requireRole("manager", "admin"),
      schema: {
        params: {
          type: "object",
          required: ["questionId"],
          additionalProperties: false,
          properties: {
            questionId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["publicationStatus"],
          additionalProperties: false,
          properties: {
            publicationStatus: {
              type: "string",
              enum: ["approved", "rejected", "draft"],
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Base de données indisponible.",
        });
      }

      const actor = request.authUser;
      if (!actor?.id) {
        return reply.code(401).send({
          error: "unauthorized",
          message: "Connexion requise.",
        });
      }

      try {
        const { questionId } = request.params;
        const { publicationStatus } = request.body;

        const result = await db.query<QuestionRow>(
          `UPDATE questions
           SET publication_status = $1,
               approved_by = CASE
                 WHEN $1 = 'approved' THEN $2::uuid
                 ELSE NULL
               END,
               approved_at = CASE
                 WHEN $1 = 'approved' THEN NOW()
                 ELSE NULL
               END
           WHERE id = $3::uuid
             AND publication_status <> 'published'
           RETURNING id, module_id, question_text, publication_status,
                     is_critical, approved_by, approved_at`,
          [publicationStatus, actor.id, questionId],
        );

        if (!result.rows[0]) {
          return reply.code(404).send({
            error: "question_not_found_or_already_published",
            message: "Question introuvable ou déjà publiée.",
          });
        }

        return {
          message: "Statut de la question mis à jour.",
          question: result.rows[0],
        };
      } catch (error) {
        request.log.error({ err: error }, "Failed to update question status");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de modifier le statut de la question.",
        });
      }
    },
  );

  // Publication séparée, uniquement après approbation
  // et publication du module associé.
  app.patch<{ Params: QuestionParams }>(
    "/admin/questions/:questionId/publish",
    {
      preHandler: requireRole("manager", "admin"),
      schema: {
        params: {
          type: "object",
          required: ["questionId"],
          additionalProperties: false,
          properties: {
            questionId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Base de données indisponible.",
        });
      }

      try {
        const result = await db.query<QuestionRow>(
          `UPDATE questions q
           SET publication_status = 'published'
           FROM modules m
           WHERE q.id = $1::uuid
             AND q.module_id = m.id
             AND q.publication_status = 'approved'
             AND q.approved_by IS NOT NULL
             AND q.approved_at IS NOT NULL
             AND m.publication_status = 'published'
           RETURNING q.id, q.module_id, q.question_text,
                     q.publication_status, q.is_critical,
                     q.approved_by, q.approved_at`,
          [request.params.questionId],
        );

        if (!result.rows[0]) {
          return reply.code(409).send({
            error: "approval_or_module_publication_required",
            message:
              "La question doit être approuvée et son module publié avant sa publication.",
          });
        }

        return {
          message: "Question publiée.",
          question: result.rows[0],
        };
      } catch (error) {
        request.log.error({ err: error }, "Failed to publish question");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de publier la question.",
        });
      }
    },
  );
}
