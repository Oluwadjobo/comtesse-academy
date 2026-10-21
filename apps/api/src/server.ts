import {
  registerAuthorization,
  registerProtectedRoutes,
} from "./authorization.js";
import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { checkDatabase } from "./db.js";
import { registerAuthRoutes } from "./auth.js";

const app = Fastify({
  logger: true,
});

await app.register(cookie);

await app.register(rateLimit, {
  global: false,
});

await registerAuthRoutes(app);
registerAuthorization(app);
await registerProtectedRoutes(app);

app.get("/health", async () => ({
  status: "ok",
  application: "COMTESSE Academy API",
  environment: process.env.NODE_ENV ?? "development",
}));

app.get("/health/database", async (_request, reply) => {
  try {
    const connected = await checkDatabase();

    if (!connected) {
      return reply.code(503).send({
        status: "unavailable",
        database: "not_configured",
      });
    }

    return { status: "ok", database: "connected" };
  } catch (error) {
    app.log.error({ err: error }, "Database health check failed");

    return reply.code(503).send({
      status: "unavailable",
      database: "connection_failed",
    });
  }
});

const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ port, host: "127.0.0.1" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
