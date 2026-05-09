import type { FastifyReply, FastifyRequest } from "fastify";
import {loginSchema, refreshSchema, registerSchema} from './auth-schemas.js'
import { makeAuthService } from "./auth-service-factory.js";
import { AppError } from "../../utils/app-error.js";

const authService = makeAuthService();

export class AuthController {

    async register(request: FastifyRequest, reply: FastifyReply) {

        const { name, email, password } = registerSchema.parse(request.body);


        try {

            const user = await authService.register({ name, email, password });
            const { passwordHash: _, ...userWithoutPassword } = user
            return reply.status(201).send(userWithoutPassword);


        } catch (error) {
            if (error instanceof AppError) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            throw error;

        }


    };

    async login(request: FastifyRequest, reply: FastifyReply) {

        const { email, password } = loginSchema.parse(request.body);


        try {
            const user = await authService.login({ email, password });
            const { passwordHash: _, ...userWithoutPassword } = user
            return reply.status(201).send(userWithoutPassword);


        } catch (error) {
            if (error instanceof AppError) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            throw error;

        }

    }
}