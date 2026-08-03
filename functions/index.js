/**
 * SkillBridge Candidate & Job Matching Algorithm (Cloud Function)
 * 
 * SCORING WEIGHTS BREAKDOWN (Total: 100 Points):
 * -----------------------------------------------------------------------------
 * 1. Skill Overlap (40% / max 40 points):
 *    Calculated as: (matchedSkillsCount / listing.skillsRequired.length) * 40
 *    Case-insensitive matching between student.skills and listing.skillsRequired.
 * 
 * 2. Location & Remote Alignment (20% / max 20 points):
 *    - Full 20 pts: Student remotePreference is "Remote"/"Remote Only" and listing is remote,
 *      OR student location matches listing location (case-insensitive substring match).
 *    - Partial 10 pts: Student remotePreference is "Any" or "Flexible".
 *    - 0 pts: No location/remote match.
 * 
 * 3. Interest & Major Keyword Relevance (30% / max 30 points):
 *    Checks if student's major or interest keywords appear in listing.title or listing.description.
 *    - Major match: 15 pts
 *    - Interest match: 15 pts
 * 
 * 4. Recency (10% / max 10 points):
 *    Newer listings score higher on a linear scale relative to the oldest/newest listings
 *    in the current result set.
 *    Formula: 10 * (createdAt - minCreatedAt) / (maxCreatedAt - minCreatedAt)
 * -----------------------------------------------------------------------------
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { sendCandidateEmail } = require("./emailHelper");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

/**
 * Callable Cloud Function: getMatchedListings
 * Expects an authenticated user call. Returns top 20 job listings tailored to the student's profile.
 */
