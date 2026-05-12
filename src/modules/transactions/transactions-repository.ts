import type { CreateTransactionDto, TransactionsRepositoryInterface } from '@/@types/transactions-interfaces.js';
import { prisma } from '@/config/prisma.js';
import type { Transaction } from '@/generated/prisma/client.js';

export class TransactionsRepository implements TransactionsRepositoryInterface {
  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    return prisma.transaction.create({ data });
  }

  async findTransactionById(id: string, userId: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({ where: { id, userId } });
  }

  async listTransactions(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({ where: { userId } });
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    await prisma.transaction.delete({ where: { id, userId } });
  }
}