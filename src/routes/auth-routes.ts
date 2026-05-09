import type { FastifyInstance } from "fastify";
import { AuthController } from '../modules/auth/auth-controller.js';

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
    app.post('/auth/register', authController.register);
    app.post('/auth/login', authController.login);
};