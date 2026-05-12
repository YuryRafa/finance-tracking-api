import { AppError } from "@/utils/app-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (error) {
        throw new AppError("Not Authenticated", 403);
    }
}