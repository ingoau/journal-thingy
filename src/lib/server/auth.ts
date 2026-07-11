import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { entry } from '$lib/server/db/schema';
import { emailOTP } from 'better-auth/plugins';
import { sendOTPEmail } from '$lib/server/emails/email-service';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
	user: {
		additionalFields: {
			onboarded: {
				type: 'boolean',
				defaultValue: false,
				input: true
			}
		},
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				await db.delete(entry).where(eq(entry.userId, user.id));
			}
		}
	},
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },

	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				await sendOTPEmail(email, otp, type);
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
