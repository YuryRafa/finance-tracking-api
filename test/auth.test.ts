import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../src/modules/auth/auth-service.js";
import { InMemoryUsersRepository } from "../src/modules/auth/in-memory-auth-repository.js";
import { AppError } from "../src/utils/app-error.js";
import type { FastifyInstance } from "fastify";
import "@fastify/jwt";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockApp = {
  jwt: {
    sign: vi.fn().mockReturnValue("mocked-token"),
  },
} as unknown as FastifyInstance;

function makeAuthService() {
  const usersRepository = new InMemoryUsersRepository();
  const authService = new AuthService(usersRepository, mockApp);
  return { authService, usersRepository };
}

const defaultRegisterDto = {
  name: "John Doe",
  email: "john@example.com",
  password: "secret123",
};

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

describe("AuthService - register", () => {
  let authService: AuthService;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    ({ authService, usersRepository } = makeAuthService());
  });

  it("should register a new user and return it", async () => {
    const user = await authService.register(defaultRegisterDto);

    expect(user).toMatchObject({
      name: defaultRegisterDto.name,
      email: defaultRegisterDto.email,
    });
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("should store the user in the repository", async () => {
    await authService.register(defaultRegisterDto);

    expect(usersRepository.users).toHaveLength(1);
    expect(usersRepository.users[0].email).toBe(defaultRegisterDto.email);
  });

  it("should hash the password before storing it", async () => {
    await authService.register(defaultRegisterDto);

    const stored = usersRepository.users[0];
    expect(stored.passwordHash).not.toBe(defaultRegisterDto.password);
    expect(stored.passwordHash.length).toBeGreaterThan(0);
  });

  it("should throw AppError 409 when email is already registered", async () => {
    await authService.register(defaultRegisterDto);

    await expect(authService.register(defaultRegisterDto)).rejects.toThrow(
      new AppError("Email already exists!", 409)
    );
  });

  it("should allow registering multiple users with different emails", async () => {
    await authService.register(defaultRegisterDto);
    await authService.register({ ...defaultRegisterDto, email: "jane@example.com", name: "Jane" });

    expect(usersRepository.users).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

describe("AuthService - login", () => {
  let authService: AuthService;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(async () => {
    ({ authService, usersRepository } = makeAuthService());
    await authService.register(defaultRegisterDto);
  });

  it("should return accessToken and refreshToken on valid credentials", async () => {
    const tokens = await authService.login({
      email: defaultRegisterDto.email,
      password: defaultRegisterDto.password,
    });

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
    expect(mockApp.jwt.sign).toHaveBeenCalledTimes(2); // access + refresh
  });

  it("should persist a hashed refresh token in the repository", async () => {
    await authService.login({
      email: defaultRegisterDto.email,
      password: defaultRegisterDto.password,
    });

    const stored = usersRepository.users[0];
    expect(stored.refreshToken).not.toBeNull();
    expect(stored.refreshToken).not.toBe("mocked-token"); // must be hashed
  });

  it("should throw AppError 401 when email does not exist", async () => {
    await expect(
      authService.login({ email: "unknown@example.com", password: "any" })
    ).rejects.toThrow(new AppError("Invalid Credentials!", 401));
  });

  it("should throw AppError 401 when password is wrong", async () => {
    await expect(
      authService.login({ email: defaultRegisterDto.email, password: "wrongpassword" })
    ).rejects.toThrow(new AppError("Invalid Credentials!", 401));
  });

  it("should be case-sensitive for email lookup", async () => {
    await expect(
      authService.login({
        email: defaultRegisterDto.email.toUpperCase(),
        password: defaultRegisterDto.password,
      })
    ).rejects.toThrow(new AppError("Invalid Credentials!", 401));
  });
});

// ---------------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------------

describe("AuthService - refresh", () => {
  let authService: AuthService;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(async () => {
    ({ authService, usersRepository } = makeAuthService());
    await authService.register(defaultRegisterDto);
  });

  it("should return new tokens when refresh token is valid", async () => {
    // login stores the hashed version of "mocked-token"
    await authService.login({ email: defaultRegisterDto.email, password: defaultRegisterDto.password });

    const userId = usersRepository.users[0].id;
    const tokens = await authService.refresh(userId, "mocked-token");

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
  });

  it("should rotate the refresh token in the repository", async () => {
    await authService.login({ email: defaultRegisterDto.email, password: defaultRegisterDto.password });

    const userId = usersRepository.users[0].id;
    const tokenBefore = usersRepository.users[0].refreshToken;

    await authService.refresh(userId, "mocked-token");

    const tokenAfter = usersRepository.users[0].refreshToken;
    expect(tokenAfter).not.toBe(tokenBefore);
  });

  it("should throw AppError 401 when user does not exist", async () => {
    await expect(authService.refresh("non-existent-id", "mocked-token")).rejects.toThrow(
      new AppError("Unauthorized", 401)
    );
  });

  it("should throw AppError 401 when refresh token is invalid", async () => {
    await authService.login({ email: defaultRegisterDto.email, password: defaultRegisterDto.password });

    const userId = usersRepository.users[0].id;
    await expect(authService.refresh(userId, "wrong-token")).rejects.toThrow(
      new AppError("Unauthorized", 401)
    );
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

describe("AuthService - logout", () => {
  let authService: AuthService;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(async () => {
    ({ authService, usersRepository } = makeAuthService());
    await authService.register(defaultRegisterDto);
    await authService.login({ email: defaultRegisterDto.email, password: defaultRegisterDto.password });
  });

  it("should clear the refresh token from the repository", async () => {
    const userId = usersRepository.users[0].id;
    expect(usersRepository.users[0].refreshToken).not.toBeNull();

    await authService.logout(userId);

    expect(usersRepository.users[0].refreshToken).toBeNull();
  });
});