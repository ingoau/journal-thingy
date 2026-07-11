# Email Service

This directory contains the email service implementation for sending transactional emails.

## Architecture

### Directory Structure

```
emails/
├── README.md                          # This file
├── email-service.ts                   # Email service logic
└── templates/                         # HTML email templates
    ├── sign-in-otp.html              # Sign-in verification code
    ├── email-verification-otp.html   # Email verification code
    └── forget-password-otp.html      # Password reset code
```

### Key Features

1. **Separate Template Files**: HTML templates are stored as separate `.html` files, making them easy to edit and maintain
2. **Template Variables**: Use `{{VARIABLE_NAME}}` syntax for dynamic content injection
3. **Type-Safe Service**: TypeScript service layer with proper types
4. **Graceful Fallback**: Logs to console when API key is not configured (useful for development)

## Usage

### Sending an OTP Email

The simplest way to send an OTP email:

```typescript
import { sendOTPEmail } from '$lib/server/emails/email-service';

await sendOTPEmail('user@example.com', '123456', 'sign-in');
```

### Sending Custom Emails

For more control:

```typescript
import { sendEmail } from '$lib/server/emails/email-service';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'sign-in-otp',
  variables: { OTP: '123456' }
});
```

## Creating New Templates

1. Create a new HTML file in `templates/` directory
2. Use inline CSS for email client compatibility
3. Use `{{VARIABLE_NAME}}` for dynamic content
4. Add the template name to the `EmailTemplate` type in `email-service.ts`
5. Update the service function as needed

### Template Guidelines

- **Inline CSS**: Email clients don't support external stylesheets
- **Table Layouts**: Use tables for layout (older email clients require this)
- **Test Across Clients**: Different email clients render HTML differently
- **Keep It Simple**: Avoid complex CSS, JavaScript, or external resources
- **Responsive Design**: Use media queries for mobile optimization

## Email Provider

This service uses [Resend](https://resend.com) for sending emails:

- **Simple API**: Just a fetch request, no SDK needed
- **Developer-Friendly**: Great documentation and testing tools
- **Reliable**: Built for transactional emails
- **Free Tier**: 3,000 emails/month for testing

### Configuration

Set these environment variables:

- `RESEND_API_KEY`: Your Resend API key (get from resend.com/api-keys)
- `EMAIL_FROM`: Your verified sender email (e.g., `"App <noreply@yourdomain.com>"`)

For development, you can use Resend's test address: `onboarding@resend.dev`

## Alternative Providers

To switch providers, modify the `sendEmail` function in `email-service.ts`:

### Nodemailer Example

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: env.EMAIL_FROM,
  to,
  subject,
  html
});
```

### SendGrid Example

```typescript
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: env.EMAIL_FROM },
    subject,
    content: [{ type: 'text/html', value: html }]
  })
});
```

## Benefits of This Approach

✅ **Separation of Concerns**: Templates separate from logic  
✅ **Easy to Edit**: Designers can edit HTML without touching TypeScript  
✅ **Version Control Friendly**: Git diffs show actual template changes  
✅ **Type Safety**: TypeScript ensures correct template usage  
✅ **Testable**: Easy to test template rendering separately  
✅ **No Build Step**: Templates are loaded at runtime  
✅ **DRY Principle**: Reusable template system
