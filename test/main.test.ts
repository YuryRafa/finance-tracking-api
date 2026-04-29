import {expect, test, beforeAll, afterAll, describe, beforeEach} from 'vitest';
import { execSync} from 'node:child_process'
import request from 'supertest';
import {app} from '../src/app';

describe('Transactions routes', () => {
    
    beforeAll(async () => {
        await app.ready();
    });
    
    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    })

    test('user can create a new transaction', async () => {
    
        const response = await request(app.server)
                .post('/transactions/create')
                .send({
                    title: 'New transactions',
                    amount: 5000,
                    type: 'credit',
                }).expect(201);

    });

    test('user can list all transactions', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions/create')
            .send({
                title: 'New transactions',
                amount: 5000,
                type: 'credit',
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies!)
            .expect(200);
        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transactions',
                amount: 5000,
            }),
        ]);
        

    });

    test('user can get an specific transaction', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions/create')
            .send({
                title: 'New transactions',
                amount: 5000,
                type: 'credit',
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies!)
            .expect(200);

        const transactionId = listTransactionsResponse.body.transactions[0].id;

        const getTransactionById =await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies!)
            .expect(200)

        expect(getTransactionById.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transactions',
                amount: 5000,
            }),
        );
        

    });

    test('user can get the summary', async () => {

        const createTransactionResponse = await request(app.server)
            .post('/transactions/create')
            .send({
                title: 'Credit transaction',
                amount: 5000,
                type: 'credit',
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        await request(app.server)
            .post('/transactions/create')
            .set('Cookie', cookies!)
            .send({
                title: 'Debit transaction',
                amount: 2000,
                type: 'debit',
            });

        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies!)
            .expect(200);
        
        expect(summaryResponse.body.summary).toEqual({
            amount:3000
        });
        
    });
    
}); 


