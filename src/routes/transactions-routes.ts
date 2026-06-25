import type { FastifyInstance } from 'fastify';
import { TransactionsController } from '@/modules/transactions/transactions-controller.js';
import { verifyJwt } from '@/middlewares/verify-middleware.js';
import { 
    createTransactionOpenApi, 
    getTransactionByIdOpenApi, 
    listTransactionsOpenApi, 
    removeTransactionOpenApi, 
    getSummaryOpenApi, 
    updateTransactionOpenApi 
} from '@/modules/transactions/transactions-schemas.js';

const transactionsController = new TransactionsController();

export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/create', 
        { preHandler: [verifyJwt], schema: createTransactionOpenApi }, 
        transactionsController.createTransaction.bind(transactionsController)
    );
    
    app.get('/list', 
        { preHandler: [verifyJwt], schema: listTransactionsOpenApi }, 
        transactionsController.getTransactions.bind(transactionsController)
    );
    
    app.get('/summary', { preHandler: [verifyJwt], schema: getSummaryOpenApi }, 
        transactionsController.getSummary.bind(transactionsController)
    );
    
    app.get('/:id', { preHandler: [verifyJwt], schema: getTransactionByIdOpenApi }, 
        transactionsController.getTransactionById.bind(transactionsController)
    );
    
    app.delete('/remove/:id', { preHandler: [verifyJwt], schema: removeTransactionOpenApi }, 
        transactionsController.removeTransaction.bind(transactionsController)
    );

    app.put('/update/:id', {preHandler: [verifyJwt], schema: updateTransactionOpenApi},
        transactionsController.updateTransaction.bind(transactionsController)
     )
    
}

