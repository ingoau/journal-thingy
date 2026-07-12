import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entry } from '$lib/server/db/schema';

export function requireUser(user: App.Locals['user']) {
	if (!user) {
		error(401, 'Unauthorized');
	}
	return user;
}

/** Load an entry and reject access unless the signed-in user owns it. */
export async function requireOwnedEntry(userId: string, entryId: string) {
	const existing = await db.query.entry.findFirst({
		where: eq(entry.id, entryId)
	});

	if (!existing) {
		error(404, 'Entry not found');
	}

	if (existing.userId !== userId) {
		error(403, 'Forbidden');
	}

	return existing;
}
