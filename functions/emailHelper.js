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

/**
 * Generates status notification subject and HTML content for application status changes.
 *
 * @param {Object} params
 * @param {string} params.status - Application status ("interview", "selected", "rejected")
 * @param {string} params.studentName - Applicant's name
 * @param {string} params.listingTitle - Job title
 * @param {string} params.companyName - Employer company name
 * @returns {{ subject: string, htmlBody: string }}
 */
function getStatusEmailContent({ status, studentName, listingTitle, companyName }) {
  const normStatus = (status || "").toLowerCase();
  const student = studentName || "Applicant";
  const title = listingTitle || "Job Position";
  const company = companyName || "SkillBridge Partner";

  if (normStatus === "selected") {
    return {
      subject: `🎉 Congratulations! You have been selected for ${title} at ${company}`,
      htmlBody: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">SkillBridge</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Job Application Update</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Dear ${student},</h2>
          <p style="line-height: 1.6; color: #334155;">
            We are thrilled to inform you that <strong>${company}</strong> has reviewed your application and selected you for the <strong>${title}</strong> position!
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">Application Details:</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Role:</strong> ${title}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Selected</span></p>
          </div>
          
          <p style="line-height: 1.6; color: #334155;">
            Log into your SkillBridge dashboard to view details and manage your applications.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Sent automatically via SkillBridge Hiring Platform
          </div>
        </div>
      `,
    };
  } else if (normStatus === "interview") {
    return {
      subject: `You've been invited to interview for ${title} at ${company}`,
      htmlBody: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">SkillBridge</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Interview Invitation</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Dear ${student},</h2>
          <p style="line-height: 1.6; color: #334155;">
            Great news! <strong>${company}</strong> would like to invite you for an interview for the <strong>${title}</strong> position.
          </p>
          <p style="line-height: 1.6; color: #334155;">
            The hiring team will follow up shortly with specific details regarding the date, time, and format of the interview (such as a video link, phone call, or in-person meeting). Please check your email regularly and be ready to reply to coordinate next steps.
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">Application Details:</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Role:</strong> ${title}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Status:</strong> <span style="color: #2563eb; font-weight: 600;">Interview Invited</span></p>
          </div>
          
          <p style="line-height: 1.6; color: #334155;">
            Log into your SkillBridge dashboard to view details and manage your applications.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Sent automatically via SkillBridge Hiring Platform
          </div>
        </div>
      `,
    };
  } else {
    // Rejected
    return {
      subject: `Update regarding your application for ${title} at ${company}`,
      htmlBody: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">SkillBridge</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Job Application Update</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Dear ${student},</h2>
          <p style="line-height: 1.6; color: #334155;">
            Thank you for taking the time to apply for the <strong>${title}</strong> position at <strong>${company}</strong>. After careful review, the hiring team has decided to move forward with other candidates at this time.
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">Application Details:</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Role:</strong> ${title}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: 600;">Not Selected</span></p>
          </div>
          
          <p style="line-height: 1.6; color: #334155;">
            Log into your SkillBridge dashboard to view details and manage your applications.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Sent automatically via SkillBridge Hiring Platform
          </div>
        </div>
      `,
    };
  }
}

module.exports = {
  sendCandidateEmail,
  getStatusEmailContent,
};
