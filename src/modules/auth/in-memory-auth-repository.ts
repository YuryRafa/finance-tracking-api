import type { AuthRepositoryInterface } from "../../@types/auth-interfaces.js";
import type { Prisma, User } from "../../generated/prisma/client.js";

export class InMemoryAuthRepository implements AuthRepositoryInterface {
  public users: User[] = [];

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash as string,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.refreshToken = token;
  }
}