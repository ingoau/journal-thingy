import { db } from '$lib/server/db';
import { createEntry } from '$lib/server/entries';
import type { Actions } from './$types';

export const load = async () => {
    const entries = await db.query.entry.findMany({})
    return {
        entries
    }
}

export const actions = {
    test: async () => {
        console.log("test");
        await createEntry(
                "cheese",
                1783834820,
                "sladkfjadlkfjalsdkjfaosdhflksdchjlksdjhglkaejshfadkh eushtaudfhaoiusehrljasdfokualdfioua",
                3
            ) 
        console.log("test2");
    }
        
} satisfies Actions;