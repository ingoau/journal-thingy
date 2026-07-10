import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { emailOTP } from 'better-auth/plugins';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				switch (type) {
					case 'sign-in':
						console.log(`Sign-in OTP: ${otp} for ${email}`);
						break;
					case 'email-verification':
						console.log(`Email verification OTP: ${otp} for ${email}`);
						break;
					case 'forget-password':
						console.log(`Password reset OTP: ${otp} for ${email}`);
						break;
				}
			}
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
