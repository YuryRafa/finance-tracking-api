import type { User } from '../generated/prisma/client.js';

export interface CreateUserDto {
  name: string;
  email: string;
  passwordHash: string; 
}

export interface AuthRepositoryInterface {
  createUser(data: CreateUserDto): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
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
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export interface TokenGenerator {
  generateTokens(payload: Omit<JwtPayload, 'name'>): AuthTokens;
}