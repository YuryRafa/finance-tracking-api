import setupKnex from 'knex';
import type Knex from 'knex';
import { env } from './env/index.js';


export const config: Knex.Knex.Config = {
    client:'sqlite',
    connection: {
        filename: env.DATABASE_URL,

    },

    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './database/migrations',
    }
    
}

export const knex = setupKnex(config);