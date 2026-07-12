import { env } from '$env/dynamic/private';
import emailVerificationOtp from './templates/email-verification-otp.html?raw';
import forgetPasswordOtp from './templates/forget-password-otp.html?raw';
import signInOtp from './templates/sign-in-otp.html?raw';

export type EmailTemplate = 'sign-in-otp' | 'email-verification-otp' | 'forget-password-otp';

interface EmailTemplateVariables {
	OTP: string;
	[key: string]: string;
}

const templates: Record<EmailTemplate, string> = {
	'sign-in-otp': signInOtp,
	'email-verification-otp': emailVerificationOtp,
	'forget-password-otp': forgetPasswordOtp
};

function renderTemplate(template: string, variables: EmailTemplateVariables): string {
	return Object.entries(variables).reduce((html, [key, value]) => {
		return html.replace(new RegExp(`{{${key}}}`, 'g'), value);
	}, template);
}

interface SendEmailOptions {
	to: string;
	subject: string;
	template: EmailTemplate;
	variables: EmailTemplateVariables;
}

export async function sendEmail({
	to,
	subject,
	template,
	variables
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
	try {
		const html = renderTemplate(templates[template], variables);

		if (!env.RESEND_API_KEY) {
			console.warn('RESEND_API_KEY not configured. Email would be sent to:', to);
			console.log('Subject:', subject);
			console.log('OTP:', variables.OTP);
			return { success: true };
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.RESEND_API_KEY}`
			},
			body: JSON.stringify({
				from: env.EMAIL_FROM || 'Journal Thingy <verify@email.lordseriouspig.au>',
				to: [to],
				subject,
				html
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('Failed to send email:', error);
			return { success: false, error: `Failed to send email: ${response.status}` };
		}

		return { success: true };
	} catch (error) {
		console.error('Error sending email:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

export async function sendOTPEmail(
	email: string,
	otp: string,
	type: 'sign-in' | 'email-verification' | 'forget-password'
): Promise<void> {
	const templateConfig: Record<typeof type, { template: EmailTemplate; subject: string }> = {
		'sign-in': {
			template: 'sign-in-otp',
			subject: 'Your Sign-In Code'
		},
		'email-verification': {
			template: 'email-verification-otp',
			subject: 'Verify Your Email'
		},
		'forget-password': {
			template: 'forget-password-otp',
			subject: 'Reset Your Password'
		}
	};

	const { template, subject } = templateConfig[type];

	const result = await sendEmail({
		to: email,
		subject,
		template,
		variables: { OTP: otp }
	});

	if (!result.success) {
		throw new Error(result.error || 'Failed to send email');
	}
}
