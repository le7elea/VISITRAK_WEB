import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Satisfaction_header";
import Question from "../components/Question";
import EmojiRating from "../components/EmojiRating";
import { addFeedback } from "../src/lib/feedbacks.service";

const questions = [
  "Responsiveness (Pag abi-abi).",
  "Reliability (Kalig-on sa serbisyo).",
  "Access & Facilities (Sayon tuoran ang opisina, komportable ug maayo ang mga pasilidad).",
  "Communication (Pamagi sa pag pasabot).",
  "Costs (Klaridad sa balayaran).",
  "Integrity (Matinud-anon, makiangayon, ug patas).",
  "Assurance (Kasiguruhan sa serbisyo).",
  "Outcome (Nanghatag ang hustong serbisyo).",
];

const Satisfaction = () => {
  const { visitId: paramVisitId, visitorName: paramVisitorName } = useParams();
  const { state } = useLocation();
  const visitId = state?.visitId ?? paramVisitId;
  const visitorName = state?.visitorName ?? paramVisitorName;
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Debug: Log received params
  useEffect(() => {
    console.log("🎯 FeedbackForm mounted with params:", { visitId, visitorName });
  }, [visitId, visitorName]);

  const [answers, setAnswers] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [highlightQuestion, setHighlightQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questionRefs = useRef({});

  const handleAnswer = (number, value) => {
    console.log(`📝 Answer updated - Question ${number}: ${value}`);
    setAnswers((prev) => ({ ...prev, [number]: value }));
    setHighlightQuestion(null); // Remove highlight when answered
  };

  const scrollToQuestion = (questionNumber) => {
    const element = questionRefs.current[questionNumber];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 Submit button pressed");
    console.log("Current answers:", answers);
    console.log("Current suggestion:", suggestion);

    if (submitting) {
      console.log("⏳ Already submitting, ignoring...");
      return;
    }
    
    setSubmitting(true);
    setError("");

    // Check unanswered questions (allow 0 as valid)
    const firstUnansweredIndex = questions.findIndex(
      (_, i) => answers[i + 1] === undefined
    );
    
    if (firstUnansweredIndex !== -1) {
      const questionNumber = firstUnansweredIndex + 1;
      console.log(`⚠️ Question ${questionNumber} is unanswered`);
      
      scrollToQuestion(questionNumber);
      
      setHighlightQuestion(questionNumber);
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    console.log("✅ All questions answered");

    if (!visitId || !visitorName) {
      console.error("❌ Missing visitId or visitorName!");
      setError("Missing visit information. Please try again.");
      setSubmitting(false);
      return;
    }

    try {
      // Sanitize answers - ensure all values are numbers
      const sanitizedAnswers = {};
      Object.keys(answers).forEach((key) => {
        sanitizedAnswers[key.toString()] = Number(answers[key]);
      });

      console.log("📦 Prepared feedback object:");
      const feedbackObject = {
        visitId,
        name: visitorName,
        answers: sanitizedAnswers,
        suggestion: suggestion.trim(),
      };
      console.log(JSON.stringify(feedbackObject, null, 2));

      console.log("⏳ Calling addFeedback...");
      const result = await addFeedback(feedbackObject);

      navigate("/thankyou", { replace: true });
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      setError(`Failed to submit feedback: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Early validation if visit info is missing
  if (!visitId || !visitorName) {
    console.warn("⚠️ Missing visit information on mount");
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
          <div className="text-red-500 text-5xl sm:text-6xl mb-3 sm:mb-4">
            ⚠️
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Missing Visit Information
          </h2>
          <div className="bg-gray-100 rounded-lg p-4 mb-5 sm:mb-6">
            <p className="text-gray-600 text-xs sm:text-sm mb-1">
              <span className="font-medium">visitId:</span> {visitId || "missing"}
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              <span className="font-medium">visitorName:</span> {visitorName || "missing"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:from-purple-700 hover:to-purple-900 transition-all duration-200 text-sm sm:text-base w-full"
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="max-w-4xl lg:max-w-5xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
              Give Feedback
            </h1>
            
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-purple-600 font-medium text-sm sm:text-base">
                  Visitor: {visitorName}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div ref={scrollRef}>
              {questions.map((text, index) => (
                <div
                  key={index}
                  ref={(el) => (questionRefs.current[index + 1] = el)}
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

            <div className="mt-8">
              <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">
                Suggestions or comments
              </label>
              <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  maxLength={300}
                  placeholder="Write your suggestion here..."
                  className="w-full p-3 sm:p-4 text-sm sm:text-base text-gray-700 min-h-[140px] sm:min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={5}
                />
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs sm:text-sm">
                  
                  <span className={`text-xs sm:text-sm ${
                    suggestion.length >= 300 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {suggestion.length}/300
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full mt-8 sm:mt-10 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-base sm:text-lg md:text-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "SUBMIT FEEDBACK"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Incomplete Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full mb-4">
                <span className="text-2xl sm:text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                Incomplete Submission
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Please complete all ratings before submitting.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-2.5 sm:py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 text-sm sm:text-base"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Satisfaction;

