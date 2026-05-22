import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";
import {
  addFeedback,
  submitManualFeedback,
  validateManualFeedbackToken,
} from "../src/lib/feedbacks.service";
import { getVisitById } from "../src/lib/visits.service";
import { getOfficeNames } from "../src/lib/info.services";

const ACCESS_PARAM = import.meta.env.VITE_QR_ACCESS_PARAM || "k";
const MANUAL_MODE_VALUE = "manual";
const MANUAL_SESSION_FLAG_KEY = "visitrak.manualTokenValidated";

const ratingQuestions = [
  "Responsiveness (Pag abi-abi).",
  "Reliability (Quality) (Masaligan sa serbisyo).",
  "Access & Facilities (Sayon tuoron ang opisina, komportable ug maayo ang mga pasilidad).",
  "Communication (Pamaagi sa pagpasabot).",
  "Costs (Klaridad sa bayranan).",
  "Integrity (Matuinod-anon, makiangayon, ug patas).",
  "Assurance (Kasiguruhan sa serbisyo).",
  "Outcome (Nahatag ang hustong serbisyo).",
];

const regionOptions = [
  "NONE",
  "NCR",
  "CAR",
  "I",
  "II",
  "III",
  "IV-A",
  "IV-B",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "BARMM",
];

const citizensCharterQuestions = [
  {
    id: "cc1",
    title: "CC1",
    text: "Which of the following best describes your awareness of a CC?",
    optionsGridClass: "grid grid-cols-1 gap-y-2",
    options: [
      { value: "1", label: "1 - I know what a CC is and I saw this office's CC." },
      { value: "2", label: "2 - I know what a CC is but I did not see its office's CC." },
      { value: "3", label: "3 - I learned of the CC only when I saw this office's CC." },
      {
        value: "4",
        label: "4 - I do not know what a CC is and I did not see one in this office.",
        note: "(Answer 'N/A' on CC2 and CC3)",
      },
    ],
  },
  {
    id: "cc2",
    title: "CC2",
    text: "If aware of CC (answered 1-3 in CC1), would you say that the CC of this office was..?",
    optionsGridClass: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2",
    options: [
      { value: "1", label: "1 - Easy to see" },
      { value: "2", label: "2 - Somewhat easy to see" },
      { value: "3", label: "3 - Difficult to see" },
      { value: "4", label: "4 - Not visible at all" },
      { value: "5", label: "5 - N/A" },
    ],
  },
  {
    id: "cc3",
    title: "CC3",
    text: "If aware of CC (answered codes 1-3 in CC1), how much did the CC help you in your transaction?",
    optionsGridClass: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2",
    options: [
      { value: "1", label: "1 - Helped very much" },
      { value: "2", label: "2 - Somewhat helped" },
      { value: "3", label: "3 - Did not help" },
      { value: "4", label: "4 - N/A" },
    ],
  },
];

const CC_NOT_AWARE_VALUE = "4";
const CC2_NA_VALUE = "5";
const CC3_NA_VALUE = "4";
const ccFollowUpQuestionIds = ["cc2", "cc3"];
const isCcFollowUpQuestion = (questionId) => ccFollowUpQuestionIds.includes(questionId);

const metadataLabelClass = "text-xs sm:text-sm font-semibold text-[#1f1f1f]";
const metadataFieldClass =
  "w-full mt-1 rounded-md border border-[#b9b9b9] bg-white px-3 py-2 text-sm text-[#232323] outline-none focus:border-[#7f5bb3] focus:ring-2 focus:ring-[#7f5bb3]/30";

const toTrimmedText = (value) =>
  typeof value === "string" ? value.trim() : "";

const isSpecificManualOffice = (officeValue) => {
  const normalizedOffice = toTrimmedText(officeValue).toLowerCase();
  return Boolean(normalizedOffice && normalizedOffice !== "all offices");
};

const isSelectableOffice = (officeValue) =>
  Boolean(toTrimmedText(officeValue)) &&
  toTrimmedText(officeValue).toLowerCase() !== "all offices";

