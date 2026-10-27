import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import { checkDatabase } from "./db.js";
import { registerAuthRoutes } from "./auth.js";
import {
  registerAuthorization,
  registerProtectedRoutes,
} from "./authorization.js";
import { registerModuleRoutes } from "./modules.js";
import { registerExamRoutes } from "./exams.js";
import { registerQuestionRoutes } from "./questions.js";

const app = Fastify({
  logger: true,
});

// Autoriser uniquement le frontend local pendant le développement.
await app.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
});

await app.register(cookie);

await app.register(rateLimit, {
  global: false,
});

// Enregistrement des routes d'authentification et de sécurité
await registerAuthRoutes(app);
registerAuthorization(app);
await registerProtectedRoutes(app);

// Enregistrement des routes des modules de formation
await registerModuleRoutes(app);
await registerExamRoutes(app);
await registerQuestionRoutes(app);

// Vérification générale de l'API
app.get("/health", async () => ({
  status: "ok",
  application: "COMTESSE Academy API",
  environment: process.env.NODE_ENV ?? "development",
}));

// Vérification de la connexion à la base de données
app.get("/health/database", async (_request, reply) => {
  try {
    const connected = await checkDatabase();

    if (!connected) {
      return reply.code(503).send({
        status: "unavailable",
        database: "not_configured",
      });
    }

    return {
      status: "ok",
      database: "connected",
    };
  } catch (error) {
    app.log.error(
      { err: error },
      "Database health check failed",
    );

    return reply.code(503).send({
      status: "unavailable",
      database: "connection_failed",
    });
  }
});

// Démarrage du serveur
const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({
    port,
    host: "127.0.0.1",
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
