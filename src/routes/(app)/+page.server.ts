import { sanitizeEntryHtml } from '$lib/server/sanitize';
import { db } from '$lib/server/db';
import { requireOwnedEntry, requireUser } from '$lib/server/entries';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { entry, MOODS, type Mood } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login');
	}
	const entries = await db.query.entry.findMany({
		where: eq(entry.userId, locals.user.id),
		orderBy: (entries, { desc }) => [desc(entries.createdAt)]
	});
	return {
		entries,
		user: locals.user
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const user = requireUser(locals.user);
		const data = await request.formData();
		const content = sanitizeEntryHtml(String(data.get('content')));
		if (!content || content === '<p></p>') {
			return;
		}
		await db.insert(entry).values({
			userId: user.id,
			content
		});
	},
	update: async ({ request, locals }) => {
		const user = requireUser(locals.user);
		const data = await request.formData();
		const id = data.get('id');
		const content = data.get('content');

		if (typeof id !== 'string' || !id || typeof content !== 'string') {
			error(400, 'Invalid entry update');
		}

		await requireOwnedEntry(user.id, id);

		await db
			.update(entry)
			.set({ content: sanitizeEntryHtml(content) })
			.where(and(eq(entry.id, id), eq(entry.userId, user.id)));
	},
	delete: async ({ request, locals }) => {
		const user = requireUser(locals.user);
		const data = await request.formData();
		const id = data.get('id');

		if (typeof id !== 'string' || !id) {
			error(400, 'Invalid entry delete');
		}

		await requireOwnedEntry(user.id, id);

		await db.delete(entry).where(and(eq(entry.id, id), eq(entry.userId, user.id)));
	},
	addAttachment: async ({ request, locals }) => {
		const user = requireUser(locals.user);

		const data = await request.formData();
		const id = data.get('id');
		const url = data.get('url');

		if (typeof id !== 'string' || !id || typeof url !== 'string' || !url) {
			error(400, 'Missing attachment data');
		}

		const existing = await requireOwnedEntry(user.id, id);
		const attachments = [...(existing.attachments ?? []), { type: 'image' as const, url }];

		await db
			.update(entry)
			.set({ attachments })
			.where(and(eq(entry.id, id), eq(entry.userId, user.id)));
	},
	setMood: async ({ request, locals }) => {
		const user = requireUser(locals.user);
		const data = await request.formData();
		const id = data.get('id');
		const mood = data.get('mood');

		if (typeof id !== 'string' || !id) {
			error(400, 'Invalid entry');
		}

		await requireOwnedEntry(user.id, id);

		let moodValue: Mood | null = null;
		if (typeof mood === 'string' && mood !== '') {
			if (!MOODS.some((m) => m.value === mood)) {
				error(400, 'Invalid mood');
			}
			moodValue = mood as Mood;
		}

		await db
			.update(entry)
			.set({ mood: moodValue })
			.where(and(eq(entry.id, id), eq(entry.userId, user.id)));
	},
	removeAttachment: async ({ request, locals }) => {
		const user = requireUser(locals.user);

		const data = await request.formData();
		const id = data.get('id');
		const url = data.get('url');

		if (typeof id !== 'string' || !id || typeof url !== 'string' || !url) {
			error(400, 'Missing attachment data');
		}

		const existing = await requireOwnedEntry(user.id, id);
		const attachments = (existing.attachments ?? []).filter(
			(attachment) => !(attachment.type === 'image' && attachment.url === url)
		);

		await db
			.update(entry)
			.set({ attachments: attachments.length > 0 ? attachments : null })
			.where(and(eq(entry.id, id), eq(entry.userId, user.id)));
	}
} satisfies Actions;
