import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env } from '@/env/index.js';
import { authRoutes } from '@/routes/auth-routes.js';

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '15m' },
});

app.addHook('preHandler', async (request, reply) => {
  console.log(`[${request.method}] ${request.url}`);
});

app.register(authRoutes, { prefix: '/auth' });