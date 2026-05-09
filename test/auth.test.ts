import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../src/modules/auth/auth-service.js";
import { InMemoryUsersRepository } from "../src/modules/auth/in-memory-auth-repository.js";
import { AppError } from "../src/utils/app-error.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAuthService() {
  const usersRepository = new InMemoryUsersRepository();
  const authService = new AuthService(usersRepository);
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

describe("AuthService – register", () => {
  let authService: AuthService;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    ({ authService, usersRepository } = makeAuthService());
  });

  it("should register a new user and return it without passwordHash exposure", async () => {
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

  beforeEach(async () => {
    ({ authService } = makeAuthService());
    // Pre-seed a registered user for login tests
    await authService.register(defaultRegisterDto);
  });

  it("should return the user when credentials are correct", async () => {
    const user = await authService.login({
      email: defaultRegisterDto.email,
      password: defaultRegisterDto.password,
    });

    expect(user).toMatchObject({
      name: defaultRegisterDto.name,
      email: defaultRegisterDto.email,
    });
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