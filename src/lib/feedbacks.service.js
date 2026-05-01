import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
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

const normalizeManualTokenApiRecord = (record = {}) => ({
  ...record,
  expiresAt: toDateValue(record.expiresAt),
});

const parseManualApiResponse = async (response, fallbackMessage) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload?.data;
};

const callManualFeedbackApi = async (endpoint, payload, fallbackMessage) => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await parseManualApiResponse(response, fallbackMessage);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
};

const buildManualApiNetworkError = (error, fallbackMessage) => {
  if (error instanceof TypeError) {
    return new Error(
      "Could not reach the server for manual feedback processing. Please check the internet connection and try again."
    );
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new Error(
      "Could not reach the server for manual feedback processing. Please check the internet connection and try again."
    );
  }

  return new Error(fallbackMessage);
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
    const tokenRecord = await callManualFeedbackApi(
      "/api/validate-manual-feedback",
      {
        token: cleanToken,
        accessKey: cleanAccessKey,
      },
      "Failed to validate the manual feedback approval token."
    );

    return normalizeManualTokenApiRecord(tokenRecord);
  } catch (error) {
    console.error("Error validating manual feedback token:", error);
    throw buildManualApiNetworkError(
      error,
      "Failed to validate the manual feedback approval token."
    );
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

    return await callManualFeedbackApi(
      "/api/submit-manual-feedback",
      {
        tokenId,
        token,
        accessKey,
        feedback: {
          ...feedback,
          surveyDetails: removeUndefinedDeep(feedback.surveyDetails || {}),
        },
      },
      "Failed to submit the manual feedback entry."
    );
  } catch (error) {
    console.error("Error submitting manual feedback:", error);
    throw buildManualApiNetworkError(
      error,
      "Failed to submit the manual feedback entry."
    );
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
