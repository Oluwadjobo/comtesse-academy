import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import { db } from "./db.js";
import { requireRole } from "./authorization.js";

const EXAM_SIZE = 20;
const PASS_SCORE = 16;

type Option = { id: string; text: string };

type ExamQuestionRow = {
  id: string;
  question_text: string;
  answer_options: Option[];
  correct_option_ids: string[];
  explanation: string;
  is_critical: boolean;
};

type AttemptRow = {
  id: string;
  user_id: string;
  status: string;
  score: number | null;
  passed: boolean | null;
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const left = result[i]!;
    const right = result[j]!;
    result[i] = right;
    result[j] = left;
  }
  return result;
}

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length &&
    [...a].sort().every((value, index) => value === [...b].sort()[index]);
}

async function ownedAttempt(
  attemptId: string,
  userId: string,
): Promise<AttemptRow | undefined> {
  if (!db) return undefined;
  const result = await db.query<AttemptRow>(
    `SELECT id, user_id, status, score, passed
     FROM exam_attempts
     WHERE id = $1 AND user_id = $2`,
    [attemptId, userId],
  );
  return result.rows[0];
}

export async function registerExamRoutes(app: FastifyInstance) {
  // Démarrer une nouvelle tentative.
  app.post(
    "/exams/start",
    { preHandler: requireRole("learner") },
    async (request, reply) => {
      if (!db || !request.authUser) {
        return reply.code(503).send({ message: "Service indisponible." });
      }

      const client: PoolClient = await db.connect();
      try {
        const bank = await client.query<ExamQuestionRow>(
          `SELECT q.id, q.question_text, q.answer_options,
                  q.correct_option_ids, q.explanation, q.is_critical
           FROM questions q
           JOIN modules m ON m.id = q.module_id
           WHERE q.publication_status = 'published'
             AND m.publication_status = 'published'
           ORDER BY random()
           LIMIT $1`,
          [EXAM_SIZE],
        );

        if (bank.rows.length < EXAM_SIZE) {
          return reply.code(409).send({
            error: "question_bank_insufficient",
            message:
              "L'examen nécessite 20 questions publiées dans des modules publiés.",
            available: bank.rows.length,
            required: EXAM_SIZE,
          });
        }

        await client.query("BEGIN");
        const attemptId = randomUUID();

        await client.query(
          `INSERT INTO exam_attempts (id, user_id, status)
           VALUES ($1, $2, 'in_progress')`,
          [attemptId, request.authUser.id],
        );

        for (const question of bank.rows) {
          await client.query(
            `INSERT INTO exam_attempt_answers
               (id, attempt_id, question_id, selected_option_ids, is_critical)
             VALUES ($1, $2, $3, '[]'::jsonb, $4)`,
            [randomUUID(), attemptId, question.id, question.is_critical],
          );
        }

        await client.query("COMMIT");

        return reply.code(201).send({
          attemptId,
          totalQuestions: EXAM_SIZE,
          questions: shuffle(bank.rows).map((q, index) => ({
            number: index + 1,
            id: q.id,
            text: q.question_text,
            options: shuffle(q.answer_options),
          })),
        });
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        request.log.error({ err: error }, "Unable to start exam");
        return reply.code(500).send({ message: "Impossible de démarrer l'examen." });
      } finally {
        client.release();
      }
    },
  );

  // Enregistrer ou modifier la réponse à une question.
  app.put<{
    Params: { attemptId: string };
    Body: { questionId: string; selectedOptionIds: string[] };
  }>(
    "/exams/:attemptId/answers",
    {
      preHandler: requireRole("learner"),
      schema: {
        params: {
          type: "object",
          required: ["attemptId"],
          properties: { attemptId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["questionId", "selectedOptionIds"],
          additionalProperties: false,
          properties: {
            questionId: { type: "string", format: "uuid" },
            selectedOptionIds: {
              type: "array",
              maxItems: 10,
              uniqueItems: true,
              items: { type: "string", minLength: 1, maxLength: 20 },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db || !request.authUser) {
        return reply.code(503).send({ message: "Service indisponible." });
      }

      const { attemptId } = request.params;
      const { questionId, selectedOptionIds } = request.body;

      try {
        const attempt = await ownedAttempt(attemptId, request.authUser.id);
        if (!attempt) return reply.code(404).send({ message: "Tentative introuvable." });
        if (attempt.status !== "in_progress") {
          return reply.code(409).send({ message: "Cette tentative est déjà terminée." });
        }

        const question = await db.query<{
          answer_options: Option[];
        }>(
          `SELECT q.answer_options
           FROM exam_attempt_answers a
           JOIN questions q ON q.id = a.question_id
           WHERE a.attempt_id = $1 AND a.question_id = $2`,
          [attemptId, questionId],
        );

        if (!question.rows[0]) {
          return reply.code(400).send({ message: "Question non associée à cette tentative." });
        }

        const allowed = new Set(
          question.rows[0].answer_options.map((option) => option.id),
        );

        if (selectedOptionIds.some((id) => !allowed.has(id))) {
          return reply.code(400).send({ message: "Choix de réponse invalide." });
        }

        await db.query(
          `UPDATE exam_attempt_answers
           SET selected_option_ids = $1::jsonb
           WHERE attempt_id = $2 AND question_id = $3`,
          [JSON.stringify(selectedOptionIds), attemptId, questionId],
        );

        return { status: "saved" };
      } catch (error) {
        request.log.error({ err: error }, "Unable to save exam answer");
        return reply.code(500).send({ message: "Impossible d'enregistrer la réponse." });
      }
    },
  );

  // Soumettre, corriger et clôturer la tentative.
  app.post<{ Params: { attemptId: string } }>(
    "/exams/:attemptId/submit",
    {
      preHandler: requireRole("learner"),
      schema: {
        params: {
          type: "object",
          required: ["attemptId"],
          properties: { attemptId: { type: "string", format: "uuid" } },
        },
      },
    },
    async (request, reply) => {
      if (!db || !request.authUser) {
        return reply.code(503).send({ message: "Service indisponible." });
      }

      const client = await db.connect();
      try {
        await client.query("BEGIN");

        const locked = await client.query<AttemptRow>(
          `SELECT id, user_id, status, score, passed
           FROM exam_attempts
           WHERE id = $1 AND user_id = $2
           FOR UPDATE`,
          [request.params.attemptId, request.authUser.id],
        );

        const attempt = locked.rows[0];
        if (!attempt) {
          await client.query("ROLLBACK");
          return reply.code(404).send({ message: "Tentative introuvable." });
        }
        if (attempt.status !== "in_progress") {
          await client.query("ROLLBACK");
          return reply.code(409).send({ message: "Cette tentative est déjà terminée." });
        }

        const answers = await client.query<{
          question_id: string;
          question_text: string;
          selected_option_ids: string[];
          correct_option_ids: string[];
          answer_options: Option[];
          explanation: string;
          is_critical: boolean;
        }>(
          `SELECT a.question_id, a.selected_option_ids,
                  a.is_critical, q.question_text, q.correct_option_ids,
                  q.answer_options, q.explanation
           FROM exam_attempt_answers a
           JOIN questions q ON q.id = a.question_id
           WHERE a.attempt_id = $1
           FOR UPDATE OF a`,
          [attempt.id],
        );

        if (answers.rows.length !== EXAM_SIZE) {
          await client.query("ROLLBACK");
          return reply.code(409).send({ message: "La tentative ne contient pas 20 questions." });
        }

        let score = 0;
        let criticalFailure = false;

        for (const answer of answers.rows) {
          const correct = sameIds(
            answer.selected_option_ids,
            answer.correct_option_ids,
          );

          if (correct) score++;
          if (answer.is_critical && !correct) criticalFailure = true;

          await client.query(
            `UPDATE exam_attempt_answers
             SET is_correct = $1
             WHERE attempt_id = $2 AND question_id = $3`,
            [correct, attempt.id, answer.question_id],
          );
        }

        const passed = score >= PASS_SCORE && !criticalFailure;

        await client.query(
          `UPDATE exam_attempts
           SET score = $1, passed = $2, status = 'graded',
               submitted_at = NOW(), graded_at = NOW()
           WHERE id = $3`,
          [score, passed, attempt.id],
        );

        let certificate = null;
        if (passed) {
          const verificationCode = randomUUID();
          const created = await client.query(
            `INSERT INTO certificates
               (id, user_id, attempt_id, verification_code, issued_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (attempt_id) DO NOTHING
             RETURNING verification_code`,
            [randomUUID(), attempt.user_id, attempt.id, verificationCode],
          );
          certificate = created.rows[0]?.verification_code ?? null;
        }

        await client.query("COMMIT");

        // Les corrections ne sont renvoyées qu'après la soumission complète.
        return {
          attemptId: attempt.id,
          score,
          total: EXAM_SIZE,
          passed,
          criticalFailure,
          message: passed
            ? "Félicitations, examen réussi."
            : criticalFailure
              ? "Échec : au moins une question critique a été ratée."
              : "Examen non réussi. Vous pourrez retenter l'examen.",
          certificateVerificationCode: certificate,
          corrections: answers.rows.map((answer) => ({
            questionId: answer.question_id,
            question: answer.question_text,
            selectedOptionIds: answer.selected_option_ids,
            correctOptionIds: answer.correct_option_ids,
            explanation: answer.explanation,
            isCritical: answer.is_critical,
            correct: sameIds(
              answer.selected_option_ids,
              answer.correct_option_ids,
            ),
          })),
        };
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        request.log.error({ err: error }, "Unable to submit exam");
        return reply.code(500).send({ message: "Impossible de corriger l'examen." });
      } finally {
        client.release();
      }
    },
  );

  // Vérification publique d'un certificat par son code.
  app.get<{ Params: { code: string } }>(
    "/certificates/verify/:code",
    {
      schema: {
        params: {
          type: "object",
          required: ["code"],
          properties: { code: { type: "string", format: "uuid" } },
        },
      },
    },
    async (request, reply) => {
      if (!db) return reply.code(503).send({ message: "Service indisponible." });

      const result = await db.query<{
        full_name: string;
        employee_code: string;
        score: number;
        issued_at: Date;
        revoked_at: Date | null;
      }>(
        `SELECT u.full_name, u.employee_code, a.score,
                c.issued_at, c.revoked_at
         FROM certificates c
         JOIN users u ON u.id = c.user_id
         JOIN exam_attempts a ON a.id = c.attempt_id
         WHERE c.verification_code = $1`,
        [request.params.code],
      );

      const certificate = result.rows[0];
      if (!certificate) {
        return reply.code(404).send({ valid: false, message: "Certificat introuvable." });
      }

      return {
        valid: certificate.revoked_at === null,
        fullName: certificate.full_name,
        employeeCode: certificate.employee_code,
        score: certificate.score,
        issuedAt: certificate.issued_at,
        revoked: certificate.revoked_at !== null,
      };
    },
  );
}

