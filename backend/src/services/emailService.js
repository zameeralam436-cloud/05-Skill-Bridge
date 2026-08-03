/**
 * Email Service
 * 
 * This service handles sending professional HTML emails to students using Nodemailer.
 * 
 * --- HOW TO CONNECT NODEMAILER TO GMAIL VIA APP PASSWORDS ---
 * 1. Log in to your Google Account (for the sender email).
 * 2. Enable "2-Step Verification" under the Security tab.
 * 3. Go to the "App passwords" section (you can search "App passwords" in the search bar if not visible).
 * 4. Select "Mail" and select the device/platform (or choose "Other" and type "SkillBridge").
 * 5. Click "Generate". Google will show a 16-character password (e.g., "abcd efgh ijkl mnop").
 * 6. Copy this 16-character password (without spaces) and set it as your SMTP_PASS / EMAIL_PASS env variable.
 * 7. Do NOT use your regular Gmail password; it will fail authentication due to Google security policies.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Creates and returns a Nodemailer transporter configured via environment variables.
 */
function createTransporter() {
  // Gmail SMTP settings or a custom SMTP provider can be used
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465; // true for 465, false for other ports
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("WARNING: SMTP_USER or SMTP_PASS environment variables are not set. Emails may fail to send.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // For local development / testing with self-signed certs (common in FYPs)
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Sends a job application update email notification to a student.
 * 
 * @param {string} studentEmail - The student's email address
 * @param {string} studentName - The student's full name
 * @param {string} companyName - The name of the hiring company
 * @param {string} jobTitle - The title of the job listing
 * @param {string} newStatus - The updated status (e.g., Shortlisted, Interview, Selected, Rejected)
 * @param {string} [additionalMessage] - Optional custom message/notes from the employer
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
async function sendApplicationUpdateEmail(
  studentEmail,
  studentName,
  companyName,
  jobTitle,
  newStatus,
  additionalMessage = ''
) {
  try {
    const transporter = createTransporter();

    // Standardize status for matching styles
    const statusLower = (newStatus || '').toLowerCase().trim();
    
    // Choose theme colors dynamically based on the application status
    let statusBg = '#f1f5f9';
    let statusColor = '#475569';
    let statusBorder = '#cbd5e1';
    let statusText = newStatus;

    if (statusLower.includes('shortlist')) {
      statusBg = '#e0e7ff';
      statusColor = '#4338ca';
      statusBorder = '#c7d2fe';
      statusText = 'Shortlisted';
    } else if (statusLower.includes('interview')) {
      statusBg = '#fef3c7';
      statusColor = '#b45309';
      statusBorder = '#fde68a';
      statusText = 'Interview Scheduled';
    } else if (statusLower.includes('select') || statusLower.includes('hire') || statusLower.includes('accept')) {
      statusBg = '#dcfce7';
      statusColor = '#15803d';
      statusBorder = '#bbf7d0';
      statusText = 'Selected';
    } else if (statusLower.includes('reject') || statusLower.includes('decline') || statusLower.includes('not selected')) {
      statusBg = '#fee2e2';
      statusColor = '#b91c1c';
      statusBorder = '#fca5a5';
      statusText = 'Not Selected';
    }

    // Construct the professional HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SkillBridge Application Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div style="background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em; font-family: 'Outfit', 'Inter', sans-serif;">SkillBridge</h1>
              <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Career Application Update</p>
            </div>
            
            <!-- Body Content -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Hello ${studentName || 'Candidate'},</h2>
              
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                There has been an update regarding your job application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. 
                The hiring team has updated your application status to:
              </p>
              
              <!-- Status Badge -->
              <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; background-color: ${statusBg}; color: ${statusColor}; font-size: 16px; font-weight: 700; padding: 12px 28px; border-radius: 50px; border: 1px solid ${statusBorder}; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${statusText}
                </span>
              </div>
              
              ${additionalMessage ? `
              <!-- Optional Additional message from employer -->
              <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 8px; margin: 24px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Message from the employer:</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155; white-space: pre-line;">${additionalMessage}</p>
              </div>
              ` : ''}
              
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 24px 0 0 0;">
                Please log into your SkillBridge dashboard to view full details, message the recruiter, or manage your next steps.
              </p>
              
              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0 12px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://skillbridge-fyp.web.app'}/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.15), 0 2px 4px -2px rgba(79, 70, 229, 0.15);">
                  View Dashboard
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">This email was sent automatically by the SkillBridge Career Platform.</p>
              <p style="margin: 0;">&copy; 2026 SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Fallback to user's test email if studentEmail is empty, mock or invalid
    const recipient = (!studentEmail || studentEmail.includes('example.com') || studentEmail.includes('mock') || !studentEmail.includes('@'))
      ? 'zameeralam436@gmail.com'
      : studentEmail;

    // Configure email options
    const mailOptions = {
      from: process.env.SMTP_FROM || `"SkillBridge Hiring" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: `SkillBridge Application Update: ${companyName} - ${jobTitle}`,
      html: emailHtml,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Application status update email sent to ${recipient}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    const errorRecipient = (!studentEmail || studentEmail.includes('example.com') || studentEmail.includes('mock') || !studentEmail.includes('@'))
      ? 'zameeralam436@gmail.com'
      : studentEmail;
    console.error(`[EmailService] Error sending email to ${errorRecipient}:`, error);
    return { success: false, error: error.message || error };
  }
}

module.exports = {
  sendApplicationUpdateEmail,
};
