import { z } from 'zod';
import { TransactionType } from '@/generated/prisma/client.js';

export const createTransactionSchema = z.object({
    title: z.string(),
    amount: z.number().positive(),
    type: z.enum(TransactionType),
});

export const createTransactionOpenApi = {
    tags: ['Transactions'],
    summary: 'Create a new transaction',
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['title', 'amount', 'type'],
        properties: {
            title: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
        },
    },
    response: {
        201: {
            description: 'Transaction created successfully',
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                amount: { type: 'number' },
                type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                userId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
    },
};

export const listTransactionsOpenApi = {
    tags: ['Transactions'],
    summary: 'List all transactions for the authenticated user',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: 'List of transactions',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    amount: { type: 'number' },
                    type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                    userId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
    },
};

export const getTransactionByIdOpenApi = {
    tags: ['Transactions'],
    summary: 'Get a transaction by ID',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
    response: {
        200: {
            description: 'Transaction found',
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                amount: { type: 'number' },
                type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                userId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
        404: {
            description: 'Transaction not found',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
    },
};

export const removeTransactionOpenApi = {
    tags: ['Transactions'],
    summary: 'Remove a transaction by ID',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
    response: {
        204: {
            description: 'Transaction removed successfully',
            type: 'null',
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
        404: {
            description: 'Transaction not found',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
    },
};