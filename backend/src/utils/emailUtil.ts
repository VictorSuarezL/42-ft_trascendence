import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = 'FT Transcendence';

interface SendPasswordResetEmailParams {
  email: string;
  name: string;
  resetUrl: string;
}
interface VerificationEmailParams {
  email: string;
  name: string;
  confirmationUrl: string;
}
export async function sendVerificationEmail({
  email,
  name,
  confirmationUrl,
}: VerificationEmailParams) {
  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Confirm your account',
    html: `
      <h1>Welcome, ${name}!</h1>

      <p>
        Thanks for creating an account.
      </p>

      <p>
        Please confirm your email address by clicking the button below:
      </p>

      <a
        href="${confirmationUrl}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        "
      >
        Confirm my email
      </a>

      <p>
        This link will expire in 24 hours.
      </p>

      <p>
        If you didn't create this account, you can ignore this email.
      </p>
    `,
  });
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: SendPasswordResetEmailParams) {
  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset your password</h1>

      <p>
        Hello ${name},
      </p>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        Click the button below to reset your password:
      </p>

      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        "
      >
        Reset my password
      </a>

      <p>
        This link will expire in 1 hour.
      </p>

      <p>
        If you did not request this, you can safely ignore this email.
      </p>
    `,
  });
}
