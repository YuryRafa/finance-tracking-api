// auth-controller.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, refreshSchema, registerSchema } from "./auth-schemas.js";
import { makeAuthService } from "./auth-service-factory.js";
import { AppError } from "../../utils/app-error.js";
import type { AuthService } from "./auth-service.js";

let authService: AuthService;

function getAuthService(request: FastifyRequest) {
  if (!authService) authService = makeAuthService(request.server);
  return authService;
}

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password } = registerSchema.parse(request.body);
    try {
      const user = await getAuthService(request).register({ name, email, password });
      const { passwordHash: _, ...userWithoutPassword } = user;
      return reply.status(201).send(userWithoutPassword);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);
    try {
      const tokens = await getAuthService(request).login({ email, password });
      return reply.status(200).send(tokens);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = refreshSchema.parse(request.body);
    try {
      const payload = request.server.jwt.decode<{ sub: string }>(refreshToken);
      if (!payload?.sub) return reply.status(401).send({ message: "Unauthorized" });

      const tokens = await getAuthService(request).refresh(payload.sub, refreshToken);
      return reply.status(200).send(tokens);
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      throw error;
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      await getAuthService(request).logout((request.user as { sub: string }).sub);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
      return reply.status(401).send({ message: "Unauthorized" });
    }
  }
}