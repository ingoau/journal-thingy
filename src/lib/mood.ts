// src/lib/mood.ts
// MOODS is defined in $lib/server/db/schema.ts — keep these in sync for client use.

export const MOODS = [
	{ value: 'happy', color: '#facc15' },
	{ value: 'sad', color: '#60a5fa' },
	{ value: 'angry', color: '#ef4444' },
	{ value: 'anxious', color: '#a78bfa' },
	{ value: 'stressed', color: '#fb923c' },
	{ value: 'depressed', color: '#64748b' },
	{ value: 'excited', color: '#f472b6' },
	{ value: 'content', color: '#86efac' },
	{ value: 'bored', color: '#9ca3af' },
	{ value: 'grateful', color: '#fcd34d' },
	{ value: 'lonely', color: '#818cf8' },
	{ value: 'other', color: '#a3a3a3' }
] as const;

export type Mood = (typeof MOODS)[number]['value'];

export function moodColor(mood: Mood | null | undefined): string | undefined {
	if (!mood) return undefined;
	return MOODS.find((m) => m.value === mood)?.color;
}