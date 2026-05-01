import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const sanitizeMultilineSecret = (value = "") => {
  if (!value) return "";

  const trimmed = String(value)
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

  const expanded = trimmed.includes("\\n")
    ? trimmed.replace(/\\n/g, "\n")
    : trimmed;

  if (
    expanded.includes("-----BEGIN PRIVATE KEY-----") &&
    expanded.includes("-----END PRIVATE KEY-----")
  ) {
    const body = expanded
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s+/g, "");

    const wrappedBody = body.match(/.{1,64}/g)?.join("\n") || body;
    return `-----BEGIN PRIVATE KEY-----\n${wrappedBody}\n-----END PRIVATE KEY-----\n`;
  }

  return expanded;
};

const parseServiceAccountFromEnv = () => {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT,
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    process.env.GCP_SERVICE_ACCOUNT_JSON,
  ].filter(Boolean);

  for (const rawValue of candidates) {
    const raw = String(rawValue).trim();

    try {
      return JSON.parse(raw);
    } catch {
      // Fall through to base64 decoding attempt.
    }

    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch {
      // Ignore invalid values and continue checking other candidates.
    }
  }

  return null;
};

const resolveAdminCredentials = () => {
  const serviceAccount = parseServiceAccountFromEnv();

  const projectId =
    serviceAccount?.project_id ||
    serviceAccount?.projectId ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    "";

  const clientEmail =
    serviceAccount?.client_email ||
    serviceAccount?.clientEmail ||
    process.env.FIREBASE_CLIENT_EMAIL ||
    "";

  const privateKey = sanitizeMultilineSecret(
    serviceAccount?.private_key ||
      serviceAccount?.privateKey ||
      process.env.FIREBASE_PRIVATE_KEY
  );

  return {
    projectId: String(projectId).trim(),
    clientEmail: String(clientEmail).trim(),
    privateKey,
  };
};

export const getAdminDb = () => {
  if (!getApps().length) {
    const credentials = resolveAdminCredentials();

    if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
      throw new Error(
        "Firebase Admin credentials are missing or invalid. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON)."
      );
    }

    initializeApp({
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
    });
  }

  return getFirestore();
};