exports.getMatchedListings = onCall({ cors: true }, async (request) => {
  // 1. Enforce Authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The getMatchedListings function requires an authenticated user."
    );
  }

  const uid = request.auth.uid;

  try {
    // 2. Fetch Student Profile
    const studentDoc = await db.collection("studentProfiles").doc(uid).get();

    if (!studentDoc.exists) {
      throw new HttpsError(
        "failed-precondition",
        "Student profile not found. Please complete your student profile before requesting matches."
      );
    }

    const studentProfile = studentDoc.data() || {};
    const studentSkills = Array.isArray(studentProfile.skills)
      ? studentProfile.skills.map((s) => s.toLowerCase().trim())
      : [];
    const studentInterests = Array.isArray(studentProfile.interests)
      ? studentProfile.interests.map((i) => i.toLowerCase().trim())
      : [];
    const studentMajor = (studentProfile.major || "").toLowerCase().trim();
    const studentLocation = (studentProfile.location || "").toLowerCase().trim();
    const studentRemotePref = (
      studentProfile.remotePreference ||
      studentProfile.remotePref ||
      ""
    )
      .toLowerCase()
      .trim();

    // 3. Fetch Approved Job Listings
    const listingsSnap = await db
      .collection("listings")
      .where("status", "==", "approved")
      .get();

    if (listingsSnap.empty) {
      return [];
    }

    // 4. Batch Fetch Employer Profiles for Company Names
    const employerIds = [
      ...new Set(
        listingsSnap.docs
          .map((doc) => doc.data().employerId)
          .filter(Boolean)
      ),
    ];

    const employerMap = {};
    if (employerIds.length > 0) {
      const employerRefs = employerIds.map((id) =>
        db.collection("employerProfiles").doc(id)
      );
      const employerDocs = await db.getAll(...employerRefs);
      employerDocs.forEach((docSnap) => {
        if (docSnap.exists) {
          const empData = docSnap.data();
          employerMap[docSnap.id] = empData.companyName || "Verified Partner";
        }
      });
    }

    // 5. Determine Recency Time Range for Linear Scaling
    let minTime = Infinity;
    let maxTime = -Infinity;

    const rawListings = listingsSnap.docs.map((docSnap) => {
      const data = docSnap.data();

      let timeVal = Date.now();
      if (data.createdAt && typeof data.createdAt.toMillis === "function") {
        timeVal = data.createdAt.toMillis();
      } else if (data.createdAt && data.createdAt._seconds) {
        timeVal = data.createdAt._seconds * 1000;
      } else if (typeof data.createdAt === "number") {
        timeVal = data.createdAt;
      }

      if (timeVal < minTime) minTime = timeVal;
      if (timeVal > maxTime) maxTime = timeVal;

      return {
        id: docSnap.id,
        data,
        timeVal,
      };
    });

    // 6. Calculate Match Scores & Reasons
    const scoredListings = rawListings.map(({ id, data, timeVal }) => {
      const skillsRequired = Array.isArray(data.skillsRequired)
        ? data.skillsRequired
        : Array.isArray(data.skills)
        ? data.skills
        : [];

      // A) Skill Overlap (40% max)
      const matchedSkillNames = [];
      skillsRequired.forEach((reqSkill) => {
        const normalized = reqSkill.toLowerCase().trim();
        if (studentSkills.includes(normalized)) {
          matchedSkillNames.push(reqSkill);
        }
      });

      let skillScore = 0;
      if (skillsRequired.length > 0) {
        skillScore = (matchedSkillNames.length / skillsRequired.length) * 40;
      }

      // B) Location & Remote Alignment (20% max)
      let locationScore = 0;
      let locationMatchReason = null;

      const isRemoteListing =
        data.remote === true ||
        data.isRemote === true ||
        (data.location && data.location.toLowerCase().includes("remote"));
      const listingLocation = (data.location || "").toLowerCase().trim();

      const isStudentRemote =
        studentRemotePref.includes("remote");
      const isStudentFlexible =
        studentRemotePref.includes("any") || studentRemotePref.includes("flexible");

      const locationMatches =
        studentLocation &&
        listingLocation &&
        (listingLocation.includes(studentLocation) ||
          studentLocation.includes(listingLocation));

      if ((isStudentRemote && isRemoteListing) || locationMatches) {
        locationScore = 20;
        locationMatchReason = isRemoteListing
          ? "Remote alignment"
          : `Location match (${data.location})`;
      } else if (isStudentFlexible) {
        locationScore = 10;
        locationMatchReason = "Flexible work preference";
      }

      // C) Major & Interest Relevance (30% max)
      let interestScore = 0;
      let majorMatched = false;
      let interestMatched = false;

      const titleAndDesc = `${data.title || ""} ${data.description || ""}`.toLowerCase();

      // Check Major words (>2 chars)
      if (studentMajor) {
        const majorWords = studentMajor.split(/[^a-z0-9]+/i).filter((w) => w.length > 2);
        if (majorWords.some((word) => titleAndDesc.includes(word))) {
          majorMatched = true;
          interestScore += 15;
        }
      }

      // Check Interests
      if (studentInterests.length > 0) {
        if (studentInterests.some((interest) => titleAndDesc.includes(interest))) {
          interestMatched = true;
          interestScore += 15;
        }
      }

      // D) Recency Score (10% max)
      let recencyScore = 10;
      if (maxTime > minTime) {
        recencyScore = ((timeVal - minTime) / (maxTime - minTime)) * 10;
      }

      // Final Total Score (capped at 100)
      const totalScore = Math.min(
        100,
        Math.round(skillScore + locationScore + interestScore + recencyScore)
      );

      // Construct Plain-Language Match Reason String
      const reasonParts = [];
      if (matchedSkillNames.length > 0) {
        reasonParts.push(`skills (${matchedSkillNames.join(", ")})`);
      }
      if (majorMatched) {
        reasonParts.push(`your ${studentProfile.major || "major"}`);
      }
      if (interestMatched) {
        reasonParts.push("career interests");
      }
      if (locationMatchReason) {
        reasonParts.push(locationMatchReason.toLowerCase());
      }

      let matchReason = "Recommended based on overall profile match";
      if (reasonParts.length > 0) {
        if (reasonParts.length === 1) {
          matchReason = `Matched on ${reasonParts[0]}`;
        } else {
          const last = reasonParts.pop();
          matchReason = `Matched on ${reasonParts.join(", ")}, and ${last}`;
        }
      }

      const companyName = employerMap[data.employerId] || data.companyName || "Employer Partner";

      return {
        listingId: id,
        title: data.title || "Untitled Role",
        description: data.description || "",
        employerId: data.employerId || null,
        companyName,
        location: data.location || "Unspecified",
        remote: Boolean(data.remote || data.isRemote),
        type: data.type || "Full-time",
        status: data.status || "approved",
        skillsRequired,
        createdAt: data.createdAt || null,
        matchScore: totalScore,
        matchReason,
      };
    });

    // 7. Sort Descending by matchScore & Return Top 20
    scoredListings.sort((a, b) => b.matchScore - a.matchScore);

    return scoredListings.slice(0, 20);
  } catch (err) {
    console.error("Error executing getMatchedListings function:", err);
    if (err instanceof HttpsError) {
      throw err;
    }
    throw new HttpsError(
      "internal",
      "Failed to fetch matched listings. Please try again later.",
      err.message
    );
  }
});

/**
 * Firestore Trigger: sendSelectionEmail
 * Watches applications/{appId} updates and sends notification emails via Resend
 * when application status changes to "Selected" or "Rejected".
 */
