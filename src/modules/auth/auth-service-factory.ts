import type { FastifyInstance } from 'fastify';
import type { TokenGenerator } from '@/@types/auth-interfaces.js';
import { generateTokens } from '@/utils/auth-helper.js';
import { AuthRepository } from './auth-repository.js';
import { AuthService } from './auth-service.js';

export function makeAuthService(app: FastifyInstance) {
  const authRepository = new AuthRepository();
  const tokenGenerator: TokenGenerator = {
    generateTokens: (payload) => generateTokens(app, payload),
  };
  return new AuthService(authRepository, tokenGenerator);
}