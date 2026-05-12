import { describe, it, expect, beforeEach } from "vitest";
import { TransactionsService } from "../src/modules/transactions/transactions-service.js";
import { InMemoryTransactionsRepository } from "../src/modules/transactions/in-memory-transactions-repository.js";
import { AppError } from "../src/utils/app-error.js";
import { TransactionType } from "../src/generated/prisma/client.js";


// Helpers


function makeTransactionsService() {
    const transactionsRepository = new InMemoryTransactionsRepository();
    const transactionsService = new TransactionsService(transactionsRepository);
    return { transactionsService, transactionsRepository };
}

const userId = crypto.randomUUID();
const anotherUserId = crypto.randomUUID();

const defaultTransactionDto = {
    title: "Freelance payment",
    amount: 1500,
    type: TransactionType.INCOME,
    userId,
};


// registerTransaction


describe("TransactionsService - registerTransaction", () => {
    let transactionsService: TransactionsService;
    let transactionsRepository: InMemoryTransactionsRepository;

    beforeEach(() => {
        ({ transactionsService, transactionsRepository } = makeTransactionsService());
    });

    it("should create a transaction and return it", async () => {
        const transaction = await transactionsService.registerTransaction(defaultTransactionDto);

        expect(transaction.title).toBe(defaultTransactionDto.title);
        expect(transaction.amount.toNumber()).toBe(defaultTransactionDto.amount);
        expect(transaction.type).toBe(defaultTransactionDto.type);
        expect(transaction.userId).toBe(userId);
        expect(transaction.id).toBeDefined();
        expect(transaction.createdAt).toBeInstanceOf(Date);
    });

    it("should store the transaction in the repository", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto);

        expect(transactionsRepository.transactions).toHaveLength(1);
    });

    it("should allow creating multiple transactions for the same user", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto);
        await transactionsService.registerTransaction({ ...defaultTransactionDto, title: "Second payment" });

        expect(transactionsRepository.transactions).toHaveLength(2);
    });

    it("should allow creating transactions for different users", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto);
        await transactionsService.registerTransaction({ ...defaultTransactionDto, userId: anotherUserId });

        expect(transactionsRepository.transactions).toHaveLength(2);
    });
});


// getTransactions


describe("TransactionsService - getTransactions", () => {
    let transactionsService: TransactionsService;

    beforeEach(() => {
        ({ transactionsService } = makeTransactionsService());
    });

    it("should return all transactions for a user", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto);
        await transactionsService.registerTransaction({ ...defaultTransactionDto, title: "Second payment" });

        const transactions = await transactionsService.getTransactions(userId);

        expect(transactions).toHaveLength(2);
    });

    it("should return an empty array when user has no transactions", async () => {
        const transactions = await transactionsService.getTransactions(userId);

        expect(transactions).toHaveLength(0);
    });

    it("should not return transactions from other users", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto);
        await transactionsService.registerTransaction({ ...defaultTransactionDto, userId: anotherUserId });

        const transactions = await transactionsService.getTransactions(userId);

        expect(transactions).toHaveLength(1);
        expect(transactions[0].userId).toBe(userId);
    });
});


// getTransactionById


describe("TransactionsService - getTransactionById", () => {
    let transactionsService: TransactionsService;

    beforeEach(() => {
        ({ transactionsService } = makeTransactionsService());
    });

    it("should return a transaction by id", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        const transaction = await transactionsService.getTransactionById(userId, created.id);

        expect(transaction.id).toBe(created.id);
        expect(transaction.userId).toBe(userId);
        expect(transaction.amount.toNumber()).toBe(defaultTransactionDto.amount);
    });

    it("should throw AppError 404 when transaction does not exist", async () => {
        await expect(
            transactionsService.getTransactionById(userId, "non-existent-id")
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });

    it("should throw AppError 404 when transaction belongs to another user", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        await expect(
            transactionsService.getTransactionById(anotherUserId, created.id)
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });
});


// removeTransaction


describe("TransactionsService - removeTransaction", () => {
    let transactionsService: TransactionsService;
    let transactionsRepository: InMemoryTransactionsRepository;

    beforeEach(() => {
        ({ transactionsService, transactionsRepository } = makeTransactionsService());
    });

    it("should remove a transaction", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        await transactionsService.removeTransaction(created.id, userId);

        expect(transactionsRepository.transactions).toHaveLength(0);
    });

    it("should only remove the targeted transaction", async () => {
        const first = await transactionsService.registerTransaction(defaultTransactionDto);
        await transactionsService.registerTransaction({ ...defaultTransactionDto, title: "Second payment" });

        await transactionsService.removeTransaction(first.id, userId);

        expect(transactionsRepository.transactions).toHaveLength(1);
        expect(transactionsRepository.transactions[0].title).toBe("Second payment");
    });

    it("should throw AppError 404 when transaction does not exist", async () => {
        await expect(
            transactionsService.removeTransaction("non-existent-id", userId)
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });

    it("should throw AppError 404 when transaction belongs to another user", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        await expect(
            transactionsService.removeTransaction(created.id, anotherUserId)
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });
});