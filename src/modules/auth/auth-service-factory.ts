import type { FastifyInstance } from "fastify";
import { AuthRepository } from "./auth-repository.js";
import { AuthService } from "./auth-service.js";

export function makeAuthService(app: FastifyInstance) {
  const authRepository = new AuthRepository();
  return new AuthService(authRepository, app);
}