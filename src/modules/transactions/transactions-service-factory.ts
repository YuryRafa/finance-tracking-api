import { TransactionsRepository } from "./transactions-repository.js";
import { TransactionsService } from "./transactions-service.js";

export function makeTransactionsService(){
    const transactionsRepository = new TransactionsRepository();
    const transactionsService = new TransactionsService(transactionsRepository);
    return transactionsService
}