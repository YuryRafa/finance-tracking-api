import type { CreateUserDto, AuthRepositoryInterface } from "../../@types/auth-interfaces.js";
import { prisma } from "../../config/prisma.js";
import type { User } from "../../generated/prisma/client.js";


export class AuthRepository implements AuthRepositoryInterface {
  async createUser(data: CreateUserDto): Promise<User> {
    return prisma.user.create({ data });
  }
 
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
 
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await prisma.user.update({ where: { id }, data: { refreshToken: token } });
  }
 

}