import type { Transaction, TransactionType } from '@/generated/prisma/client.js';

export interface CreateTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  userId: string; 
}

export interface UpdateTransactionDto {
  title?:  string;
  amount?: number;
  type?:   TransactionType;
}

export interface SummaryResult {
  income:  number
  expense: number
  balance: number
}

export interface TransactionsRepositoryInterface {
  createTransaction(data: CreateTransactionDto): Promise<Transaction>;
  findTransactionById(id: string, userId: string): Promise<Transaction | null>;
  listTransactions(userId: string): Promise<Transaction[]>;
  deleteTransaction(id: string, userId: string): Promise<void>;
  getSummary(userId: string): Promise<SummaryResult>;
  updateTransaction(id: string, userId: string, data: UpdateTransactionDto ): Promise<Transaction>
}