import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

type Attachment =
	| {
			type: 'image';
			url: string;
	  }
	| {
			type: 'location';
			latitude: number;
			longitude: number;
	  };

type Mood =
	| 'happy'
	| 'sad'
	| 'angry'
	| 'anxious'
	| 'stressed'
	| 'depressed'
	| 'excited'
	| 'content'
	| 'bored'
	| 'grateful'
	| 'lonely'
	| 'other';

export const entry = sqliteTable('entry', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	attachments: text({ mode: 'json' }).$type<Attachment[]>(),
	mood: text('mood').$type<string>(),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date())
});

/*
content JSON
{
  type: 'image',
  url: 'https://example.com'
}
*/

export * from './auth.schema';
