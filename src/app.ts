import fastify from 'fastify';
import { authRoutes } from '@/routes/auth-routes.js';

export const app = fastify();


app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`) 
});


app.register(authRoutes, {
    prefix: '/auth'
});


