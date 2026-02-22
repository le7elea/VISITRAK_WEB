import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";
import { addFeedback } from "../src/lib/feedbacks.service";
import { fetchOffices } from "../src/lib/info.services";

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
      { value: "4", label: "4 - Not visible at all" },
      { value: "2", label: "2 - Somewhat easy to see" },
      { value: "5", label: "5 - N/A" },
      { value: "3", label: "3 - Difficult to see" },
    ],
  },
  {
    id: "cc3",
    title: "CC3",
    text: "If aware of CC (answered codes 1-3 in CC1), how much did the CC help you in your transaction?",
    optionsGridClass: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2",
    options: [
      { value: "1", label: "1 - Helped very much" },
      { value: "3", label: "3 - Did not help" },
      { value: "2", label: "2 - Somewhat helped" },
      { value: "4", label: "4 - N/A" },
    ],
  },
];

const metadataLabelClass = "text-xs sm:text-sm font-semibold text-[#1f1f1f]";
const metadataFieldClass =
  "w-full mt-1 rounded-md border border-[#b9b9b9] bg-white px-3 py-2 text-sm text-[#232323] outline-none focus:border-[#7f5bb3] focus:ring-2 focus:ring-[#7f5bb3]/30";

const Satisfaction = () => {
  const { visitId: paramVisitId, visitorName: paramVisitorName } = useParams();
  const { state } = useLocation();
  const visitId = state?.visitId ?? paramVisitId;
  const visitorName = state?.visitorName ?? paramVisitorName;
  const navigate = useNavigate();
  const formCardRef = useRef(null);
  const questionRefs = useRef({});

  const [answers, setAnswers] = useState({});
  const [commendation, setCommendation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [highlightQuestion, setHighlightQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [clientType, setClientType] = useState("");
  const [sex, setSex] = useState("");
  const [region, setRegion] = useState("VII");
  const [officeVisited, setOfficeVisited] = useState(state?.office ?? "");
  const [servicesAvailed, setServicesAvailed] = useState("");
  const [servicedBy, setServicedBy] = useState("");
  const [ccResponses, setCcResponses] = useState({
    cc1: "",
    cc2: "",
    cc3: "",
  });
  const [officeOptions, setOfficeOptions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadOfficeOptions = async () => {
      try {
        const offices = await fetchOffices();
        if (!isMounted) return;

        const names = [
          ...new Set(
            offices
              .filter((office) => office.role !== "super" && office.name?.trim())
              .map((office) => office.name.trim())
          ),
        ];

        setOfficeOptions(names);

        if (!state?.office && names.length) {
          setOfficeVisited((current) => current || names[0]);
        }
      } catch (loadError) {
        console.error("Failed to load office options:", loadError);
      }
    };

    loadOfficeOptions();

    return () => {
      isMounted = false;
    };
  }, [state?.office]);

  useEffect(() => {
    if (state?.office) {
      setOfficeVisited(state.office);
    }
  }, [state?.office]);

  const handleAnswer = (number, value) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
    setHighlightQuestion(null);
  };

  const handleCcOptionChange = (questionId, optionValue) => {
    clearValidationError(questionId);

    if (questionId === "cc1" && optionValue === "4" && ccResponses.cc1 !== "4") {
      clearValidationError("cc2");
      clearValidationError("cc3");
    }

    setCcResponses((prev) => {
      const isTogglingOff = prev[questionId] === optionValue;

      // Rule: if CC1 = 4, auto-answer N/A on CC2 and CC3
      if (questionId === "cc1") {
        if (optionValue === "4") {
          if (isTogglingOff) {
            return { ...prev, cc1: "", cc2: "", cc3: "" };
          }

          return { ...prev, cc1: "4", cc2: "5", cc3: "4" };
        }

        const nextCc1 = isTogglingOff ? "" : optionValue;
        if (prev.cc1 === "4") {
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

  const clearValidationError = (fieldName) => {
    setError("");
    setValidationErrors((prev) => {
      if (!prev[fieldName]) return prev;
      return { ...prev, [fieldName]: false };
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
      clientType: !clientType,
      sex: !sex,
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
        "Please complete all required fields in Client Type, Sex, Region/Office, and CC questions."
      );
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

    if (!visitId || !visitorName) {
      setError("Missing visit information. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      const sanitizedAnswers = {};
      Object.keys(answers).forEach((key) => {
        sanitizedAnswers[key.toString()] = Number(answers[key]);
      });

      const feedbackObject = {
        visitId,
        name: visitorName,
        answers: sanitizedAnswers,
        suggestion: suggestion.trim(),
        surveyDetails: {
          clientType: clientType || null,
          sex: sex || null,
          region: region || null,
          unitOfficeVisited: officeVisited || null,
          servicesAvailed: servicesAvailed.trim(),
          servicedBy: servicedBy.trim(),
          commendation: commendation.trim(),
          suggestion: suggestion.trim(),
          citizensCharter: ccResponses,
        },
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

  if (!visitId || !visitorName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            Missing Visit Information
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Check out first before opening the feedback form.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 transition"
          >
            Go Back
          </button>
        </div>
      </div>
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
              VISITOR : <span className="font-semibold">{visitorName}</span>
            </p>
          </div>

          <div
            ref={formCardRef}
            className="bg-[#efefef] rounded-2xl p-4 sm:p-6 md:p-7 border border-white/80 shadow-xl"
          >
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
                    clearValidationError("officeVisited");
                    setOfficeVisited(event.target.value);
                  }}
                  className={`w-full appearance-none rounded-md border bg-transparent px-3 pr-10 py-2.5 text-sm sm:text-base text-[#1f1f1f] outline-none ${
                    validationErrors.officeVisited
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#575757] focus:border-[#4b4b4b]"
                  }`}
                >
                  <option value="">Select office</option>
                  {officeOptions.map((office) => (
                    <option key={office} value={office}>
                      {office}
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
                    {question.options.map((option) => (
                      <label
                        key={option.value}
                        className="inline-flex items-start gap-2 text-xs sm:text-sm text-[#2f2f2f] cursor-pointer leading-snug"
                      >
                        <input
                          type="checkbox"
                          checked={ccResponses[question.id] === option.value}
                          onChange={() => handleCcOptionChange(question.id, option.value)}
                          className="mt-[2px] h-4 w-4 rounded-[4px] border-[#707070] shrink-0"
                        />
                        <span>
                          {option.label}
                          {option.note && (
                            <span className="italic"> {option.note}</span>
                          )}
                        </span>
                      </label>
                    ))}
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
              disabled={submitting}
              className={`w-full mt-5 rounded-lg bg-[#552b98] text-white py-3 sm:py-3.5 font-bold tracking-wide transition ${
                submitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#45207e]"
              }`}
            >
              {submitting ? "Submitting..." : "SUBMIT FEEDBACK"}
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
