// src/routes/(app)/calender/+page.server.ts
import { db } from '$lib/server/db';
import { entry, type Mood } from '$lib/server/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { DateTime } from 'luxon';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { dayMoods: {} };
	const now = DateTime.now();
	const rangeStart = now.minus({ months: 1 }).startOf('month');
	const rangeEnd = now.plus({ months: 1 }).endOf('month');

	const rows = await db.query.entry.findMany({
		where: and(
			eq(entry.userId, locals.user.id),
			gte(entry.createdAt, rangeStart.toJSDate()),
			lte(entry.createdAt, rangeEnd.toJSDate())
		)
	});

	const byDay = new Map<string, { mood: Mood; createdAt: Date }[]>();
	for (const row of rows) {
		if (!row.mood) continue;
		const key = DateTime.fromJSDate(new Date(row.createdAt)).toFormat('yyyy-MM-dd');
		if (!byDay.has(key)) byDay.set(key, []);
		byDay.get(key)!.push({ mood: row.mood, createdAt: new Date(row.createdAt) });
	}

	const dayMoods: Record<string, Mood> = {};
	for (const [key, entries] of byDay) {
		const latest = entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
		dayMoods[key] = latest.mood;
	}

	return { dayMoods };
};