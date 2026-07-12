import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error('TURSO_DATABASE_URL or DATABASE_URL must be set');

const authToken =
	process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_DATABASE_TURSO_AUTH_TOKEN;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url,
		authToken
	},
	verbose: true,
	strict: true
});
