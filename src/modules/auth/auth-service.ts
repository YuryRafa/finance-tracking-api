import type {LoginDto, RegisterDto, UsersRepository } from "../../@types/auth-interfaces.js";
import type { User } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword, validatePassword } from "../../utils/auth-helper.js";

export class AuthService {
    constructor(private usersRepository: UsersRepository) { }

    async register({ name, email, password }: RegisterDto) {
        const existingEmail = await this.usersRepository.findUserByEmail(email);

        if (existingEmail) {
            throw new AppError("Email already exists!", 409)
        }

        const passwordHash = await hashPassword(password);

        const user = await this.usersRepository.createUser({ name, email, passwordHash });

        return user;
    }

    async login({ email, password }: LoginDto): Promise<User> {
        const user = await this.usersRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError("Invalid Credentials!", 401);
        };

        const validPassword = await validatePassword(password, user.passwordHash);

        if (!validPassword) {
            throw new AppError("Invalid Credentials!", 401);
        };

        return user;
    }


}