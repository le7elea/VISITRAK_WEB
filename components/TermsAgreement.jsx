import React, { useState } from "react";

export default function TermsAgreement({
  agreeTerms,
  setAgreeTerms,
  errors,
  setErrors,
  isMobile = false,
  isTablet = false,
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const hasError = errors?.agreeTerms;

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setAgreeTerms(isChecked);
    if (setErrors && hasError) {
      setErrors((prev) => ({ ...prev, agreeTerms: false }));
    }
  };

  const termsContent = [
    {
      title: "1. Authorized Use",
      content:
        "VisiTrak is for authorized personnel only. Visitors cannot log in or create accounts. Only designated staff may record visitor entries. Unauthorized access or misuse is strictly prohibited.",
    },
    {
      title: "2. Data Collection",
      content:
        "The app may collect visitor information such as name, contact details, purpose of visit, and time of entry. This data is used only for visitor tracking and official records.",
    },
    {
      title: "3. Privacy and Security",
      content:
        "All collected data is handled securely and used only for authorized purposes. VisiTrak does not share or sell any personal data.",
    },
    {
      title: "4. Staff Responsibilities",
      content:
        "Authorized users must enter accurate visitor details, maintain confidentiality, and use the app only for legitimate purposes.",
    },
    {
      title: "5. Limitation of Liability",
      content:
        "The developers of VisiTrak are not responsible for data loss, misuse, or unauthorized access beyond reasonable control. Use of this app implies acceptance of these terms.",
    },
    {
      title: "6. Updates to Terms",
      content:
        "These Terms may be updated periodically. Continued use after updates means you accept the revised version.",
    },
    {
      title: "7. Contact",
      content: "For questions or concerns, contact us at support@visitrak.app.",
    },
  ];

  const privacyContent = [
    {
      title: "1. Information We Collect",
      content:
        "VisiTrak records basic visitor details such as name, contact number, purpose of visit, and time of entry and exit. All data is collected by authorized personnel.",
    },
    {
      title: "2. Data Usage",
      content:
        "The collected data is used only for monitoring visitor traffic, maintaining security, and generating authorized reports. It is not shared or sold to any third party.",
    },
    {
      title: "3. Data Storage and Security",
      content:
        "All personal information is stored securely and accessed only by authorized personnel. Appropriate technical and organizational measures are applied to protect against unauthorized access.",
    },
    {
      title: "4. Data Sharing",
      content:
        "VisiTrak does not share or sell personal data. Information may only be shared if required by law or authorized agencies.",
    },
    {
      title: "5. Data Retention",
      content:
        "Visitor records are retained only as long as necessary or as required by policy, after which they are securely deleted.",
    },
    {
      title: "6. User Rights",
      content:
        "Visitors may request access to or correction of their data through the managing organization.",
    },
    {
      title: "7. Policy Updates",
      content:
        "This Privacy Policy may be updated periodically. Continued use of the app means you accept the revised version.",
    },
    {
      title: "8. Contact Us",
      content: "For privacy concerns, contact privacy@visitrak.app.",
    },
  ];

  return (
    <div className="w-full px-0 mt-4 sm:mt-6">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={handleCheckboxChange}
            className={`h-3.5 w-3.5 rounded border ${
              hasError && !agreeTerms
                ? "border-red-500 ring-2 ring-red-400/80"
                : "border-white/50"
            }`}
          />
          <span>
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-sky-300 underline"
            >
              Terms and Condition
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="text-sky-300 underline"
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                VisiTrak - Terms and Conditions
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Last Updated: October 25, 2025
              </p>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
              </p>

              {termsContent.map((item, idx) => (
                <div key={idx} className="mb-4 sm:mb-6 last:mb-0">
                  <h3 className="text-gray-900 font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    {item.title}
                  </h3>
                  <p className="text-gray-700 pl-4 text-sm sm:text-base leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}

              <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                <p className="text-center text-gray-500 text-xs sm:text-sm">
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm sm:text-base transition"
              >
                I Understand - Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                VisiTrak - Privacy Policy
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Last Updated: October 25, 2025
              </p>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
              </p>

              {privacyContent.map((item, idx) => (
                <div key={idx} className="mb-4 sm:mb-6 last:mb-0">
                  <h3 className="text-gray-900 font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {item.title}
                  </h3>
                  <p className="text-gray-700 pl-4 text-sm sm:text-base leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}

              <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                <p className="text-center text-gray-500 text-xs sm:text-sm">
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm sm:text-base transition"
              >
                I Understand - Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
