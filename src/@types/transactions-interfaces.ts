import type { Transaction, TransactionType } from '@/generated/prisma/client.js';

export interface CreateTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  userId: string; 
}

export interface TransactionsRepositoryInterface {
  createTransaction(data: CreateTransactionDto): Promise<Transaction>;
  findTransactionById(id: string, userId: string): Promise<Transaction | null>;
  listTransactions(userId: string): Promise<Transaction[]>;
  deleteTransaction(id: string, userId: string): Promise<void>;
}