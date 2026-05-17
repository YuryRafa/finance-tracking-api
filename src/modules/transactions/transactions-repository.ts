import type { CreateTransactionDto, SummaryResult, TransactionsRepositoryInterface, UpdateTransactionDto } from '@/@types/transactions-interfaces.js';
import { prisma } from '@/config/prisma.js';
import type { Transaction } from '@/generated/prisma/client.js';
import { Decimal } from '@prisma/client/runtime/client';

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

  async updateTransaction(id: string, userId: string, data: UpdateTransactionDto): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id, userId },
      data,
    })
  }

  async getSummary(userId: string): Promise<SummaryResult> {  
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ])

  const totalIncome  = income._sum.amount  ?? new Decimal(0)
  const totalExpense = expense._sum.amount ?? new Decimal(0)

  return {
    income:  totalIncome.toNumber(),
    expense: totalExpense.toNumber(),
    balance: totalIncome.sub(totalExpense).toNumber(),
  }
  }
}