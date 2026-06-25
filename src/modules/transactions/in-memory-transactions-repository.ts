import type { CreateTransactionDto, SummaryResult, TransactionsRepositoryInterface, UpdateTransactionDto } from "@/@types/transactions-interfaces.js";
import type { Transaction } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/app-error.js";
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

    async updateTransaction(id: string, userId: string, data: UpdateTransactionDto): Promise<Transaction> {
        const transaction = this.transactions.find((t) => t.id === id && t.userId === userId);
        if (!transaction) throw new AppError('Transaction not found', 404);

        if (data.title  !== undefined) transaction.title  = data.title;
        if (data.amount !== undefined) transaction.amount = new Decimal(data.amount);
        if (data.type   !== undefined) transaction.type   = data.type;
        transaction.updatedAt = new Date();

        return transaction;
    }
    async getSummary(userId: string): Promise<SummaryResult> {
        const userTransactions = this.transactions.filter((t) => t.userId === userId);

        const totalIncome = userTransactions
            .filter((t) => t.type === "INCOME")
            .reduce((sum, t) => sum.add(t.amount), new Decimal(0));

        const totalExpense = userTransactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((sum, t) => sum.add(t.amount), new Decimal(0));

        return {
            income:  totalIncome.toNumber(),
            expense: totalExpense.toNumber(),
            balance: totalIncome.sub(totalExpense).toNumber(),
        }
    }
}