const admin = require("firebase-admin");
const { sendApplicationUpdateEmail } = require("../services/emailService");

// Ensure firebase-admin is initialized. If initialized elsewhere in the app, this will reuse the instance.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Express Controller function to update a job application status and send an email notification.
 * 
 * Expected route: PUT /api/applications/:applicationId/status OR POST /api/applications/update-status
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateApplicationStatus(req, res) {
  try {
    // Retrieve applicationId from request params or body, and status details from body
    const applicationId = req.params.applicationId || req.body.applicationId;
    const { newStatus, additionalMessage } = req.body;

    // Validate inputs
    if (!applicationId) {
      return res.status(400).json({ 
        success: false, 
        error: "applicationId is required in request parameters or body." 
      });
    }

    if (!newStatus) {
      return res.status(400).json({ 
        success: false, 
        error: "newStatus is required in request body." 
      });
    }

    // 1. Fetch the application document from Firestore to verify existence and get keys
    const appRef = db.collection("applications").doc(applicationId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: `Application with ID ${applicationId} not found.` 
      });
    }

    const appData = appDoc.data();
    
    // 2. Resolve Student ID and details (Name & Email)
    const studentId = appData.studentId || appData.userId || appData.applicantId;
    let studentEmail = appData.studentEmail || appData.email || null;
    let studentName = appData.studentName || appData.applicantName || "Applicant";

    // If details are missing or generic, fetch them from fallback collections (users or studentProfiles)
    if (studentId && (!studentEmail || studentName === "Applicant")) {
      // Try checking the general "users" collection first
      const userDoc = await db.collection("users").doc(studentId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        studentEmail = studentEmail || userData.email;
        studentName = userData.displayName || userData.fullName || userData.name || studentName;
      }

      // Try checking "studentProfiles" collection as fallback
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
    // Fallback/Override student email for testing purposes
    if (!studentEmail || studentEmail.includes('example.com') || studentEmail.includes('mock') || !studentEmail.includes('@')) {
      studentEmail = 'zameeralam436@gmail.com';
    }

    // Verify we have a recipient email
    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        error: "Unable to update status: Student email address could not be resolved."
      });
    }

    // 3. Resolve Listing Details (Job Title & Company Name)
    const listingId = appData.listingId || appData.jobId;
    let jobTitle = appData.listingTitle || appData.jobTitle || "Job Position";
    let companyName = appData.companyName || "SkillBridge Partner";

    if (listingId && (!appData.listingTitle || !appData.companyName)) {
      const listingDoc = await db.collection("listings").doc(listingId).get();
      if (listingDoc.exists) {
        const listingData = listingDoc.data();
        jobTitle = listingData.title || jobTitle;
        
        // Fetch company name from employer profile if listing has an employerId
        if (listingData.employerId && !appData.companyName) {
          const empDoc = await db.collection("employerProfiles").doc(listingData.employerId).get();
          if (empDoc.exists) {
            companyName = empDoc.data().companyName || companyName;
          }
        }
      }
    }

    // 4. Update the application document in Firestore with the new status
    await appRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Call sendApplicationUpdateEmail from the emailService
    // We await this to capture SMTP issues and report them to the client
    const emailResult = await sendApplicationUpdateEmail(
      studentEmail,
      studentName,
      companyName,
      jobTitle,
      newStatus,
      additionalMessage
    );

    // 6. Return a success response to the client
    return res.status(200).json({
      success: true,
      message: `Application status successfully updated to '${newStatus}'.`,
      notification: emailResult.success ? "Sent successfully" : "Failed to send email",
      emailError: emailResult.success ? null : emailResult.error,
      applicationDetails: {
        applicationId,
        newStatus,
        studentName,
        studentEmail,
        companyName,
        jobTitle
      }
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error occurred while updating application status.",
      details: error.message || error
    });
  }
}

module.exports = {
  updateApplicationStatus,
};
