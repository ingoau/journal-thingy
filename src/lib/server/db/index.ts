import { drizzle } from 'drizzle-orm/libsql';
import { createClient as createLocalClient } from '@libsql/client';
import { createClient as createWebClient } from '@libsql/client/web';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const url = env.TURSO_DATABASE_URL ?? env.DATABASE_URL;
if (!url) throw new Error('TURSO_DATABASE_URL or DATABASE_URL must be set');

const authToken = env.TURSO_AUTH_TOKEN ?? env.TURSO_DATABASE_TURSO_AUTH_TOKEN;
const isLocal = url.startsWith('file:') || url.startsWith(':memory:');

const client = isLocal
	? createLocalClient({ url })
	: createWebClient({ url, authToken });

export const db = drizzle(client, { schema });
