import type { Knex } from "knex";

// whats the migrations is going to do?
export async function up(knex: Knex): Promise<void> { 
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary();
        table.text('title').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

    });
};


//IF we need to rollback migrations, reverse the up method
export async function down(knex: Knex): Promise<void> { 
    await knex.schema.dropTable('transactions')
}

