import type { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, refreshSchema, registerSchema } from "./auth-schemas.js";
import { makeAuthService } from "./auth-service-factory.js";
import { AppError } from "@/utils/app-error.js";

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = registerSchema.parse(request.body);
    try {
      const user = await makeAuthService(request.server).register({ name, email, password });
      return reply.status(201).send(user);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);
    try {
      const tokens = await makeAuthService(request.server).login({ email, password });
      return reply.status(200).send(tokens);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = refreshSchema.parse(request.body);
    try {
      let payload: { sub: string; email: string };
      try {
        payload = request.server.jwt.verify<{ sub: string; email: string }>(refreshToken);
      } catch {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const tokens = await makeAuthService(request.server).refresh(payload.sub, refreshToken);
      return reply.status(200).send(tokens);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await makeAuthService(request.server).logout(request.user.sub);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }
}