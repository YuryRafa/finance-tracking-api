// src/config/jwt.ts
import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";

export async function jwtPlugin(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: "20m" },
  });
}