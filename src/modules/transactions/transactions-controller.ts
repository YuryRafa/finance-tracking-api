import type { FastifyReply, FastifyRequest } from "fastify";
import { makeTransactionsService } from "./transactions-service-factory.js";
import { createTransactionSchema, updateTransactionSchema } from "./transactions-schemas.js";
import { AppError } from "@/utils/app-error.js";

const transactionsService = makeTransactionsService();

export class TransactionsController {
    async createTransaction(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { title, amount, type } = createTransactionSchema.parse(request.body);
            const userId = request.user.sub;
            const transaction = await transactionsService.registerTransaction({ title, amount, type, userId });

            return reply.status(201).send(transaction);
        } catch (error) {
            if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
            throw error;
        }
    }

    async getTransactions(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.sub;
            const transactions = await transactionsService.getTransactions(userId);

            return reply.status(200).send(transactions);
        } catch (error) {
            if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
            throw error;
        }
    }

    async getTransactionById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const userId = request.user.sub;
            const transaction = await transactionsService.getTransactionById(userId, id);

            return reply.status(200).send(transaction);
        } catch (error) {
            if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
            throw error;
        }
    }

    async removeTransaction(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const userId = request.user.sub;

            await transactionsService.removeTransaction(id, userId);

            return reply.status(204).send();
        } catch (error) {
            if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
            throw error;
        }
    }

    async updateTransaction(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const data = updateTransactionSchema.parse(request.body);
            const userId = request.user.sub;
            const transaction = await transactionsService.updateTransaction(id, userId, data);
            return reply.status(200).send(transaction);
        } catch (error) {
            if (error instanceof AppError)
            return reply.status(error.statusCode).send({ message: error.message });
            throw error;
        }
    }

    async getSummary(request: FastifyRequest, reply: FastifyReply){
        try {
            const userId = request.user.sub;
            const summary = await transactionsService.getSummary(userId)
            return reply.status(200).send(summary)

        } catch (error) {
            if (error instanceof AppError) return reply.status(error.statusCode).send({ message: error.message });
            throw error;            
            
        }
    }


}