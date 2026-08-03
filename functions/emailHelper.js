/**
 * Email Helper using official Resend SDK.
 */

const { Resend } = require('resend');
require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;
let resendClient = null;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
} else {
  console.warn("WARNING: RESEND_API_KEY is not set in environment.");
}

/**
 * Sends an email using the Resend SDK.
 * 
 * @param {Object} params
 * @param {string} params.to - Candidate's email address
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlBody - HTML content of the email
 * @param {string} params.replyToEmail - Employer's email for replies
 * @param {string} params.companyName - Company name of the employer
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function sendCandidateEmail({ to, subject, htmlBody, replyToEmail, companyName }) {
  if (!resendClient) {
    console.error("Resend client is not initialized because RESEND_API_KEY is missing.");
    return { success: false, error: "Resend API key is missing." };
  }

  const senderName = companyName || "SkillBridge Hiring";
  const fromField = `${senderName} via SkillBridge <onboarding@resend.dev>`;
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const payload = {
      from: fromField,
      to: recipients,
      subject: subject,
      html: htmlBody,
    };

    if (replyToEmail) {
      payload.reply_to = replyToEmail;
    }

    const { data, error } = await resendClient.emails.send(payload);

    if (error) {
      console.error("Resend SDK returned an error:", error);
      return { success: false, error: error.message || error };
    }

    console.log(`Resend SDK successfully sent email to ${recipients.join(", ")} (ID: ${data.id})`);
    return { success: true, data };
  } catch (err) {
    console.error("Exception caught in Resend SDK helper:", err);
    return { success: false, error: err.message || err };
  }
}

module.exports = {
  sendCandidateEmail,
};
