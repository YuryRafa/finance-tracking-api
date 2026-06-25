import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});


export const registerOpenApi = {
  tags: ['Auth'],
  summary: 'Register a new user',
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name:     { type: 'string', minLength: 2 },
      email:    { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
    },
  },
  response: {
    201: {
      description: 'User created',
      type: 'object',
      properties: {
        id:        { type: 'string' },
        name:      { type: 'string' },
        email:     { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    409: {
      description: 'Email already exists',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
};

export const loginOpenApi = {
  tags: ['Auth'],
  summary: 'Login and receive tokens',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email:    { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  response: {
    200: {
      description: 'Access and refresh tokens',
      type: 'object',
      properties: {
        accessToken:  { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    401: {
      description: 'Invalid credentials',
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
};

export const refreshOpenApi = {
  tags: ['Auth'],
  summary: 'Refresh access token',
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        accessToken:  { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    401: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
};

export const logoutOpenApi = {
  tags: ['Auth'],
  summary: 'Logout (invalidate refresh token)',
  security: [{ bearerAuth: [] }],
  response: {
    204: { description: 'Logged out successfully', type: 'null' },
    401: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
};