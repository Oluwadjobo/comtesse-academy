import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import { db } from "./db.js";

const COOKIE_NAME = "comtesse_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

interface LoginBody {
  employeeCode: string;
  secret: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_DURATION_MS / 1000,
  };
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["employeeCode", "secret"],
          additionalProperties: false,
          properties: {
            employeeCode: { type: "string", minLength: 1, maxLength: 100 },
            secret: { type: "string", minLength: 1, maxLength: 200 },
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

      const employeeCode = request.body.employeeCode.trim();
      const secret = request.body.secret;

      const result = await db.query<{
        id: string;
        employee_code: string;
        full_name: string;
        password_hash: string;
        role: "learner" | "manager" | "admin";
        is_active: boolean;
      }>(
        `SELECT id, employee_code, full_name, password_hash, role, is_active
         FROM users
         WHERE employee_code = $1
         LIMIT 1`,
        [employeeCode],
      );

      const user = result.rows[0];

      if (
        !user ||
        !user.is_active ||
        !(await argon2.verify(user.password_hash, secret).catch(() => false))
      ) {
        return reply.code(401).send({
          error: "invalid_credentials",
          message: "Identifiant ou code secret incorrect.",
        });
      }

      const token = randomBytes(32).toString("base64url");
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await db.query(
        `INSERT INTO sessions (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt],
      );

      return reply
        .setCookie(COOKIE_NAME, token, cookieOptions())
        .send({
          user: {
            id: user.id,
            employeeCode: user.employee_code,
            fullName: user.full_name,
            role: user.role,
          },
          expiresAt: expiresAt.toISOString(),
        });
    },
  );

  app.post("/auth/logout", async (request, reply) => {
    const token = request.cookies?.[COOKIE_NAME];

    if (db && token) {
      await db.query(
        "DELETE FROM sessions WHERE token_hash = $1",
        [hashToken(token)],
      );
    }

    return reply
      .clearCookie(COOKIE_NAME, cookieOptions())
      .code(200)
      .send({ status: "ok" });
  });

  app.get("/auth/me", async (request, reply) => {
    const token = request.cookies?.[COOKIE_NAME];

    if (!db || !token) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const result = await db.query<{
      id: string;
      employee_code: string;
      full_name: string;
      role: "learner" | "manager" | "admin";
      expires_at: Date;
    }>(
      `SELECT u.id, u.employee_code, u.full_name, u.role, s.expires_at
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
      return reply
        .clearCookie(COOKIE_NAME, cookieOptions())
        .code(401)
        .send({ error: "unauthorized" });
    }

    return {
      user: {
        id: user.id,
        employeeCode: user.employee_code,
        fullName: user.full_name,
        role: user.role,
      },
      expiresAt: user.expires_at,
    };
  });
}
