import bcrypt from 'bcrypt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


export const hashPassword = async (password: string) =>{
    return await bcrypt.hash(password, 6);

}

export const validatePassword = async(password: string, password_hash: string) => {
    return await bcrypt.compare(password, password_hash);
}

export function generateTokens(
    app: FastifyInstance,
    payload: { sub: string; email: string }
    ) {
    const accessToken = app.jwt.sign(payload);                         // 15 min (from plugin config)
    const refreshToken = app.jwt.sign(payload, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}

export async function verifyAccessToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch {
        return reply.status(401).send({ message: "Unauthorized" });
    }
}