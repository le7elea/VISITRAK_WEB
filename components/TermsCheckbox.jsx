import React, { useState } from "react";

export default function TermsCheckbox({ checked, onChange }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="flex flex-col gap-2 mb-6 text-white text-sm">
      {/* ✅ Checkbox Section */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          id="terms"
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="terms" className="cursor-pointer">
          I have read and agree to the{" "}
          <button
            onClick={() => setShowTerms(true)}
            type="button"
            className="underline text-blue-200 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button
            onClick={() => setShowPrivacy(true)}
            type="button"
            className="underline text-blue-200 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Privacy Policy
          </button>
          .
        </label>
      </div>

      {/* ✅ Terms and Conditions Modal */}
      {showTerms && (
        <Modal title="VisiTrak – Terms and Conditions" onClose={() => setShowTerms(false)}>
          <p>
            Welcome to <strong>VisiTrak</strong>! These Terms and Conditions govern your use of
            the VisiTrak web application. By using this application, you agree to the following:
          </p>

          <section>
            <h3 className="font-semibold mb-1">1. Authorized Use</h3>
            <p>
              VisiTrak is intended for authorized personnel only. Visitors cannot log in or
              create accounts. Unauthorized access or misuse is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">2. Data Collection</h3>
            <p>
              The application may collect visitor details such as name, contact information,
              purpose of visit, and time of entry. This information is used only for official
              visitor tracking.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">3. Staff Responsibilities</h3>
            <p>
              Authorized staff must maintain accuracy and confidentiality when handling visitor
              data. Data misuse or unauthorized disclosure is strictly forbidden.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">4. Limitation of Liability</h3>
            <p>
              The developers of VisiTrak are not liable for data loss, misuse, or unauthorized
              access beyond reasonable control.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">5. Updates</h3>
            <p>
              These Terms may be updated periodically. Continued use after updates means you
              accept the latest version.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">6. Contact</h3>
            <p>
              For any inquiries, please contact us at <strong>support@visitrak.app</strong>.
            </p>
          </section>
        </Modal>
      )}

      {/* ✅ Privacy Policy Modal */}
      {showPrivacy && (
        <Modal title="VisiTrak – Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <p>
            This Privacy Policy explains how VisiTrak collects, uses, and
                protects visitor information. By using the app, you agree to the
                practices described below.
          </p>

          <section>
            <h3 className="font-semibold mb-1">1. Information Collected</h3>
            <p>
              VisiTrak records basic visitor details such as name, contact
                number, purpose of visit, and time of entry and exit. All data
                is collected by authorized personnel.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">2. Data Usage</h3>
            <p>
              The collected data is used only for monitoring visitor traffic, maintaining
              security, and generating authorized reports. It is not shared or sold to any
              third party.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">3. Data Security</h3>
            <p>
              All personal information is stored securely and accessed only by authorized
              personnel. Appropriate technical and organizational measures are applied to
              protect against unauthorized access.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">4. Data Sharing</h3>
            <p>
              VisiTrak does not share or sell personal data. Information may
                only be shared if required by law or authorized agencies.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">5. Data Retention</h3>
            <p>
              Visitor records are retained only as long as necessary or as
                required by policy, after which they are securely deleted.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">6. User Rights</h3>
            <p>
              Visitors may request access to or correction of their data
                through the managing organization.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">7. Policy Updates</h3>
            <p>
              This Privacy Policy may be updated periodically. Continued use
                of the app means you accept the revised version.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">8. Contact Us</h3>
            <p>
              For privacy concerns, contact privacy@visitrak.app.
            </p>
          </section>

          <p className="text-xs text-center text-gray-500 pt-4 border-t border-gray-200">
            © 2025 VisiTrak. All rights reserved.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ✅ Reusable Modal Component */
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-center font-bold text-lg sm:text-xl">{title}</h2>
          <p className="text-xs text-gray-500 text-center mt-1">
            Last Updated: October 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-sm sm:text-base leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
