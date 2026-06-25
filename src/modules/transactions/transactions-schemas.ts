import { z } from 'zod';
import { TransactionType } from '@/generated/prisma/client.js';

export const createTransactionSchema = z.object({
    title: z.string(),
    amount: z.number().positive(),
    type: z.enum(TransactionType),
});

export const updateTransactionSchema = z.object({
  title:  z.string().optional(),
  amount: z.number().positive().optional(),
  type:   z.enum(TransactionType).optional(),
}).refine(
  (data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined),
  { message: 'At least one field must be provided' }
)


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

export const getSummaryOpenApi = {
    tags: ['Transactions'],
    summary: 'Get summary of transactions for the authenticated user',
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: 'Summary of transactions',
            type: 'object',
            properties: {
                income: { type: 'number' },
                expense: { type: 'number' },
                balance: { type: 'number' },
            },
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
        500: {
            description: 'Internal server error',
            type: 'object',
            properties: { message: { type: 'string' } },
        },
    },
};

export const updateTransactionOpenApi = {
    tags: ['Transactions'],
    summary: 'Update a transaction by ID',
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
    body: {
        type: 'object',
        properties: {
            title:  { type: 'string' },
            amount: { type: 'number' },
            type:   { type: 'string', enum: ['INCOME', 'EXPENSE'] },
        },
    },
    response: {
        200: {
            description: 'Transaction updated successfully',
            type: 'object',
            properties: {
                id:        { type: 'string' },
                title:     { type: 'string' },
                amount:    { type: 'number' },
                type:      { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                userId:    { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
        400: {
            description: 'No fields provided',
            type: 'object',
            properties: { message: { type: 'string' } },
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