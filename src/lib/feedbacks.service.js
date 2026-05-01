import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const removeUndefinedDeep = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, childValue]) => {
      const cleanedValue = removeUndefinedDeep(childValue);
      if (cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }

  return value;
};

const toTrimmedText = (value) =>
  typeof value === "string" ? value.trim() : "";

const toDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value.toDate === "function") {
    const converted = value.toDate();
    return converted instanceof Date && !Number.isNaN(converted.getTime())
      ? converted
      : null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const calculateAverageRatingValue = (answers = {}) => {
  const answerValues = Object.values(answers || {});
  return answerValues.length > 0
    ? answerValues.reduce((sum, val) => sum + Number(val), 0) / answerValues.length
    : 0;
};

const buildFeedbackData = (feedback, overrides = {}) => {
  const surveyDetails = removeUndefinedDeep(feedback.surveyDetails || {});
  const office =
    toTrimmedText(feedback.office) ||
    toTrimmedText(surveyDetails.unitOfficeVisited) ||
    toTrimmedText(surveyDetails.office);
  const officialOfficeName =
    toTrimmedText(feedback.officialOfficeName) ||
    toTrimmedText(surveyDetails.officialOfficeName);

  return {
    visitId: feedback.visitId || null,
    name: feedback.name || "Anonymous",
    displayName: feedback.displayName || feedback.name || "Anonymous",
    answers: feedback.answers,
    averageRating: calculateAverageRatingValue(feedback.answers),
    suggestion: feedback.suggestion ?? surveyDetails.suggestion ?? "",
    commendation: feedback.commendation ?? surveyDetails.commendation ?? "",
    surveyDetails,
    office,
    officialOfficeName,
    manualEntry: feedback.manualEntry === true,
    source: feedback.source || (feedback.manualEntry ? "manual" : "qr"),
    ...overrides,
  };
};

const normalizeManualTokenRecord = (docSnap) => {
  const data = docSnap.data() || {};
  const manualSubmissionDefaults =
    removeUndefinedDeep(data.manualSubmissionDefaults || {});
  const maxUses = Number.isFinite(Number(data.maxUses))
    ? Number(data.maxUses)
    : 1;
  const remainingUses = Number.isFinite(Number(data.remainingUses))
    ? Number(data.remainingUses)
    : maxUses;
  const useCount = Number.isFinite(Number(data.useCount))
    ? Number(data.useCount)
    : 0;
  const office =
    toTrimmedText(manualSubmissionDefaults.office) ||
    toTrimmedText(data.office);
  const officialOfficeName =
    toTrimmedText(manualSubmissionDefaults.officialOfficeName) ||
    toTrimmedText(data.officialOfficeName) ||
    office;

  return {
    id: docSnap.id,
    token: toTrimmedText(data.token),
    accessKey: toTrimmedText(data.accessKey),
    mode: toTrimmedText(data.mode),
    type: toTrimmedText(data.type),
    source: toTrimmedText(data.source),
    status: toTrimmedText(data.status) || "active",
    revoked: data.revoked === true,
    used: data.used === true,
    expiresAt: toDateValue(data.expiresAt),
    maxUses,
    remainingUses,
    useCount,
    office,
    officialOfficeName,
    approvedBy: data.approvedBy || {},
    approvedByLabel: toTrimmedText(data.approvedByLabel),
    manualSubmissionDefaults,
    raw: data,
  };
};

const assertValidManualTokenRecord = (tokenRecord, token, accessKey) => {
  const cleanToken = toTrimmedText(token).toUpperCase();
  const cleanAccessKey = toTrimmedText(accessKey).toUpperCase();

  if (!tokenRecord) {
    throw new Error("This manual feedback approval token could not be found.");
  }

  if (!tokenRecord.token || tokenRecord.token.toUpperCase() !== cleanToken) {
    throw new Error("This manual feedback approval token is invalid.");
  }

  if (
    !tokenRecord.accessKey ||
    tokenRecord.accessKey.toUpperCase() !== cleanAccessKey
  ) {
    throw new Error("This manual feedback QR access key is invalid.");
  }

  if (tokenRecord.mode && tokenRecord.mode.toLowerCase() !== "manual") {
    throw new Error("This approval token is not configured for manual feedback.");
  }

  if (tokenRecord.source && tokenRecord.source.toLowerCase() !== "manual-qr") {
    throw new Error("This approval token was not issued for manual QR feedback.");
  }

  if (tokenRecord.revoked) {
    throw new Error("This manual feedback approval was revoked by the admin.");
  }

  if (!tokenRecord.expiresAt) {
    throw new Error("This manual feedback approval is missing an expiration date.");
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    throw new Error("This manual feedback approval has expired.");
  }

  if (
    tokenRecord.used ||
    tokenRecord.status.toLowerCase() === "used" ||
    tokenRecord.remainingUses <= 0
  ) {
    throw new Error("This manual feedback approval has already been used.");
  }
};

const buildManualTokenReadError = (error) => {
  if (error?.code === "permission-denied") {
    return new Error(
      "Manual QR validation is blocked by Firestore permissions. Allow the website to read manual feedback tokens or add a validator endpoint."
    );
  }

  if (error?.code === "unavailable") {
    return new Error(
      "Could not reach Firestore to validate this manual feedback QR. Please check the internet connection and try again."
    );
  }

  if (error?.message) {
    return error;
  }

  return new Error("Failed to validate the manual feedback approval token.");
};

const buildManualSubmissionError = (error) => {
  if (error?.code === "permission-denied") {
    return new Error(
      "Manual QR submission is blocked by Firestore permissions. Allow feedback writes and token redemption, or move token redemption to a secure backend."
    );
  }

  if (error?.code === "unavailable") {
    return new Error(
      "Could not submit the manual feedback right now. Please check the internet connection and try again."
    );
  }

  if (error?.message) {
    return error;
  }

  return new Error("Failed to submit the manual feedback entry.");
};

/**
 * Add feedback linked to a visit.
 */
export const addFeedback = async (feedback) => {
  try {
    if (!feedback.visitId || !feedback.name || !feedback.answers) {
      throw new Error("Missing required fields: visitId, name, or answers.");
    }

    if (
      typeof feedback.answers !== "object" ||
      Object.keys(feedback.answers).length === 0
    ) {
      throw new Error("Answers must be a non-empty object.");
    }

    if (!db) {
      throw new Error("Firebase db is not initialized.");
    }

    const feedbackData = {
      ...buildFeedbackData(feedback),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "feedbacks"), feedbackData);
    return { id: docRef.id, ...feedbackData };
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
};

export const validateManualFeedbackToken = async ({ token, accessKey }) => {
  const cleanToken = toTrimmedText(token);
  const cleanAccessKey = toTrimmedText(accessKey);

  if (!cleanToken || !cleanAccessKey) {
    throw new Error("Missing manual feedback token or QR access key.");
  }

  try {
    const tokenQuery = query(
      collection(db, "manualFeedbackTokens"),
      where("token", "==", cleanToken),
      limit(1)
    );

    const snapshot = await getDocs(tokenQuery);
    if (snapshot.empty) {
      throw new Error("This manual feedback approval token is invalid.");
    }

    const tokenRecord = normalizeManualTokenRecord(snapshot.docs[0]);
    assertValidManualTokenRecord(tokenRecord, cleanToken, cleanAccessKey);
    return tokenRecord;
  } catch (error) {
    console.error("Error validating manual feedback token:", error);
    throw buildManualTokenReadError(error);
  }
};

export const submitManualFeedback = async ({
  tokenId,
  token,
  accessKey,
  feedback,
}) => {
  try {
    if (!tokenId) {
      throw new Error("Missing manual feedback token document ID.");
    }

    if (
      !feedback?.answers ||
      typeof feedback.answers !== "object" ||
      Object.keys(feedback.answers).length === 0
    ) {
      throw new Error("Answers must be a non-empty object.");
    }

    const tokenRef = doc(db, "manualFeedbackTokens", tokenId);
    const feedbackRef = doc(collection(db, "feedbacks"));

    await runTransaction(db, async (transaction) => {
      const tokenSnap = await transaction.get(tokenRef);
      if (!tokenSnap.exists()) {
        throw new Error("This manual feedback approval token no longer exists.");
      }

      const tokenRecord = normalizeManualTokenRecord(tokenSnap);
      assertValidManualTokenRecord(tokenRecord, token, accessKey);

      const nextRemainingUses = Math.max(0, tokenRecord.remainingUses - 1);
      const nextUseCount = tokenRecord.useCount + 1;
      const tokenFullyUsed = nextRemainingUses === 0;
      const surveyDetails = removeUndefinedDeep(feedback.surveyDetails || {});
      const office =
        toTrimmedText(feedback.office) ||
        toTrimmedText(tokenRecord.office) ||
        toTrimmedText(surveyDetails.unitOfficeVisited);
      const officialOfficeName =
        toTrimmedText(feedback.officialOfficeName) ||
        toTrimmedText(tokenRecord.officialOfficeName) ||
        office;

      const feedbackData = buildFeedbackData(
        {
          ...feedback,
          visitId: null,
          name:
            toTrimmedText(tokenRecord.manualSubmissionDefaults.name) ||
            "Anonymous",
          displayName: "Anonymous",
          office,
          officialOfficeName,
          manualEntry: true,
          source:
            toTrimmedText(tokenRecord.manualSubmissionDefaults.source) ||
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
          createdAt: serverTimestamp(),
        }
      );

      transaction.set(feedbackRef, feedbackData);
      transaction.update(tokenRef, {
        remainingUses: nextRemainingUses,
        useCount: nextUseCount,
        used: tokenFullyUsed,
        status: tokenFullyUsed ? "used" : "active",
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp(),
      });
    });

    return { id: feedbackRef.id };
  } catch (error) {
    console.error("Error submitting manual feedback:", error);
    throw buildManualSubmissionError(error);
  }
};

/**
 * Fetch all feedbacks, optionally filtered by visitId.
 */
export const fetchFeedbacks = async (visitId = null) => {
  try {
    let currentQuery = collection(db, "feedbacks");
    if (visitId) {
      currentQuery = query(
        currentQuery,
        where("visitId", "==", visitId),
        orderBy("createdAt", "desc")
      );
    } else {
      currentQuery = query(currentQuery, orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(currentQuery);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time feedbacks.
 */
export const subscribeFeedbacks = (callback, visitId = null) => {
  let currentQuery = collection(db, "feedbacks");
  if (visitId) {
    currentQuery = query(
      currentQuery,
      where("visitId", "==", visitId),
      orderBy("createdAt", "desc")
    );
  } else {
    currentQuery = query(currentQuery, orderBy("createdAt", "desc"));
  }

  return onSnapshot(currentQuery, (snapshot) => {
    const feedbacks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(feedbacks);
  });
};

/**
 * Calculate average rating across multiple feedbacks.
 */
export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks.length) return 0;
  const total = feedbacks.reduce((sum, feedback) => sum + (feedback.averageRating || 0), 0);
  return total / feedbacks.length;
};
