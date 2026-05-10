import type {LoginDto, RegisterDto, UsersRepository } from "@/@types/auth-interfaces.js";
import type { User } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/app-error.js";
import { generateTokens, hashPassword, validatePassword } from "@/utils/auth-helper.js";
import type { FastifyInstance } from "fastify";

export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private app: FastifyInstance         
  ) {}

  async register({ name, email, password }: RegisterDto) {
    const existingEmail = await this.usersRepository.findUserByEmail(email);
    if (existingEmail) throw new AppError("Email already exists!", 409);

    const passwordHash = await hashPassword(password);
    const user = await this.usersRepository.createUser({ name, email, passwordHash });
    return user;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) throw new AppError("Invalid Credentials!", 401);

    const validPassword = await validatePassword(password, user.passwordHash);
    if (!validPassword) throw new AppError("Invalid Credentials!", 401);

    const { accessToken, refreshToken } = generateTokens(this.app, {
      sub: user.id,
      email: user.email,
    });

    const hashedRefresh = await hashPassword(refreshToken);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, incomingRefreshToken: string) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user || !user.refreshToken) throw new AppError("Unauthorized", 401);

    const valid = await validatePassword(incomingRefreshToken, user.refreshToken);
    if (!valid) throw new AppError("Unauthorized", 401);

    const { accessToken, refreshToken } = generateTokens(this.app, {
      sub: user.id,
      email: user.email,
    });

    const hashedRefresh = await hashPassword(refreshToken);
    await this.usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersRepository.updateRefreshToken(userId, null);
  }
}