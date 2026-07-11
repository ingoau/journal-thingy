// src/routes/(app)/calender/+page.server.ts
import { db } from '$lib/server/db';
import { entry } from '$lib/server/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { DateTime } from 'luxon';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) return { dayScores: {} };
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

	const byDay = new Map<string, number[]>();
	for (const row of rows) {
		if (row.score === null || row.score === undefined) continue;
		const key = DateTime.fromJSDate(new Date(row.createdAt)).toFormat('yyyy-MM-dd');
		if (!byDay.has(key)) byDay.set(key, []);
		byDay.get(key)!.push(row.score);
	}

	const dayScores: Record<string, number> = {};
	for (const [key, scores] of byDay) {
		dayScores[key] = scores.reduce((a, b) => a + b, 0) / scores.length;
	}

	return { dayScores };
};