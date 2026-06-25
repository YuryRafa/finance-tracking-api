import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

async function jwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: "20m" },
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_REFRESH_SECRET!,
    namespace: "refresh",
    sign: { expiresIn: "7d" },
  });
}

export default fp(jwtPlugin);