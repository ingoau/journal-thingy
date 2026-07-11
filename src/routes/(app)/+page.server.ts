import { sanitizeEntryHtml } from '$lib/sanitize';
import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { entry } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}
	const entries = await db.query.entry.findMany({
		where: eq(entry.userId, locals.user.id)
	});
	return {
		entries,
		user: locals.user
	};
};

export const actions = {
	test: async ({ locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}
		await db.insert(entry).values({
			userId: locals.user.id,
			content:
				'sladkfjadlkfjalsdkjfaosdhflksdchjlksdjhglkaejshfadkh eushtaudfhaoiusehrljasdfokualdfioua',
			score: 3
		});
	},
	update: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const id = data.get('id');
		const content = data.get('content');

		if (typeof id !== 'string' || !id || typeof content !== 'string') {
			error(400, 'Invalid entry update');
		}

		const existing = await db.query.entry.findFirst({
			where: eq(entry.id, id),
			columns: { id: true, userId: true }
		});

		if (!existing) {
			error(404, 'Entry not found');
		}

		if (existing.userId !== locals.user.id) {
			error(403, 'Forbidden');
		}

		await db
			.update(entry)
			.set({ content: sanitizeEntryHtml(content) })
			.where(eq(entry.id, id));
	}
} satisfies Actions;
