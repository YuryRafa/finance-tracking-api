import type { LoginDto, RegisterDto, AuthRepositoryInterface, TokenGenerator } from '@/@types/auth-interfaces.js';
import type { User } from '@/generated/prisma/client.js';
import { AppError } from '@/utils/app-error.js';
import { hashPassword, validatePassword } from '@/utils/auth-helper.js';

export class AuthService {
  constructor(
    private authRepository: AuthRepositoryInterface,
    private tokenGenerator: TokenGenerator
  ) {}

  async register({ name, email, password }: RegisterDto): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    const existingEmail = await this.authRepository.findUserByEmail(email);
    if (existingEmail) throw new AppError('Email already exists!', 409);
    const passwordHash = await hashPassword(password);
    const { passwordHash: _, refreshToken: __, ...safeUser } =
      await this.authRepository.createUser({ name, email, passwordHash });
    return safeUser;
  }

  async login({ email, password }: LoginDto) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new AppError('Invalid Credentials!', 401);
    const validPassword = await validatePassword(password, user.passwordHash);
    if (!validPassword) throw new AppError('Invalid Credentials!', 401);

    const { accessToken, refreshToken } = this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
    });
    const hashedRefresh = await hashPassword(refreshToken);
    await this.authRepository.updateRefreshToken(user.id, hashedRefresh);
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, incomingRefreshToken: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user || !user.refreshToken) throw new AppError('Unauthorized', 401);

    const valid = await validatePassword(incomingRefreshToken, user.refreshToken);
    if (!valid) {
      // possible token theft/replay - kill the session entirely, force re-login
      await this.authRepository.updateRefreshToken(userId, null);
      throw new AppError('Unauthorized', 401);
    }

    const { accessToken, refreshToken } = this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
    });
    const hashedRefresh = await hashPassword(refreshToken);
    await this.authRepository.updateRefreshToken(user.id, hashedRefresh);
    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.authRepository.updateRefreshToken(userId, null);
  }
}