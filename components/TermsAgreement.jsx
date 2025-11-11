import React, { useState } from "react";

export default function TermsAgreement({ agreeTerms, setAgreeTerms }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="mt-6 mb-2 px-4 sm:px-8 md:px-12 max-w-4xl mx-auto">
      {/* Agreement Section */}
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mr-3 mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label className="text-gray-700 text-sm sm:text-base flex-1">
          I have read and agree to the{" "}
          <button
            onClick={() => setShowTerms(true)}
            className="text-blue-600 hover:text-blue-800 underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
          >
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-blue-600 hover:text-blue-800 underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
          >
            Privacy Policy
          </button>
          .
        </label>
      </div>

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-center font-bold text-lg sm:text-xl mb-2">
                VisiTrak – Terms and Conditions
              </h2>
              <p className="text-xs text-gray-700 mb-4 text-center">
                Last Updated: October 25, 2025
              </p>

              <div className="space-y-4 text-sm sm:text-base">
                <p className="text-gray-800 leading-6">
                  Welcome to VisiTrak! These Terms and Conditions govern your use
                of the VisiTrak mobile application. By using this app, you agree
                to the following:
                </p>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">1. Authorized Use</h3>
                  <p className="text-gray-800">
                    VisiTrak is for authorized personnel only. Visitors cannot log
                    in or create accounts. Only designated staff may record visitor
                    entries. Unauthorized access or misuse is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">2. Data Collection</h3>
                  <p className="text-gray-800">
                    The app may collect visitor information such as name, contact
                    details, purpose of visit, and time of entry. This data is used
                    only for visitor tracking and official records.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">3. Privacy</h3>
                  <p className="text-gray-800">
                    All collected data is handled securely and used only for
                    authorized purposes. VisiTrak does not share or sell any
                    personal data.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">4. Staff Responsibilities</h3>
                  <p className="text-gray-800">
                    Authorized users must enter accurate visitor details, maintain
                    confidentiality, and use the app only for legitimate purposes.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">5. Limitation of Liability</h3>
                  <p className="text-gray-800">
                    The developers of VisiTrak are not responsible for data loss,
                    misuse, or unauthorized access beyond reasonable control. Use of
                    this app implies acceptance of these terms.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">6. Updates</h3>
                  <p className="text-gray-800">
                    These Terms may be updated periodically. Continued use after
                    updates means you accept the revised version.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">7. Contact</h3>
                  <p className="text-gray-800">
                    For questions or concerns, contact us at
                    support@visitrak.app.
                  </p>
                </section>

                <p className="text-xs text-center text-gray-500 mt-6">
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl mt-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-center font-bold text-lg sm:text-xl mb-2">
                VisiTrak – Privacy Policy
              </h2>
              <p className="text-xs text-gray-700 mb-4 text-center">
                Last Updated: October 25, 2025
              </p>

              <div className="space-y-4 text-sm sm:text-base">
                <p className="text-gray-800 leading-6">
                  This Privacy Policy explains how VisiTrak collects, uses, and
                  protects visitor information. By using the app, you agree to the
                  practices described below.
                </p>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">1. Information We Collect</h3>
                  <p className="text-gray-800">
                    VisiTrak records basic visitor details such as name, contact
                    number, purpose of visit, and time of entry and exit. All data
                    is collected by authorized personnel.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">2. How We Use Information</h3>
                  <p className="text-gray-800">
                    Data is used only for visitor tracking, reporting, and security
                    purposes. We do not use data for marketing or advertising.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">3. Data Storage and Security</h3>
                  <p className="text-gray-800">
                    Visitor data is stored securely within the organization's
                    system. Reasonable measures are taken to prevent unauthorized
                    access or misuse.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">4. Data Sharing</h3>
                  <p className="text-gray-800">
                    VisiTrak does not share or sell personal data. Information may
                    only be shared if required by law or authorized agencies.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">5. Data Retention</h3>
                  <p className="text-gray-800">
                    Visitor records are retained only as long as necessary or as
                    required by policy, after which they are securely deleted.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">6. User Rights</h3>
                  <p className="text-gray-800">
                    Visitors may request access to or correction of their data
                    through the managing organization.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">7. Policy Updates</h3>
                  <p className="text-gray-800">
                    This Privacy Policy may be updated periodically. Continued use
                    of the app means you accept the revised version.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-1">8. Contact Us</h3>
                  <p className="text-gray-800">
                    For privacy concerns, contact privacy@visitrak.app.
                  </p>
                </section>

                <p className="text-xs text-center text-gray-500 mt-6">
                  © 2025 VisiTrak. All rights reserved.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacy(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl mt-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}