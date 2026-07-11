import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

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

						await resend.emails.send({
							from: 'Journal Thingy <verify@email.lordseriouspig.au>',
							to: email,
							subject: 'Verify your email',
							html: `
<html lang="en">
<head>
	<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Your Sign-In Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, Helvetica, sans-serif;">

<table role="presentation" style="background-color:#f4f4f7; padding:40px 0;">
<tr>
	<td>

<table role="presentation" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">

<tr>
	<td style="padding:40px 32px; color:#333333;">

	<h2 style="margin-top:0; font-size:24px;">
	Sign in to your account
</h2>

<p style="font-size:16px; line-height:24px;">
	Hi,
</p>

<p style="font-size:16px; line-height:24px;">
	Use the verification code below to sign in to your account.
	This code will expire in <strong>10 minutes</strong>.
</p>

<table role="presentation">
<tr>
	<td style="padding:30px 0;">
<div style="
display:inline-block;
background:#f3f4f6;
border:2px dashed #d1d5db;
border-radius:10px;
padding:18px 36px;
font-size:36px;
font-weight:bold;
letter-spacing:10px;
color:#111827;
font-family:'Courier New', monospace;
">
${otp}
</div>
</td>
</tr>
</table>

<p style="font-size:16px; line-height:24px;">
	If you didn't request this code, you can safely ignore this email.
No changes have been made to your account.
</p>

<hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;">

<p style="font-size:13px; color:#6b7280; line-height:20px;">
	For your security, never share this code with anyone. Our team
will never ask for your verification code.
</p>

</td>
</tr>

<tr>
<td style="background:#f9fafb; padding:24px; color:#6b7280; font-size:12px;">
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
						});
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
