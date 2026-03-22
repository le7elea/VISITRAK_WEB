import { useState, useRef, useEffect } from "react";
import { FiAlertTriangle, FiLogOut } from "react-icons/fi";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SuccessModal from "./SuccessModal";

import { setCheckOutTimeByName } from "../src/lib/visits.service";

export default function ExitScreen() {
  const [name, setName] = useState("");
  const [showNameWithFeedback, setShowNameWithFeedback] = useState(true);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visitId, setVisitId] = useState(null);
  const [visitorName, setVisitorName] = useState("");
  const [feedbackDisplayName, setFeedbackDisplayName] = useState("");
  const [error, setError] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError({
        title: "Name required",
        message: "Please enter your name.",
      });
      inputRef.current?.focus();
      return;
    }

    let wasSuccessful = false;

    try {
      setError(null);
      setLoading(true);

      const upperCaseName = name.trim().toUpperCase();
      const id = await setCheckOutTimeByName(upperCaseName);

      if (!id) throw new Error("No active visit found");

      const selectedDisplayName =
        showNameWithFeedback ? upperCaseName : "Anonymous";

      setVisitId(id);
      setVisitorName(upperCaseName);
      setFeedbackDisplayName(selectedDisplayName);
      setShowSuccess(true);
      wasSuccessful = true;
    } catch (error) {
      console.error("Checkout error:", error);
      setError({
        title: "No active visit found",
        message:
          "No active visit found for this name. Please check the spelling or ensure you checked in first.",
      });
    } finally {
      setLoading(false);
      if (wasSuccessful) setName("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] flex flex-col">
      <Header title="VisiTrak" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl bg-white/15 border border-orange-400 rounded-2xl shadow-lg p-5 sm:p-6 lg:p-7 xl:p-8 origin-center lg:scale-[1.02] xl:scale-[1.04] transition-transform">
          
          {/* Icon */}
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-orange-400/90 flex items-center justify-center mb-3 sm:mb-4">
              <FiLogOut className="text-indigo-600 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
            </div>

            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-extrabold text-center">
              Visitor Checkout
            </h1>

            <p className="text-red-300 italic text-[11px] sm:text-xs lg:text-sm text-center mt-2">
              NOTE: Enter the name used during check-in
            </p>
          </div>

          {/* Input */}
          <div
            className={`border rounded-xl transition ${
              focused
                ? "border-purple-500 bg-white"
                : "border-orange-400 bg-white/90"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={name.toUpperCase()}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter Your Full Name"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2.5 sm:py-3 lg:py-3.5 text-gray-800 bg-transparent outline-none text-sm sm:text-base lg:text-lg"
            />
          </div>

          <fieldset className="mt-4 rounded-xl border border-orange-300 bg-white/10 p-4">
            <legend className="px-2 text-sm font-semibold text-orange-100">
              Feedback Name Display
            </legend>
            <div className="mt-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={showNameWithFeedback}
                  onChange={(event) => setShowNameWithFeedback(event.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 shrink-0 accent-purple-600"
                />
                <span>
                  <span className="block font-semibold">
                    Show my name to the admin with my feedback
                  </span>
                  <span className="block text-xs text-orange-100/90">
                    Your feedback will include your name.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {error && (
            <div className="mt-4 sm:mt-5 bg-red-500/10 border border-red-400/70 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-400/20">
                  <FiAlertTriangle className="text-red-300 w-4 h-4" />
                </div>
                <div>
                  <p className="text-red-100 font-semibold text-sm sm:text-base">
                    {error.title}
                  </p>
                  <p className="text-red-200 text-xs sm:text-sm">
                    {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-6 sm:mt-8 lg:mt-10 py-2.5 sm:py-3 lg:py-3.5 rounded-xl font-bold tracking-widest text-white shadow-md transition text-sm sm:text-base lg:text-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "PROCESSING..." : "SUBMIT"}
          </button>
        </div>
      </div>

      <Footer />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        visitId={visitId}
        visitorName={visitorName}
        displayName={feedbackDisplayName}
      />
    </div>
  );
}
