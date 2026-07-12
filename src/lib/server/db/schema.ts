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

export const MOODS = [
	{ value: 'happy', color: '#facc15' }, // yellow-400
	{ value: 'sad', color: '#60a5fa' }, // blue-400
	{ value: 'angry', color: '#ef4444' }, // red-500
	{ value: 'anxious', color: '#a78bfa' }, // violet-400
	{ value: 'stressed', color: '#fb923c' }, // orange-400
	{ value: 'depressed', color: '#64748b' }, // slate-500
	{ value: 'excited', color: '#f472b6' }, // pink-400
	{ value: 'content', color: '#86efac' }, // green-300
	{ value: 'bored', color: '#9ca3af' }, // gray-400
	{ value: 'grateful', color: '#fcd34d' }, // amber-300
	{ value: 'lonely', color: '#818cf8' }, // indigo-400
	{ value: 'other', color: '#a3a3a3' } // neutral-400
] as const;

export type Mood = (typeof MOODS)[number]['value'];

export function moodColor(mood: Mood | null | undefined): string | undefined {
	if (!mood) return undefined;
	return MOODS.find((m) => m.value === mood)?.color;
}

export const entry = sqliteTable('entry', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	attachments: text({ mode: 'json' }).$type<Attachment[]>(),
	mood: text('mood').$type<Mood>(),
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
