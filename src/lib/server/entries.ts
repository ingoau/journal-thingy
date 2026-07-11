import { db } from "./db";
import { entry } from "./db/schema";

export async function createEntry(userId: string, date: number, content: string, score: number) {
    return await db.insert(entry).values({
        userId,
        date: new Date(date),
        content,
        attachments: null,
        score
    });
}