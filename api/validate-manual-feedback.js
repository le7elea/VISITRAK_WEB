import { getAdminDb } from "./_firebaseAdmin.js";
import {
  assertValidManualTokenRecord,
  normalizeManualTokenRecord,
  serializeManualTokenRecord,
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

const getValidationStatus = (message = "") => {
  if (message.includes("could not be found")) return 404;
  if (message.includes("revoked")) return 403;
  if (message.includes("expired") || message.includes("already been used")) return 410;
  if (
    message.includes("invalid") ||
    message.includes("manual feedback") ||
    message.includes("expiration date")
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
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const accessKey =
      typeof body.accessKey === "string" ? body.accessKey.trim() : "";

    if (!token || !accessKey) {
      return res.status(400).json({
        success: false,
        message: "Missing manual feedback token or QR access key.",
      });
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection("manualFeedbackTokens")
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "This manual feedback approval token could not be found.",
      });
    }

    const tokenRecord = normalizeManualTokenRecord(snapshot.docs[0]);
    assertValidManualTokenRecord(tokenRecord, token, accessKey);

    return res.status(200).json({
      success: true,
      data: serializeManualTokenRecord(tokenRecord),
    });
  } catch (error) {
    console.error("validate-manual-feedback error:", error);

    const message = String(error?.message || "");
    const status = isConfigError(message) ? 500 : getValidationStatus(message);

    return res.status(status).json({
      success: false,
      message: isConfigError(message)
        ? "Server Firebase Admin configuration is invalid. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, or set FIREBASE_SERVICE_ACCOUNT_JSON on Vercel."
        : message || "Failed to validate the manual feedback approval token.",
    });
  }
}
