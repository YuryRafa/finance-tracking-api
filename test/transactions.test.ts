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


// getSummary

describe("TransactionsService - getSummary", () => {
    let transactionsService: TransactionsService;

    beforeEach(() => {
        ({ transactionsService } = makeTransactionsService());
    });

    it("should return zero summary when user has no transactions", async () => {
        const summary = await transactionsService.getSummary(userId);

        expect(summary.income).toBe(0);
        expect(summary.expense).toBe(0);
        expect(summary.balance).toBe(0);
    });

    it("should return correct income total", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto); // 1500
        await transactionsService.registerTransaction({ ...defaultTransactionDto, amount: 500 });

        const summary = await transactionsService.getSummary(userId);

        expect(summary.income).toBe(2000);
        expect(summary.expense).toBe(0);
        expect(summary.balance).toBe(2000);
    });

    it("should return correct expense total", async () => {
        await transactionsService.registerTransaction({ ...defaultTransactionDto, type: TransactionType.EXPENSE, amount: 300 });
        await transactionsService.registerTransaction({ ...defaultTransactionDto, type: TransactionType.EXPENSE, amount: 200 });

        const summary = await transactionsService.getSummary(userId);

        expect(summary.income).toBe(0);
        expect(summary.expense).toBe(500);
        expect(summary.balance).toBe(-500);
    });

    it("should return correct balance with both income and expenses", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto); // income 1500
        await transactionsService.registerTransaction({ ...defaultTransactionDto, type: TransactionType.EXPENSE, amount: 400 });

        const summary = await transactionsService.getSummary(userId);

        expect(summary.income).toBe(1500);
        expect(summary.expense).toBe(400);
        expect(summary.balance).toBe(1100);
    });

    it("should not include transactions from other users", async () => {
        await transactionsService.registerTransaction(defaultTransactionDto); // userId income 1500
        await transactionsService.registerTransaction({ ...defaultTransactionDto, userId: anotherUserId, amount: 9999 });

        const summary = await transactionsService.getSummary(userId);

        expect(summary.income).toBe(1500);
        expect(summary.balance).toBe(1500);
    });
});


// updateTransaction


describe("TransactionsService - updateTransaction", () => {
    let transactionsService: TransactionsService;
    let transactionsRepository: InMemoryTransactionsRepository;

    beforeEach(() => {
        ({ transactionsService, transactionsRepository } = makeTransactionsService());
    });

    it("should update the title of a transaction", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        const updated = await transactionsService.updateTransaction(created.id, userId, { title: "Updated title" });

        expect(updated.title).toBe("Updated title");
        expect(updated.amount.toNumber()).toBe(defaultTransactionDto.amount); // unchanged
    });

    it("should update the amount of a transaction", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        const updated = await transactionsService.updateTransaction(created.id, userId, { amount: 9999 });

        expect(updated.amount.toNumber()).toBe(9999);
        expect(updated.title).toBe(defaultTransactionDto.title); // unchanged
    });

    it("should update the type of a transaction", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        const updated = await transactionsService.updateTransaction(created.id, userId, { type: TransactionType.EXPENSE });

        expect(updated.type).toBe(TransactionType.EXPENSE);
    });

    it("should update multiple fields at once", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        const updated = await transactionsService.updateTransaction(created.id, userId, {
            title: "New title",
            amount: 250,
            type: TransactionType.EXPENSE,
        });

        expect(updated.title).toBe("New title");
        expect(updated.amount.toNumber()).toBe(250);
        expect(updated.type).toBe(TransactionType.EXPENSE);
    });

    it("should update updatedAt timestamp", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);
        const originalUpdatedAt = created.updatedAt;

        await new Promise((r) => setTimeout(r, 10)); // ensure time passes
        const updated = await transactionsService.updateTransaction(created.id, userId, { title: "New title" });

        expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it("should throw AppError 404 when transaction does not exist", async () => {
        await expect(
            transactionsService.updateTransaction("non-existent-id", userId, { title: "New title" })
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });

    it("should throw AppError 404 when transaction belongs to another user", async () => {
        const created = await transactionsService.registerTransaction(defaultTransactionDto);

        await expect(
            transactionsService.updateTransaction(created.id, anotherUserId, { title: "New title" })
        ).rejects.toThrow(new AppError("Transaction not found", 404));
    });
});