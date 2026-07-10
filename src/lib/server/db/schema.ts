import { integer, sqliteTable, text, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';

export const entry = sqliteTable(
	'entry',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		date: integer({ mode: 'timestamp' }).notNull(),
		content: text('content').notNull(),
		attachments: text({ mode: 'json' }),
    score: integer(),
    createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [check('score', sql`${table.score} BETWEEN 0 AND 5`)]
);

/*
content JSON
{
  type: 'image',
  url: 'https://example.com'
}
*/

export * from './auth.schema';
