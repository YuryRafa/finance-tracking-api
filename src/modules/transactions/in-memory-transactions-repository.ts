import type { CreateTransactionDto, TransactionsRepositoryInterface } from "@/@types/transactions-interfaces.js";
import type { Transaction } from "@/generated/prisma/client.js";
import { Decimal } from "@prisma/client/runtime/client";


export class InMemoryTransactionsRepository implements TransactionsRepositoryInterface {
    public transactions: Transaction[] = [];

    async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
        const transaction: Transaction = {
            id: crypto.randomUUID(),
            title: data.title,
            amount: new Decimal(data.amount),
            type: data.type,
            userId: data.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.transactions.push(transaction);
        return transaction;
    }

    async findTransactionById(id: string, userId: string): Promise<Transaction | null> {
        return this.transactions.find((t) => t.id === id && t.userId === userId) ?? null;
    }

    async listTransactions(userId: string): Promise<Transaction[]> {
        return this.transactions.filter((t) => t.userId === userId);
    }

    async deleteTransaction(id: string, userId: string): Promise<void> {
        this.transactions = this.transactions.filter((t) => !(t.id === id && t.userId === userId));
    }
}