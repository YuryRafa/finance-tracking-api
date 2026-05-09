import type { Prisma, User } from '../generated/prisma/client.js';

export interface UsersRepository {
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  //saveRefreshToken(userId: string, token: string): Promise<void>;
  //clearRefreshToken(userId: string): Promise<void>;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}