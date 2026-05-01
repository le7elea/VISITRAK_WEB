import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./_firebaseAdmin.js";
import {
  assertValidManualTokenRecord,
  buildFeedbackData,
  getManualOfficeMetadata,
  normalizeManualTokenRecord,
} from "./_manualFeedback.js";

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
};

const parseBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

const getSubmissionStatus = (message = "") => {
  if (message.includes("could not be found") || message.includes("no longer exists")) {
    return 404;
  }
  if (message.includes("revoked")) return 403;
  if (message.includes("expired") || message.includes("already been used")) return 410;
  if (
    message.includes("invalid") ||
    message.includes("Missing") ||
    message.includes("Answers must")
  ) {
    return 400;
  }
  return 500;
};

const isConfigError = (message = "") =>
  message.includes("Firebase Admin credentials") ||
  message.includes("Invalid PEM formatted message");

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const body = parseBody(req);
    const tokenId = typeof body.tokenId === "string" ? body.tokenId.trim() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const accessKey =
      typeof body.accessKey === "string" ? body.accessKey.trim() : "";
    const feedback =
      body.feedback && typeof body.feedback === "object" ? body.feedback : null;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Missing manual feedback token document ID.",
      });
    }

    if (!token || !accessKey) {
      return res.status(400).json({
        success: false,
        message: "Missing manual feedback token or QR access key.",
      });
    }

    if (
      !feedback?.answers ||
      typeof feedback.answers !== "object" ||
      Object.keys(feedback.answers).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers must be a non-empty object.",
      });
    }

    const db = getAdminDb();
    const tokenRef = db.collection("manualFeedbackTokens").doc(tokenId);
    const feedbackRef = db.collection("feedbacks").doc();

    await db.runTransaction(async (transaction) => {
      const tokenSnap = await transaction.get(tokenRef);
      if (!tokenSnap.exists) {
        throw new Error("This manual feedback approval token no longer exists.");
      }

      const tokenRecord = normalizeManualTokenRecord(tokenSnap);
      assertValidManualTokenRecord(tokenRecord, token, accessKey);

      const nextRemainingUses = Math.max(0, tokenRecord.remainingUses - 1);
      const nextUseCount = tokenRecord.useCount + 1;
      const tokenFullyUsed = nextRemainingUses === 0;
      const { office, officialOfficeName, surveyDetails } =
        getManualOfficeMetadata(feedback, tokenRecord);

      const feedbackData = buildFeedbackData(
        {
          ...feedback,
          surveyDetails,
          visitId: null,
          name: tokenRecord.manualSubmissionDefaults.name || "Anonymous",
          displayName: "Anonymous",
          office,
          officialOfficeName,
          manualEntry: true,
          source:
            tokenRecord.manualSubmissionDefaults.source ||
            tokenRecord.source ||
            "manual-qr",
        },
        {
          manualTokenId: tokenRecord.id,
          manualTokenType: tokenRecord.type || "single",
          approvedOffice: tokenRecord.office || office,
          officialOfficeName,
          approvedBy: tokenRecord.approvedBy || {},
          approvedByLabel: tokenRecord.approvedByLabel,
          createdAt: FieldValue.serverTimestamp(),
        }
      );

      transaction.set(feedbackRef, feedbackData);
      transaction.update(tokenRef, {
        remainingUses: nextRemainingUses,
        useCount: nextUseCount,
        used: tokenFullyUsed,
        status: tokenFullyUsed ? "used" : "active",
        updatedAt: FieldValue.serverTimestamp(),
        lastUsedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({
      success: true,
      data: { id: feedbackRef.id },
    });
  } catch (error) {
    console.error("submit-manual-feedback error:", error);

    const message = String(error?.message || "");
    const status = isConfigError(message) ? 500 : getSubmissionStatus(message);

    return res.status(status).json({
      success: false,
      message: isConfigError(message)
        ? "Server Firebase Admin configuration is invalid. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, or set FIREBASE_SERVICE_ACCOUNT_JSON on Vercel."
        : message || "Failed to submit the manual feedback entry.",
    });
  }
}
