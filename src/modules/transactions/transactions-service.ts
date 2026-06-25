import type { CreateTransactionDto, SummaryResult, TransactionsRepositoryInterface, UpdateTransactionDto } from "@/@types/transactions-interfaces.js";
import type { Transaction } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/app-error.js";

export class TransactionsService {
    constructor(
        private transactionsRepository: TransactionsRepositoryInterface
    ) {}

    async registerTransaction({ title, amount, type, userId }: CreateTransactionDto): Promise<Transaction> {
        const transaction = await this.transactionsRepository.createTransaction({ title, amount, type, userId });
       
        return transaction;
    }

    async getTransactions(userId: string): Promise<Transaction[]> {
        const transactions = await this.transactionsRepository.listTransactions(userId);
        
        return transactions;
    }

    async getTransactionById(userId: string, id: string): Promise<Transaction> {
        const transaction = await this.transactionsRepository.findTransactionById(id, userId); 
        if (!transaction) throw new AppError("Transaction not found", 404);
        return transaction;
    }

    async removeTransaction(id: string, userId: string): Promise<void> {
        const transaction = await this.transactionsRepository.findTransactionById(id, userId); 
        if (!transaction) throw new AppError("Transaction not found", 404);
        return this.transactionsRepository.deleteTransaction(id, userId);
    }

    async updateTransaction(id: string, userId: string, data: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findTransactionById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return this.transactionsRepository.updateTransaction(id, userId, data);
    }

    async getSummary(userId: string):Promise<SummaryResult>{
        const summary = await this.transactionsRepository.getSummary(userId);
        return summary;
    }
}