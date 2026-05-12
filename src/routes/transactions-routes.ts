import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { TransactionsController } from '@/modules/transactions/transactions-controller.js';
import { verifyJwt } from '@/middlewares/verify-middleware.js';
import { createTransactionOpenApi, getTransactionByIdOpenApi, listTransactionsOpenApi, removeTransactionOpenApi } from '@/modules/transactions/transactions-schemas.js';

const transactionsController = new TransactionsController();

export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/create', { preHandler: [verifyJwt], schema: createTransactionOpenApi }, transactionsController.createTransaction.bind(transactionsController));
    app.get('/list', { preHandler: [verifyJwt], schema: listTransactionsOpenApi }, transactionsController.getTransactions.bind(transactionsController));
    app.get('/:id', { preHandler: [verifyJwt], schema: getTransactionByIdOpenApi }, transactionsController.getTransactionById.bind(transactionsController));
    app.delete('/remove/:id', { preHandler: [verifyJwt], schema: removeTransactionOpenApi }, transactionsController.removeTransaction.bind(transactionsController));
}

