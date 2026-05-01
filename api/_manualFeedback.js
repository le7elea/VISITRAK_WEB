const toTrimmedText = (value) =>
  typeof value === "string" ? value.trim() : "";

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
    ? answerValues.reduce((sum, value) => sum + Number(value), 0) / answerValues.length
    : 0;
};

export const buildFeedbackData = (feedback, overrides = {}) => {
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

export const normalizeManualTokenRecord = (docSnap) => {
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
  };
};

export const assertValidManualTokenRecord = (tokenRecord, token, accessKey) => {
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

export const serializeManualTokenRecord = (tokenRecord) => ({
  id: tokenRecord.id,
  mode: tokenRecord.mode,
  type: tokenRecord.type,
  source: tokenRecord.source,
  status: tokenRecord.status,
  revoked: tokenRecord.revoked,
  used: tokenRecord.used,
  expiresAt: tokenRecord.expiresAt ? tokenRecord.expiresAt.toISOString() : null,
  maxUses: tokenRecord.maxUses,
  remainingUses: tokenRecord.remainingUses,
  useCount: tokenRecord.useCount,
  office: tokenRecord.office,
  officialOfficeName: tokenRecord.officialOfficeName,
  approvedBy: tokenRecord.approvedBy,
  approvedByLabel: tokenRecord.approvedByLabel,
  manualSubmissionDefaults: tokenRecord.manualSubmissionDefaults,
});

export const getManualOfficeMetadata = (feedback, tokenRecord) => {
  const surveyDetails = removeUndefinedDeep(feedback.surveyDetails || {});
  const office =
    toTrimmedText(feedback.office) ||
    toTrimmedText(tokenRecord.office) ||
    toTrimmedText(surveyDetails.unitOfficeVisited);
  const officialOfficeName =
    toTrimmedText(feedback.officialOfficeName) ||
    toTrimmedText(tokenRecord.officialOfficeName) ||
    office;

  return {
    office,
    officialOfficeName,
    surveyDetails,
  };
};
