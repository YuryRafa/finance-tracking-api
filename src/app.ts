import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import jwtPlugin from '@/config/jwt.js';
import { authRoutes } from '@/routes/auth-routes.js';
import { transactionsRoutes } from '@/routes/transactions-routes.js';

export const app = fastify();

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Transactions Tracker API',
      description: 'API documentation',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

await app.register(jwtPlugin);

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`);
});

app.get('/', async () => {
  return { status: 'ok', uptime: process.uptime() };
});

await app.register(authRoutes, { prefix: '/auth' });
await app.register(transactionsRoutes, { prefix: '/transactions' });