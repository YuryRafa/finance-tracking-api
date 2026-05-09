import type { FastifyInstance } from "fastify";
import { AuthController } from '../modules/auth/auth-controller.js';

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
    app.post('/register', authController.register);
    app.post('/login', authController.login);
};