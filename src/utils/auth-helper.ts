import bcrypt from 'bcrypt';
import type { FastifyInstance, } from "fastify";


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
    const accessToken = app.jwt.sign(payload);
    const refreshToken = app.jwt.sign(payload, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}