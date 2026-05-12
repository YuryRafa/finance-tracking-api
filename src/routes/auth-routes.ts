import type { FastifyInstance } from "fastify";
import { AuthController } from "@/modules/auth/auth-controller.js";
import { registerOpenApi, loginOpenApi, refreshOpenApi, logoutOpenApi } from "@/modules/auth/auth-schemas.js";
import { verifyJwt } from "@/middlewares/verify-middleware.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", { schema: registerOpenApi }, authController.register.bind(authController));
  app.post("/login", { schema: loginOpenApi }, authController.login.bind(authController));
  app.post("/refresh", { schema: refreshOpenApi }, authController.refresh.bind(authController));
  app.post("/logout", { schema: logoutOpenApi, preHandler: [verifyJwt] }, authController.logout.bind(authController));
}

