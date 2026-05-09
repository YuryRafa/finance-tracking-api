import { AuthRepository } from "./auth-repository.js";
import { AuthService } from "./auth-service.js";

export function makeAuthService() {
    const authRepository = new AuthRepository();
    const authService = new AuthService(authRepository);

    return authService

}