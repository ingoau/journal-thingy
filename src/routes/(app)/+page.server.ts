import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { entry } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({locals}) => {
    if (!locals.user) {
        redirect(303, '/login');
    }
    const entries = await db.query.entry.findMany({
        where: eq(entry.userId, locals.user.id)
    });
    return {
        entries,
        user: locals.user
    }
}

export const actions = {
    test: async ({locals}) => {
        if (!locals.user) {
            error(401, 'Unauthorized');
        }
        await db.insert(entry).values({
            userId: locals.user.id,
            content: "sladkfjadlkfjalsdkjfaosdhflksdchjlksdjhglkaejshfadkh eushtaudfhaoiusehrljasdfokualdfioua",
            score: 3
        });
    }
        
} satisfies Actions;