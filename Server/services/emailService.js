const nodemailer = require("nodemailer");
const config = require("config");

/**
 * Get email configuration from config file
 */
const getEmailConfig = () => {
  if (!config.has("EMAIL")) {
    throw new Error("Email configuration not found");
  }
  return config.get("EMAIL");
};

/**
 * Create email transporter based on configuration
 */
const createTransporter = () => {
  const emailConfig = getEmailConfig();
  const service = emailConfig.SERVICE || "gmail";

  // Gmail configuration (requires app password)
  if (service === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || emailConfig.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD, // App password, not regular password
      },
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || emailConfig.SMTP_HOST,
    port: process.env.SMTP_PORT || emailConfig.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || emailConfig.FROM_EMAIL,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
  const emailConfig = getEmailConfig();
  const transporter = createTransporter();

  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const expiryMinutes = emailConfig.RESET_PASSWORD_EXPIRY_MINUTES || 15;

  const mailOptions = {
    from: `"${emailConfig.FROM_NAME || "Chess-it"}" <${emailConfig.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - Chess-it",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .warning {
              color: #dc2626;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Chess-it</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your Chess-it account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
              <p class="warning">
                <strong>Important:</strong> This link will expire in ${expiryMinutes} minutes.
                If you didn't request this password reset, please ignore this email.
              </p>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Chess-it. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - Chess-it

      Hello,

      We received a request to reset your password for your Chess-it account.

      Click the following link to reset your password:
      ${resetUrl}

      This link will expire in ${expiryMinutes} minutes.

      If you didn't request this password reset, please ignore this email.

      This is an automated message. Please do not reply to this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendPasswordResetEmail,
};

