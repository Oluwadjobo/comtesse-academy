
import type {
  FastifyInstance,
  preHandlerHookHandler,
} from "fastify";
import { createHash } from "node:crypto";
import { db } from "./db.js";

const COOKIE_NAME = "comtesse_session";

export type UserRole = "learner" | "manager" | "admin";

interface AuthenticatedUser {
  id: string;
  employeeCode: string;
  fullName: string;
  role: UserRole;
}

declare module "fastify" {
  interface FastifyRequest {
    authUser: AuthenticatedUser | null;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function registerAuthorization(app: FastifyInstance): void {
  app.decorateRequest("authUser", null);
}

export const requireAuth: preHandlerHookHandler = async (
  request,
  reply,
) => {
  if (!db) {
    return reply.code(503).send({
      error: "service_unavailable",
      message: "Service momentanément indisponible.",
    });
  }

  const token = request.cookies?.[COOKIE_NAME];

  if (!token) {
    return reply.code(401).send({
      error: "unauthorized",
      message: "Connexion requise.",
    });
  }

  const result = await db.query<{
    id: string;
    employee_code: string;
    full_name: string;
    role: UserRole;
  }>(
    `SELECT u.id, u.employee_code, u.full_name, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND u.is_active = TRUE
     LIMIT 1`,
    [hashToken(token)],
  );

  const user = result.rows[0];

  if (!user) {
    return reply.code(401).send({
      error: "unauthorized",
      message: "Session invalide ou expirée.",
    });
  }

  request.authUser = {
    id: user.id,
    employeeCode: user.employee_code,
    fullName: user.full_name,
    role: user.role,
  };
};

export function requireRole(
  ...allowedRoles: UserRole[]
): preHandlerHookHandler {
  return async (request, reply) => {
    // Vérifier la session avant d'évaluer les permissions.
    const token = request.cookies?.[COOKIE_NAME];

    if (!token) {
      return reply.code(401).send({
        error: "unauthorized",
        message: "Connexion requise.",
      });
    }

    if (!db) {
      return reply.code(503).send({
        error: "service_unavailable",
        message: "Service momentanément indisponible.",
      });
    }

    const result = await db.query<{
      id: string;
      employee_code: string;
      full_name: string;
      role: UserRole;
    }>(
      `SELECT u.id, u.employee_code, u.full_name, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > NOW()
         AND u.is_active = TRUE
       LIMIT 1`,
      [hashToken(token)],
    );

    const user = result.rows[0];

    if (!user) {
      return reply.code(401).send({
        error: "unauthorized",
        message: "Session invalide ou expirée.",
      });
    }

    request.authUser = {
      id: user.id,
      employeeCode: user.employee_code,
      fullName: user.full_name,
      role: user.role,
    };

    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        error: "forbidden",
        message: "Vous n'avez pas les droits nécessaires.",
      });
    }
  };
}

export async function registerProtectedRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get(
    "/learner/dashboard",
    { preHandler: requireRole("learner") },
    async (request) => ({
      message: "Accès apprenant autorisé.",
      user: request.authUser,
    }),
  );

  app.get(
    "/manager/dashboard",
    { preHandler: requireRole("manager", "admin") },
    async (request) => ({
      message: "Accès responsable autorisé.",
      user: request.authUser,
    }),
  );

  app.get(
    "/admin/dashboard",
    { preHandler: requireRole("admin") },
    async (request) => ({
      message: "Accès administrateur autorisé.",
      user: request.authUser,
    }),
  );
}