const StatusScreen = ({ title, message, buttonLabel, onButtonClick }) => (
  <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        {title}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed">
        {message}
      </p>
      {buttonLabel && onButtonClick && (
        <button
          type="button"
          onClick={onButtonClick}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 transition"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  </div>
);

const Satisfaction = () => {
  const { visitId: paramVisitId, visitorName: paramVisitorName } = useParams();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const formCardRef = useRef(null);
  const questionRefs = useRef({});
  const searchParams = new URLSearchParams(location.search);

  const visitId = state?.visitId ?? paramVisitId;
  const visitorName = state?.visitorName ?? paramVisitorName;
  const hasVisitContext = Boolean(visitId && visitorName);
  const requestedMode = toTrimmedText(searchParams.get("mode")).toLowerCase();
  const manualToken = toTrimmedText(searchParams.get("token"));
  const manualAccessKey = toTrimmedText(searchParams.get(ACCESS_PARAM));
  const requestedOffice = toTrimmedText(searchParams.get("office"));
  const isManualTokenRequest =
    !hasVisitContext &&
    requestedMode === MANUAL_MODE_VALUE &&
    manualToken &&
    manualAccessKey;
  const initialShowNameWithFeedback =
    !state?.displayName || state.displayName === visitorName;

  const [answers, setAnswers] = useState({});
  const [commendation, setCommendation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [highlightQuestion, setHighlightQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingVisitOffice, setLoadingVisitOffice] = useState(
    !state?.office && !!visitId
  );
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [manualTokenRecord, setManualTokenRecord] = useState(null);
  const [manualTokenError, setManualTokenError] = useState("");
  const [validatingManualToken, setValidatingManualToken] = useState(false);
  const [officeOptions, setOfficeOptions] = useState([]);

  const [clientType, setClientType] = useState("");
  const [sex, setSex] = useState("");
  const [region, setRegion] = useState("VII");
  const [officeVisited, setOfficeVisited] = useState(state?.office ?? "");
  const [servicesAvailed, setServicesAvailed] = useState(state?.purpose ?? "");
  const [servicedBy, setServicedBy] = useState(state?.staffName ?? "");
  const [showNameWithFeedback, setShowNameWithFeedback] = useState(
    initialShowNameWithFeedback
  );
  const [ccResponses, setCcResponses] = useState({
    cc1: "",
    cc2: "",
    cc3: "",
  });

  const isManualEntryMode = Boolean(manualTokenRecord);
  const isLifetimeManualEntry =
    isManualEntryMode &&
    (manualTokenRecord?.type === "lifetime" || manualTokenRecord?.lifetime === true);
  const usesApplicationFormRules = !isManualEntryMode || isLifetimeManualEntry;
  const manualOfficeLocked = isSpecificManualOffice(manualTokenRecord?.office);
  const displayNameLabel = isManualEntryMode
    ? isLifetimeManualEntry
      ? "LIFETIME FEEDBACK QR"
      : "ANONYMOUS MANUAL ENTRY"
    : visitorName;
  const approvedOfficeLabel =
    manualTokenRecord?.officialOfficeName ||
    manualTokenRecord?.office ||
    requestedOffice;
  const officeSelectLocked = !isManualEntryMode || manualOfficeLocked;

  useEffect(() => {
    let isMounted = true;

    const loadOfficeOptions = async () => {
      try {
        const names = await getOfficeNames();
        if (!isMounted) return;

        const uniqueNames = Array.from(
          new Set(
            names
              .map((name) => toTrimmedText(name))
              .filter((name) => Boolean(name) && isSelectableOffice(name))
          )
        );

        setOfficeOptions(uniqueNames);
      } catch (loadError) {
        if (!isMounted) return;
        console.error("Failed to load office options:", loadError);
        setOfficeOptions([]);
      }
    };

    loadOfficeOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadVisitOffice = async () => {
      if (isManualTokenRequest) {
        setLoadingVisitOffice(false);
        return;
      }

      if (state?.office) {
        setOfficeVisited(state.office);
        setLoadingVisitOffice(false);
        return;
      }

      if (!visitId) {
        setLoadingVisitOffice(false);
        return;
      }

      setLoadingVisitOffice(true);

      try {
        const visit = await getVisitById(visitId);
        if (!isMounted) return;

        setOfficeVisited(visit.office?.trim() || "");
        setServicesAvailed((current) => current || visit.purpose?.trim() || "");
        setServicedBy((current) => current || visit.staffName?.trim() || "");
      } catch (loadError) {
        if (!isMounted) return;
        console.error("Failed to load visit office:", loadError);
      } finally {
        if (isMounted) {
          setLoadingVisitOffice(false);
        }
      }
    };

    loadVisitOffice();

    return () => {
      isMounted = false;
    };
  }, [isManualTokenRequest, state?.office, visitId]);

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!isManualTokenRequest) {
        setManualTokenRecord(null);
        setManualTokenError("");
        setValidatingManualToken(false);
        return;
      }

      setValidatingManualToken(true);
      setManualTokenError("");

      try {
        const tokenRecord = await validateManualFeedbackToken({
          token: manualToken,
          accessKey: manualAccessKey,
        });

        if (!isMounted) return;

        setManualTokenRecord(tokenRecord);
        const tokenOffice = isSelectableOffice(tokenRecord.office)
          ? tokenRecord.office
          : "";
        const urlOffice = isSelectableOffice(requestedOffice) ? requestedOffice : "";
        setOfficeVisited((current) =>
          isSelectableOffice(current) ? current : tokenOffice || urlOffice
        );
        setShowNameWithFeedback(false);
        sessionStorage.setItem(MANUAL_SESSION_FLAG_KEY, "1");
      } catch (validationError) {
        if (!isMounted) return;

        setManualTokenRecord(null);
        setManualTokenError(
          validationError?.message ||
            "This manual feedback QR approval could not be validated."
        );
        sessionStorage.removeItem(MANUAL_SESSION_FLAG_KEY);
      } finally {
        if (isMounted) {
          setValidatingManualToken(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [isManualTokenRequest, manualAccessKey, manualToken, requestedOffice]);

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
    setHighlightQuestion(null);
  };

  const clearValidationError = (fieldName) => {
    setError("");
    setValidationErrors((prev) => {
      if (!prev[fieldName]) return prev;
      return { ...prev, [fieldName]: false };
    });
  };

  const handleCcOptionChange = (questionId, optionValue) => {
    if (
      usesApplicationFormRules &&
      ccResponses.cc1 === CC_NOT_AWARE_VALUE &&
      isCcFollowUpQuestion(questionId)
    ) {
      return;
    }

    clearValidationError(questionId);

    if (
      questionId === "cc1" &&
      optionValue === CC_NOT_AWARE_VALUE &&
      ccResponses.cc1 !== CC_NOT_AWARE_VALUE
    ) {
      clearValidationError("cc2");
      clearValidationError("cc3");
    }

    setCcResponses((prev) => {
      const isTogglingOff = prev[questionId] === optionValue;

      if (questionId === "cc1") {
        if (optionValue === CC_NOT_AWARE_VALUE) {
          if (isTogglingOff) {
            return { ...prev, cc1: "", cc2: "", cc3: "" };
          }

          return !usesApplicationFormRules
            ? { ...prev, cc1: CC_NOT_AWARE_VALUE }
            : {
                ...prev,
                cc1: CC_NOT_AWARE_VALUE,
                cc2: CC2_NA_VALUE,
                cc3: CC3_NA_VALUE,
              };
        }

        const nextCc1 = isTogglingOff ? "" : optionValue;
        if (prev.cc1 === CC_NOT_AWARE_VALUE) {
          return { ...prev, cc1: nextCc1, cc2: "", cc3: "" };
        }

        return { ...prev, cc1: nextCc1 };
      }

      return {
        ...prev,
        [questionId]: isTogglingOff ? "" : optionValue,
      };
    });
  };

  const scrollToQuestion = (questionNumber) => {
    const element = questionRefs.current[questionNumber];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const nonRatingValidation = {
      clientType: usesApplicationFormRules && !clientType,
      sex: usesApplicationFormRules && !sex,
      region: !region,
      officeVisited: !officeVisited,
      cc1: !ccResponses.cc1,
      cc2: !ccResponses.cc2,
      cc3: !ccResponses.cc3,
    };

    setValidationErrors(nonRatingValidation);

    const hasNonRatingErrors = Object.values(nonRatingValidation).some(Boolean);
    if (hasNonRatingErrors) {
      setError(
        !usesApplicationFormRules
          ? "Please complete all required fields in Region/Office and CC questions."
          : "Please complete all required fields in Client Type, Sex, Region/Office, and CC questions."
      );
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setSubmitting(false);
      return;
    }

    if (!isSelectableOffice(officeVisited)) {
      setValidationErrors((current) => ({
        ...current,
        officeVisited: true,
      }));
      setError("Please select a specific office before submitting feedback.");
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setSubmitting(false);
      return;
    }

    const firstUnansweredIndex = ratingQuestions.findIndex(
      (_, index) => answers[index + 1] === undefined
    );

    if (firstUnansweredIndex !== -1) {
      const questionNumber = firstUnansweredIndex + 1;
      scrollToQuestion(questionNumber);
      setHighlightQuestion(questionNumber);
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    try {
      const sanitizedAnswers = {};
      Object.keys(answers).forEach((key) => {
        sanitizedAnswers[key.toString()] = Number(answers[key]);
      });

      const surveyDetails = {
        clientType: clientType || null,
        sex: sex || null,
        region: region || null,
        unitOfficeVisited: officeVisited.trim() || null,
        servicesAvailed: servicesAvailed.trim(),
        servicedBy: servicedBy.trim(),
        commendation: commendation.trim(),
        suggestion: suggestion.trim(),
        citizensCharter: ccResponses,
      };

      if (isManualEntryMode) {
        await submitManualFeedback({
          tokenId: manualTokenRecord.id,
          token: manualToken,
          accessKey: manualAccessKey,
          feedback: {
            name: "Anonymous",
            displayName: "Anonymous",
            office: officeVisited.trim(),
            officialOfficeName:
              manualTokenRecord?.officialOfficeName || officeVisited.trim(),
            answers: sanitizedAnswers,
            suggestion: suggestion.trim(),
            commendation: commendation.trim(),
            surveyDetails,
          },
        });
        sessionStorage.setItem(MANUAL_SESSION_FLAG_KEY, "1");
        navigate("/thankyou", { replace: true });
        return;
      }

      if (!hasVisitContext) {
        setError("Missing visit information. Please try again.");
        setSubmitting(false);
        return;
      }

      const feedbackObject = {
        visitId,
        name: visitorName,
        displayName: showNameWithFeedback ? visitorName : "Anonymous",
        office: officeVisited.trim(),
        answers: sanitizedAnswers,
        suggestion: suggestion.trim(),
        commendation: commendation.trim(),
        surveyDetails,
      };

      await addFeedback(feedbackObject);
      navigate("/thankyou", { replace: true });
    } catch (submitError) {
      console.error("Feedback submit failed:", submitError);
      setError(`Failed to submit feedback: ${submitError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasVisitContext && isManualTokenRequest && validatingManualToken) {
    return (
      <StatusScreen
        title="Validating Manual QR"
        message="Please wait while we confirm this anonymous manual feedback approval token."
      />
    );
  }

  if (!hasVisitContext && isManualTokenRequest && !isManualEntryMode) {
    return (
      <StatusScreen
        title="Manual QR Unavailable"
        message={
          manualTokenError ||
          "This anonymous manual feedback QR approval is not available right now."
        }
        buttonLabel="Go Back"
        onButtonClick={() => navigate("/")}
      />
    );
  }

  if (!hasVisitContext && !isManualEntryMode) {
    return (
      <StatusScreen
        title="Missing Visit Information"
        message="Check out first before opening the feedback form, or use an approved manual feedback QR code."
        buttonLabel="Go Back"
        onButtonClick={() => navigate("/")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483]">
      <Header title="VisiTrak" />

      <div className="px-3 sm:px-5 lg:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-white text-lg sm:text-2xl font-bold tracking-wide">
              CUSTOMER SATISFACTION FEEDBACK FORM
            </h1>
            <p className="text-[#d1b6f8] text-xs sm:text-sm mt-1 tracking-wide">
              VISITOR : <span className="font-semibold">{displayNameLabel}</span>
            </p>
            {isManualEntryMode && (
              <p className="text-[#ead9ff] text-[11px] sm:text-xs mt-2 tracking-wide">
                APPROVED MANUAL ENTRY
                {approvedOfficeLabel ? ` • ${approvedOfficeLabel}` : ""}
                {manualTokenRecord?.expiresAt
                  ? ` • Expires ${manualTokenRecord.expiresAt.toLocaleString()}`
                  : ""}
              </p>
            )}
          </div>

          <div
            ref={formCardRef}
            className="bg-[#efefef] rounded-2xl p-4 sm:p-6 md:p-7 border border-white/80 shadow-xl"
          >
            {isManualEntryMode && !isLifetimeManualEntry ? (
              <div className="mb-4 rounded-xl border border-[#d7caea] bg-white/70 px-4 py-3">
                <p className="text-sm font-semibold text-[#1f1f1f]">
                  Anonymous manual feedback mode is active.
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[#4a3f62] leading-relaxed">
                  This approval QR lets you encode a paper feedback form without a
                  visitor name or visit ID. The submission will be saved as
                  Anonymous.
                </p>
              </div>
            ) : !isManualEntryMode ? (
              <fieldset className="mb-4 rounded-xl border border-[#d7caea] bg-white/70 px-4 py-3">
                <legend className="px-1 text-sm font-semibold text-[#1f1f1f]">
                  Feedback Name Display
                </legend>
                <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-lg border border-[#d2d2d2] bg-white px-3 py-2 text-sm text-[#2f2f2f]">
                  <input
                    type="checkbox"
                    checked={showNameWithFeedback}
                    onChange={(event) => setShowNameWithFeedback(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#552b98]"
                  />
                  <span>
                    <span className="block font-semibold text-[#1f1f1f]">
                      Show my name to the admin with my feedback
                    </span>
                    <span className="block text-xs text-[#5f5f5f]">
                      Your feedback will include your name.
                    </span>
                    {!showNameWithFeedback && (
                      <span className="block text-xs font-medium text-[#7a2f2f]">
                        Your feedback will be saved as Anonymous.
                      </span>
                    )}
                  </span>
                </label>
              </fieldset>
            ) : null}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <fieldset>
                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#2f2f2f] rounded-md px-2 py-1 ${
                    validationErrors.clientType ? "border border-red-400 bg-red-50" : ""
                  }`}
                >
                  <span className={metadataLabelClass}>Client Type:</span>
                  {["Citizen", "Business", "Government"].map((option) => (
                    <label
                      key={option}
                      className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
                    >
                      <input
                        type="checkbox"
                        checked={clientType === option}
                        onChange={() => {
                          clearValidationError("clientType");
                          setClientType((current) => (current === option ? "" : option));
                        }}
                        className="h-3.5 w-3.5 mt-0 rounded-[3px] border-[#808080] align-middle shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <div
                  className={`flex flex-wrap items-center gap-4 text-sm text-[#2f2f2f] rounded-md px-2 py-1 ${
                    validationErrors.sex ? "border border-red-400 bg-red-50" : ""
                  }`}
                >
                  <span className={metadataLabelClass}>Sex:</span>
                  {["Male", "Female"].map((option) => (
                    <label
                      key={option}
                      className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
                    >
                      <input
                        type="checkbox"
                        checked={sex === option}
                        onChange={() => {
                          clearValidationError("sex");
                          setSex((current) => (current === option ? "" : option));
                        }}
                        className="h-3.5 w-3.5 mt-0 rounded-[3px] border-[#808080] align-middle shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="relative">
                <label
                  htmlFor="region-residence"
                  className="absolute -top-2 left-3 px-1.5 bg-[#efefef] text-[#5f5f5f] text-[11px] sm:text-xs font-semibold leading-none z-10"
                >
                  Region of Residence
                </label>
                <select
                  id="region-residence"
                  value={region}
                  onChange={(event) => {
                    clearValidationError("region");
                    setRegion(event.target.value);
                  }}
                  className={`w-full appearance-none rounded-md border bg-transparent px-3 pr-10 py-2.5 text-sm sm:text-base text-[#1f1f1f] outline-none ${
                    validationErrors.region
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#575757] focus:border-[#4b4b4b]"
                  }`}
                >
                  {regionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
              </div>

              <div className="relative">
                <label
                  htmlFor="unit-office-visited"
                  className="absolute -top-2 left-3 px-1.5 bg-[#efefef] text-[#5f5f5f] text-[11px] sm:text-xs font-semibold leading-none z-10"
                >
                  Unit / Office Visited (Gibisita nga opisina)
                </label>
                <select
                  id="unit-office-visited"
                  value={officeVisited}
                  onChange={(event) => {
                    if (officeSelectLocked) return;
                    clearValidationError("officeVisited");
                    setOfficeVisited(event.target.value);
                  }}
                  disabled={officeSelectLocked}
                  className={`w-full appearance-none rounded-md border bg-transparent px-3 pr-10 py-2.5 text-sm sm:text-base text-[#1f1f1f] outline-none ${
                    validationErrors.officeVisited
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#575757] focus:border-[#4b4b4b]"
                  } ${officeSelectLocked ? "cursor-not-allowed bg-[#f3f3f3] text-[#5f5f5f]" : ""}`}
                >
                  <option value="">
                    {isManualEntryMode
                      ? "Select an office"
                      : "Checked-in office will appear here"}
                  </option>
                  {isSelectableOffice(officeVisited) &&
                    !officeOptions.includes(officeVisited) && (
                    <option value={officeVisited}>{officeVisited}</option>
                  )}
                  {officeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <label className={metadataLabelClass}>
                Services Availed (Mga serbisyo nga nadawat) :
                <input
                  type="text"
                  value={servicesAvailed}
                  onChange={(event) => {
                    clearValidationError("servicesAvailed");
                    setServicesAvailed(event.target.value);
                  }}
                  placeholder="Type here..."
                  className={`${metadataFieldClass} ${
                    validationErrors.servicesAvailed
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                />
              </label>

              <label className={metadataLabelClass}>
                Serviced by (Tawo nga naghatag sa serbisyo) :
                <input
                  type="text"
                  value={servicedBy}
                  onChange={(event) => {
                    clearValidationError("servicedBy");
                    setServicedBy(event.target.value);
                  }}
                  placeholder="Type here..."
                  className={`${metadataFieldClass} ${
                    validationErrors.servicedBy
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                />
              </label>
            </div>

            <div className="my-4 border-t-[4px] border-[#6f4aa7]" />

            <p className="text-xs sm:text-sm text-[#2f2f2f] leading-relaxed mb-4">
              Instructions: Tap you answer to the Citizen&apos;s Charter (CC) questions.
              The Citizen&apos;s Charter is an official document that reflects the
              services of a government agency/office including its requirements, fees,
              and processing time among others.
            </p>

            <div className="space-y-5">
              {citizensCharterQuestions.map((question) => (
                <section
                  key={question.id}
                  className={`rounded-md px-2 py-1 ${
                    validationErrors[question.id] ? "border border-red-400 bg-red-50/70" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 mb-2">
                    <span className="text-sm sm:text-base font-semibold text-[#1f1f1f] leading-none sm:pt-[2px]">
                      {question.title}
                    </span>
                    <p className="text-sm sm:text-base text-[#1f1f1f] leading-snug">
                      {question.text}
                    </p>
                  </div>
                  <div className={question.optionsGridClass}>
                    {question.options.map((option) => {
                      const selected = ccResponses[question.id] === option.value;
                      const disabledByCc1 =
                        !isManualEntryMode &&
                        ccResponses.cc1 === CC_NOT_AWARE_VALUE &&
                        isCcFollowUpQuestion(question.id);

                      return (
                        <label
                          key={option.value}
                          className={`inline-flex items-start gap-2 text-xs sm:text-sm leading-snug ${
                            disabledByCc1
                              ? "cursor-not-allowed text-[#737373]"
                              : "cursor-pointer text-[#2f2f2f]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={disabledByCc1}
                            onChange={() => handleCcOptionChange(question.id, option.value)}
                            className="mt-[2px] h-4 w-4 rounded-[4px] border-[#707070] shrink-0 disabled:cursor-not-allowed"
                          />
                          <span>
                            {option.label}
                            {option.note && (
                              <span className="italic"> {option.note}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="my-5 border-t-[4px] border-[#6f4aa7]" />

            <h2 className="text-lg sm:text-xl font-bold text-[#1f1f1f] mb-3">Tap your rate.</h2>

            <div>
              {ratingQuestions.map((text, index) => (
                <div
                  key={index}
                  ref={(element) => {
                    questionRefs.current[index + 1] = element;
                  }}
                  className={index !== ratingQuestions.length - 1 ? "border-b border-[#d7d7d7]" : ""}
                >
                  <Question
                    number={index + 1}
                    text={text}
                    highlight={highlightQuestion === index + 1}
                  >
                    <EmojiRating
                      value={answers[index + 1]}
                      onChange={(value) => handleAnswer(index + 1, value)}
                    />
                  </Question>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1f1f1f] mb-2">
                  Commendations (Mga Pagdayeg)
                </label>
                <textarea
                  value={commendation}
                  onChange={(event) => setCommendation(event.target.value)}
                  maxLength={500}
                  placeholder="Write your commendations here..."
                  rows={4}
                  className="w-full min-h-[110px] sm:min-h-[130px] rounded-2xl border-[3px] border-[#595959] bg-white px-5 py-4 text-sm sm:text-base text-[#2b2b2b] placeholder:text-[#6f6f6f] outline-none resize-none focus:border-[#4b4b4b]"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1f1f1f] mb-2">
                  Suggestions (Mga Sugyot)
                </label>
                <textarea
                  value={suggestion}
                  onChange={(event) => setSuggestion(event.target.value)}
                  maxLength={500}
                  placeholder="Write your suggestions here..."
                  rows={4}
                  className="w-full min-h-[110px] sm:min-h-[130px] rounded-2xl border-[3px] border-[#595959] bg-white px-5 py-4 text-sm sm:text-base text-[#2b2b2b] placeholder:text-[#6f6f6f] outline-none resize-none focus:border-[#4b4b4b]"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loadingVisitOffice || validatingManualToken}
              className={`w-full mt-5 rounded-lg bg-[#552b98] text-white py-3 sm:py-3.5 font-bold tracking-wide transition ${
                submitting || loadingVisitOffice || validatingManualToken
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-[#45207e]"
              }`}
            >
              {submitting
                ? "Submitting..."
                : validatingManualToken
                  ? "Validating QR..."
                  : loadingVisitOffice
                    ? "Loading visit..."
                    : "SUBMIT FEEDBACK"}
            </button>

            <p className="text-center text-[#4b4b4b] text-sm sm:text-base pt-3 pb-1">
              &copy; 2025 LMT. All right reserved.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Incomplete Submission
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-5">
              Please complete all ratings before submitting.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full bg-[#552b98] text-white font-semibold py-2.5 rounded-lg hover:bg-[#45207e] transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Satisfaction;
