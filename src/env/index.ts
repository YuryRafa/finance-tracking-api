import { config } from 'dotenv';
import z from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),
  PORT: z.coerce.number().min(1).max(65535).default(3333),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:');
  console.error(_env.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = _env.data;