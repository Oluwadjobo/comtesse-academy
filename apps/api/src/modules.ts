
import type { FastifyInstance } from "fastify";
import type { QueryResultRow } from "pg";
import { db } from "./db.js";
import { requireAuth, requireRole } from "./authorization.js";

type PublicationStatus = "draft" | "approved" | "published";

interface ModuleRow extends QueryResultRow {
  module_number: number;
  title: string;
  description: string;
  publication_status: PublicationStatus;
}

interface ModuleParams {
  moduleNumber: string;
}

interface PublicationBody {
  publicationStatus: "draft" | "published";
}

const MODULE_SELECT = `
  SELECT module_number, title, description, publication_status
  FROM modules
`;

function isLearner(role: string | undefined): boolean {
  return role === "learner";
}

function isValidModuleNumber(value: string): boolean {
  return /^[1-6]$/.test(value);
}

export async function registerModuleRoutes(
  app: FastifyInstance,
): Promise<void> {
  // Catalogue des modules.
  app.get(
    "/modules",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Service momentanément indisponible.",
        });
      }

      try {
        const result = isLearner(request.authUser?.role)
          ? await db.query<ModuleRow>(
              `${MODULE_SELECT}
               WHERE publication_status = 'published'
               ORDER BY module_number ASC`,
            )
          : await db.query<ModuleRow>(
              `${MODULE_SELECT}
               ORDER BY module_number ASC`,
            );

        return { modules: result.rows };
      } catch (error) {
        request.log.error({ err: error }, "Failed to fetch modules");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de charger les modules.",
        });
      }
    },
  );

  // Détail d'un module.
  app.get<{ Params: ModuleParams }>(
    "/modules/:moduleNumber",
    {
      preHandler: requireAuth,
      schema: {
        params: {
          type: "object",
          required: ["moduleNumber"],
          additionalProperties: false,
          properties: {
            moduleNumber: {
              type: "string",
              pattern: "^[1-6]$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Service momentanément indisponible.",
        });
      }

      const { moduleNumber } = request.params;

      if (!isValidModuleNumber(moduleNumber)) {
        return reply.code(400).send({
          error: "invalid_module_number",
          message: "Le numéro du module doit être compris entre 1 et 6.",
        });
      }

      try {
        const learner = isLearner(request.authUser?.role);
        const result = await db.query<ModuleRow>(
          `${MODULE_SELECT}
           WHERE module_number = $1
             AND ($2::boolean = FALSE OR publication_status = 'published')
           LIMIT 1`,
          [Number(moduleNumber), learner],
        );

        const module = result.rows[0];

        if (!module) {
          return reply.code(404).send({
            error: "module_not_found",
            message: "Module introuvable ou non disponible.",
          });
        }

        return { module };
      } catch (error) {
        request.log.error({ err: error }, "Failed to fetch module");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de charger ce module.",
        });
      }
    },
  );

  // Approbation d'un module : responsables et administrateurs.
  app.patch<{ Params: ModuleParams }>(
    "/modules/:moduleNumber/approval",
    {
      preHandler: requireRole("manager", "admin"),
      schema: {
        params: {
          type: "object",
          required: ["moduleNumber"],
          additionalProperties: false,
          properties: {
            moduleNumber: {
              type: "string",
              pattern: "^[1-6]$",
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Service momentanément indisponible.",
        });
      }

      const { moduleNumber } = request.params;
      const actor = request.authUser;

      if (!isValidModuleNumber(moduleNumber)) {
        return reply.code(400).send({
          error: "invalid_module_number",
          message: "Le numéro du module doit être compris entre 1 et 6.",
        });
      }

      if (!actor?.id) {
        return reply.code(401).send({
          error: "unauthorized",
          message: "Authentification requise.",
        });
      }

      try {
        const result = await db.query<ModuleRow>(
          `UPDATE modules
           SET publication_status = 'approved',
               approved_by = $1,
               approved_at = NOW()
           WHERE module_number = $2
             AND publication_status = 'draft'
           RETURNING module_number, title, description, publication_status`,
          [actor.id, Number(moduleNumber)],
        );

        const module = result.rows[0];

        if (!module) {
          const existing = await db.query(
            "SELECT publication_status FROM modules WHERE module_number = $1",
            [Number(moduleNumber)],
          );

          if (!existing.rowCount) {
            return reply.code(404).send({
              error: "module_not_found",
              message: "Module introuvable.",
            });
          }

          return reply.code(409).send({
            error: "invalid_module_status",
            message: "Seul un module en brouillon peut être approuvé.",
          });
        }

        return {
          message: "Module approuvé avec succès.",
          module,
        };
      } catch (error) {
        request.log.error({ err: error }, "Failed to approve module");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible d'approuver ce module.",
        });
      }
    },
  );

  // Publication et dépublication : responsables et administrateurs.
  app.patch<{
    Params: ModuleParams;
    Body: PublicationBody;
  }>(
    "/modules/:moduleNumber/publication",
    {
      preHandler: requireRole("manager", "admin"),
      schema: {
        params: {
          type: "object",
          required: ["moduleNumber"],
          additionalProperties: false,
          properties: {
            moduleNumber: {
              type: "string",
              pattern: "^[1-6]$",
            },
          },
        },
        body: {
          type: "object",
          required: ["publicationStatus"],
          additionalProperties: false,
          properties: {
            publicationStatus: {
              type: "string",
              enum: ["draft", "published"],
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({
          error: "service_unavailable",
          message: "Service momentanément indisponible.",
        });
      }

      const { moduleNumber } = request.params;
      const { publicationStatus } = request.body;

      if (!isValidModuleNumber(moduleNumber)) {
        return reply.code(400).send({
          error: "invalid_module_number",
          message: "Le numéro du module doit être compris entre 1 et 6.",
        });
      }

      try {
        const result = await db.query<ModuleRow>(
          `UPDATE modules
           SET publication_status = $1
           WHERE module_number = $2
             AND (
               $1 = 'draft'
               OR (
                 publication_status = 'approved'
                 AND approved_by IS NOT NULL
                 AND approved_at IS NOT NULL
               )
             )
           RETURNING module_number, title, description, publication_status`,
          [publicationStatus, Number(moduleNumber)],
        );

        const module = result.rows[0];

        if (!module) {
          const existing = await db.query(
            "SELECT module_number FROM modules WHERE module_number = $1",
            [Number(moduleNumber)],
          );

          if (!existing.rowCount) {
            return reply.code(404).send({
              error: "module_not_found",
              message: "Module introuvable.",
            });
          }

          return reply.code(409).send({
            error: "approval_required",
            message:
              "Le module doit être approuvé et son approbation enregistrée avant sa publication.",
          });
        }

        return {
          message:
            publicationStatus === "published"
              ? "Module publié."
              : "Module remis en brouillon.",
          module,
        };
      } catch (error) {
        request.log.error({ err: error }, "Failed to update module status");
        return reply.code(500).send({
          error: "internal_server_error",
          message: "Impossible de modifier le statut du module.",
        });
      }
    },
  );
}