exports.sendSelectionEmail = onDocumentUpdated(
  {
    document: "applications/{appId}",
  },
  async (event) => {
    try {
      const beforeData = event.data.before ? event.data.before.data() : null;
      const afterData = event.data.after ? event.data.after.data() : null;

      if (!beforeData || !afterData) return;

      const oldStatus = (beforeData.status || "").toLowerCase();
      const newStatus = (afterData.status || "").toLowerCase();

    // Only fire when status changes to "selected" or "rejected"
      if (oldStatus === newStatus || !["selected", "rejected"].includes(newStatus)) {
        return;
      }

      const studentId = afterData.studentId || afterData.userId || afterData.applicantId;
      const listingId = afterData.listingId || afterData.jobId;

      let studentEmail = afterData.studentEmail || afterData.email || null;
      let studentName = afterData.studentName || afterData.applicantName || "Applicant";

      // 1. Fetch Student Email & Name from users or studentProfiles if not directly on app doc
      if (studentId && (!studentEmail || studentName === "Applicant")) {
        const userDoc = await db.collection("users").doc(studentId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          studentEmail = studentEmail || userData.email;
          studentName = userData.displayName || userData.fullName || userData.name || studentName;
        }

        if (!studentEmail) {
          const profileDoc = await db.collection("studentProfiles").doc(studentId).get();
          if (profileDoc.exists) {
            const profileData = profileDoc.data();
            studentEmail = profileData.email;
            if (studentName === "Applicant") {
              studentName = profileData.fullName || profileData.name || "Applicant";
            }
          }
        }
      }

      if (!studentEmail) {
        logger.error(`Cannot send email for application ${event.params.appId}: Student email not found.`);
        return;
      }

      // 2. Fetch Listing Title, Company Name, and Employer details
      let listingTitle = afterData.listingTitle || afterData.jobTitle || "Job Position";
      let companyName = afterData.companyName || "SkillBridge Partner";
      let employerEmail = null;

      let employerId = afterData.employerId || null;

      if (listingId) {
        const listingDoc = await db.collection("listings").doc(listingId).get();
        if (listingDoc.exists) {
          const listingData = listingDoc.data();
          listingTitle = listingData.title || listingTitle;
          if (listingData.employerId) {
            employerId = listingData.employerId;
          }
        }
      }

      if (employerId) {
        // Fetch company name from employer profile
        const empDoc = await db.collection("employerProfiles").doc(employerId).get();
        if (empDoc.exists) {
          companyName = empDoc.data().companyName || companyName;
        }

        // Fetch employer email from users collection
        const empUserDoc = await db.collection("users").doc(employerId).get();
        if (empUserDoc.exists) {
          employerEmail = empUserDoc.data().email || null;
        }
      }

      // 3. Prepare Email Content
      const isSelected = newStatus === "selected";
      const subject = isSelected
        ? `🎉 Congratulations! You have been selected for ${listingTitle} at ${companyName}`
        : `Update regarding your application for ${listingTitle} at ${companyName}`;

      const statusBadgeColor = isSelected ? "#16a34a" : "#dc2626";
      const statusText = isSelected ? "Selected" : "Not Selected";

      const bodyHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">SkillBridge</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Job Application Update</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Dear ${studentName},</h2>
          <p style="line-height: 1.6; color: #334155;">
            ${
              isSelected
                ? `We are thrilled to inform you that <strong>${companyName}</strong> has reviewed your application and selected you for the <strong>${listingTitle}</strong> position!`
                : `Thank you for taking the time to apply for the <strong>${listingTitle}</strong> position at <strong>${companyName}</strong>. After careful review, the hiring team has decided to move forward with other candidates at this time.`
            }
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid ${statusBadgeColor}; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">Application Details:</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Role:</strong> ${listingTitle}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Status:</strong> <span style="color: ${statusBadgeColor}; font-weight: 600;">${statusText}</span></p>
          </div>
          
          <p style="line-height: 1.6; color: #334155;">
            Log into your SkillBridge dashboard to view details and manage your applications.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Sent automatically via SkillBridge Hiring Platform
          </div>
        </div>
      `;

      // Fallback routing rule: check student's email. Override if mock/placeholder
      let recipientEmail = studentEmail;
      if (!recipientEmail || recipientEmail.includes("example.com") || recipientEmail.includes("test") || !recipientEmail.includes("@")) {
        logger.info(`[Fallback Routing] Overriding student email '${studentEmail}' to 'zameeralam436@gmail.com' for safe testing.`);
        recipientEmail = "zameeralam436@gmail.com";
      }

      // 4. Send Email via Shared Resend SDK Helper
      const sendResult = await sendCandidateEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: bodyHtml,
        replyToEmail: employerEmail,
        companyName: companyName,
      });

      if (!sendResult.success) {
        logger.error(`Resend SDK error sending email for application ${event.params.appId}:`, sendResult.error);
      } else {
        logger.info(`Successfully sent ${newStatus} email for application ${event.params.appId}`);
      }
    } catch (err) {
      logger.error(`Error in sendSelectionEmail Cloud Function:`, err);
    }
  }
);

/**
 * Callable Cloud Function: sendCandidateMessage
 * Allows an employer to send a custom email message to an applicant for a listing they own.
 */
exports.sendCandidateMessage = onCall(
  { cors: true },
  async (request) => {
    // 1. Enforce Authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The sendCandidateMessage function requires an authenticated user."
      );
    }

    const { applicationId, message, subject } = request.data || {};

    if (!applicationId) {
      throw new HttpsError("invalid-argument", "applicationId is required.");
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      throw new HttpsError("invalid-argument", "message content is required.");
    }

    const employerUid = request.auth.uid;

    try {
      // 2. Fetch Application Document
      const appDoc = await db.collection("applications").doc(applicationId).get();
      if (!appDoc.exists) {
        throw new HttpsError("not-found", "Application not found.");
      }
      const appData = appDoc.data();

      // 3. Fetch Listing Document & Verify Employer Ownership
      const listingId = appData.listingId || appData.jobId;
      if (!listingId) {
        throw new HttpsError("failed-precondition", "Application is missing listingId.");
      }

      const listingDoc = await db.collection("listings").doc(listingId).get();
      if (!listingDoc.exists) {
        throw new HttpsError("not-found", "Associated job listing not found.");
      }
      const listingData = listingDoc.data();

      if (listingData.employerId !== employerUid) {
        throw new HttpsError(
          "permission-denied",
          "You do not have permission to contact applicants for a listing you do not own."
        );
      }

      // 4. Fetch Student Email & Name from users or studentProfiles
      const studentId = appData.studentId || appData.userId || appData.applicantId;
      let studentEmail = appData.studentEmail || appData.email || null;
      let studentName = appData.studentName || appData.applicantName || "Applicant";

      if (studentId && (!studentEmail || studentName === "Applicant")) {
        const userDoc = await db.collection("users").doc(studentId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          studentEmail = studentEmail || userData.email;
          studentName = userData.displayName || userData.fullName || userData.name || studentName;
        }

        if (!studentEmail) {
          const profileDoc = await db.collection("studentProfiles").doc(studentId).get();
          if (profileDoc.exists) {
            const profileData = profileDoc.data();
            studentEmail = profileData.email;
            if (studentName === "Applicant") {
              studentName = profileData.fullName || profileData.name || "Applicant";
            }
          }
        }
      }

      if (!studentEmail) {
        throw new HttpsError("failed-precondition", "Student email address could not be found.");
      }

      let companyName = listingData.companyName || appData.companyName || "Employer Partner";
      let employerEmail = null;

      if (employerUid) {
        // Fetch company name from employer profile
        const empDoc = await db.collection("employerProfiles").doc(employerUid).get();
        if (empDoc.exists) {
          companyName = empDoc.data().companyName || companyName;
        }

        // Fetch employer email from users collection
        const empUserDoc = await db.collection("users").doc(employerUid).get();
        if (empUserDoc.exists) {
          employerEmail = empUserDoc.data().email || null;
        }
      }

      const listingTitle = listingData.title || appData.listingTitle || "Job Position";
      const emailSubject = subject || `Regarding your application for ${listingTitle}`;

      // Construct HTML Email
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">SkillBridge</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Direct Message from Recruiter</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 18px;">Hello ${studentName},</h2>
          <p style="color: #475569; font-size: 14px;">
            You have received a message from <strong>${companyName}</strong> regarding your application for <strong>${listingTitle}</strong>:
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 6px; margin: 20px 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</div>
          
          <p style="line-height: 1.6; color: #334155; font-size: 14px;">
            Please log into your SkillBridge account to reply or manage your applications.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Sent automatically via SkillBridge Hiring Platform
          </div>
        </div>
      `;

      // Fallback routing rule: check student's email. Override if mock/placeholder
      let recipientEmail = studentEmail;
      if (!recipientEmail || recipientEmail.includes("example.com") || recipientEmail.includes("test") || !recipientEmail.includes("@")) {
        logger.info(`[Fallback Routing] Overriding student email '${studentEmail}' to 'zameeralam436@gmail.com' for safe testing.`);
        recipientEmail = "zameeralam436@gmail.com";
      }

      // 5. Send via Shared Resend SDK Helper
      const sendResult = await sendCandidateEmail({
        to: recipientEmail,
        subject: emailSubject,
        htmlBody: emailHtml,
        replyToEmail: employerEmail,
        companyName: companyName,
      });

      if (!sendResult.success) {
        throw new HttpsError("internal", sendResult.error || "Failed to send email message.");
      }

      return { success: true, message: "Candidate email sent successfully." };
    } catch (err) {
      logger.error("Error in sendCandidateMessage function:", err);
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError("internal", err.message || "Failed to process candidate email request.");
    }
  }
);
