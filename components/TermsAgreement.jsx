import React, { useState, useEffect } from "react";
import { FaFileContract, FaShieldAlt } from "react-icons/fa";

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
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasError = errors?.agreeTerms;

  const getSpacing = (size) => {
    if (isMobile) return `${size * 0.8}px`;
    if (isTablet) return `${size}px`;
    return `${size * 1.2}px`;
  };

  const getFontSize = (size) => {
    if (windowWidth > 1024) return `${size * 1.1}px`;
    if (windowWidth > 768) return `${size}px`;
    return `${size * 0.9}px`;
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setAgreeTerms(isChecked);
    if (setErrors && hasError) {
      setErrors(prev => ({ ...prev, agreeTerms: false }));
    }
  };

  // Terms and Conditions content
  const termsContent = [
    {
      title: "1. Authorized Use",
      content: "VisiTrak is for authorized personnel only. Visitors cannot log in or create accounts. Only designated staff may record visitor entries. Unauthorized access or misuse is strictly prohibited."
    },
    {
      title: "2. Data Collection",
      content: "The app may collect visitor information such as name, contact details, purpose of visit, and time of entry. This data is used only for visitor tracking and official records."
    },
    {
      title: "3. Privacy and Security",
      content: "All collected data is handled securely and used only for authorized purposes. VisiTrak does not share or sell any personal data."
    },
    {
      title: "4. Staff Responsibilities",
      content: "Authorized users must enter accurate visitor details, maintain confidentiality, and use the app only for legitimate purposes."
    },
    {
      title: "5. Limitation of Liability",
      content: "The developers of VisiTrak are not responsible for data loss, misuse, or unauthorized access beyond reasonable control. Use of this app implies acceptance of these terms."
    },
    {
      title: "6. Updates to Terms",
      content: "These Terms may be updated periodically. Continued use after updates means you accept the revised version."
    },
    {
      title: "7. Contact",
      content: "For questions or concerns, contact us at support@visitrak.app."
    }
  ];

  // Privacy Policy content
  const privacyContent = [
    {
      title: "1. Information We Collect",
      content: "VisiTrak records basic visitor details such as name, contact number, purpose of visit, and time of entry and exit. All data is collected by authorized personnel."
    },
    {
      title: "2. Data Usage",
      content: "The collected data is used only for monitoring visitor traffic, maintaining security, and generating authorized reports. It is not shared or sold to any third party."
    },
    {
      title: "3. Data Storage and Security",
      content: "All personal information is stored securely and accessed only by authorized personnel. Appropriate technical and organizational measures are applied to protect against unauthorized access."
    },
    {
      title: "4. Data Sharing",
      content: "VisiTrak does not share or sell personal data. Information may only be shared if required by law or authorized agencies."
    },
    {
      title: "5. Data Retention",
      content: "Visitor records are retained only as long as necessary or as required by policy, after which they are securely deleted."
    },
    {
      title: "6. User Rights",
      content: "Visitors may request access to or correction of their data through the managing organization."
    },
    {
      title: "7. Policy Updates",
      content: "This Privacy Policy may be updated periodically. Continued use of the app means you accept the revised version."
    },
    {
      title: "8. Contact Us",
      content: "For privacy concerns, contact privacy@visitrak.app."
    }
  ];

  return (
    <div
      className="w-full px-0 mt-4 sm:mt-6"
      style={{ marginTop: getSpacing(20) }}
    >
      <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={handleCheckboxChange}
            className={`h-3.5 w-3.5 rounded border ${hasError && !agreeTerms ? "border-red-400" : "border-white/50"}`}
          />
          <span>
            I have read and agree to the{" "}
            <button
              onClick={() => setShowTerms(true)}
              className="text-sky-300 underline"
              style={{ fontSize: getFontSize(12) }}
            >
              Terms and Condition
            </button>{" "}
            and{" "}
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-sky-300 underline"
              style={{ fontSize: getFontSize(12) }}
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <FaFileContract className="text-white text-xl sm:text-2xl" />
                <h2 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-white"
                  style={{ fontSize: getFontSize(20) }}
                >
                  VisiTrak – Terms and Conditions
                </h2>
              </div>
              <p 
                className="text-indigo-200 mt-2 text-sm sm:text-base"
                style={{ fontSize: getFontSize(12) }}
              >
                Last Updated: October 25, 2025
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh]">
              <p 
                className="text-gray-300 mb-4 sm:mb-6"
                style={{ 
                  fontSize: getFontSize(14),
                  lineHeight: "1.6",
                }}
              >
                Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
              </p>

              {termsContent.map((item, idx) => (
                <div key={idx} className="mb-4 sm:mb-6 last:mb-0">
                  <h3 
                    className="text-indigo-300 font-semibold mb-2 flex items-center gap-2"
                    style={{ fontSize: getFontSize(16) }}
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    {item.title}
                  </h3>
                  <p 
                    className="text-gray-300 pl-4"
                    style={{ 
                      fontSize: getFontSize(14),
                      lineHeight: "1.6",
                    }}
                  >
                    {item.content}
                  </p>
                </div>
              ))}

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                <p 
                  className="text-center text-gray-400 text-sm"
                  style={{ fontSize: getFontSize(12) }}
                >
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-700">
              <button
                onClick={() => setShowTerms(false)}
                className={`
                  w-full px-4 py-3 sm:py-4 rounded-lg
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-indigo-700 hover:to-purple-700
                  text-white font-medium
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  text-sm sm:text-base
                `}
                style={{ fontSize: getFontSize(14) }}
              >
                I Understand – Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <FaShieldAlt className="text-white text-xl sm:text-2xl" />
                <h2 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-white"
                  style={{ fontSize: getFontSize(20) }}
                >
                  VisiTrak – Privacy Policy
                </h2>
              </div>
              <p 
                className="text-emerald-200 mt-2 text-sm sm:text-base"
                style={{ fontSize: getFontSize(12) }}
              >
                Last Updated: October 25, 2025
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh]">
              <p 
                className="text-gray-300 mb-4 sm:mb-6"
                style={{ 
                  fontSize: getFontSize(14),
                  lineHeight: "1.6",
                }}
              >
                This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
              </p>

              {privacyContent.map((item, idx) => (
                <div key={idx} className="mb-4 sm:mb-6 last:mb-0">
                  <h3 
                    className="text-emerald-300 font-semibold mb-2 flex items-center gap-2"
                    style={{ fontSize: getFontSize(16) }}
                  >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    {item.title}
                  </h3>
                  <p 
                    className="text-gray-300 pl-4"
                    style={{ 
                      fontSize: getFontSize(14),
                      lineHeight: "1.6",
                    }}
                  >
                    {item.content}
                  </p>
                </div>
              ))}

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                <p 
                  className="text-center text-gray-400 text-sm"
                  style={{ fontSize: getFontSize(12) }}
                >
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-700">
              <button
                onClick={() => setShowPrivacy(false)}
                className={`
                  w-full px-4 py-3 sm:py-4 rounded-lg
                  bg-gradient-to-r from-emerald-600 to-teal-600
                  hover:from-emerald-700 hover:to-teal-700
                  text-white font-medium
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  text-sm sm:text-base
                `}
                style={{ fontSize: getFontSize(14) }}
              >
                I Understand – Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
