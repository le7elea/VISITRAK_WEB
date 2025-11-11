import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaUser,
  FaHome,
  FaPhone,
  FaEnvelope,
  FaBuilding,
} from "react-icons/fa";
import { IoNewspaperOutline, IoLocationOutline } from "react-icons/io5";

import headerBg from "../src/assets/BG2.png";
import Header from "../components/Form-header";
import SectionCard from "../components/SectionCard";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import TermsCheckbox from "../components/TermsCheckbox";
import Footer from "../components/Footer";

export default function VisiTrakForm() {
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [office, setOffice] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [otherPurpose, setOtherPurpose] = useState("");
  const [otherOffice, setOtherOffice] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const id = searchParams.get("id");
    if (redirect) {
      if (id) navigate(`/${redirect}/${id}`, { replace: true });
      else navigate(`/${redirect}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // 🧩 Purpose–Office mapping
  const purposeToOffice = {
    "COR/TOR": "REGISTRAR",
    "MEDICAL": "CLINIC",
    "PAYMENT": "CASHIER",
    "VISIT": "", 
    "SEMINAR / WEBINAR": "",
    "Other": "", 
  };

  const purposes = ["COR/TOR", "MEDICAL", "PAYMENT", "VISIT", "SEMINAR / WEBINAR", "Other"];
  const offices = [
    "REGISTRAR",
    "CLINIC",
    "CASHIER",
    "ADMIN OFFICE",
    "CCIS & CTAS FACULTY",
    "CCIS EXTENSION FACULTY",
    "CCJ FACULTY",
    "Other",
  ];

  // 🪄 Automatically set office when purpose changes
  const handlePurposeChange = (e) => {
    const selectedPurpose = e.target.value;
    setPurpose(selectedPurpose);

    // Auto-assign corresponding office
    const matchedOffice = purposeToOffice[selectedPurpose] || "";
    setOffice(matchedOffice);
    
    // Clear other purpose field when switching away from "Other"
    if (selectedPurpose !== "Other") {
      setOtherPurpose("");
    }
  };

  // Handle office change
  const handleOfficeChange = (e) => {
    const selectedOffice = e.target.value;
    setOffice(selectedOffice);
    
    // Clear other office field when switching away from "Other"
    if (selectedOffice !== "Other") {
      setOtherOffice("");
    }
  };

  const generateExitKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms and Conditions");
      return;
    }
    
    // Determine final purpose and office values
    const finalPurpose = purpose === "Other" ? otherPurpose : purpose;
    const finalOffice = office === "Other" ? otherOffice : office;
    
    if (!fullName || !finalPurpose || !finalOffice || !contactNumber) {
      alert("Please fill in all required fields");
      return;
    }

    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();

    navigate("/success", {
      state: {
        fullName,
        homeAddress,
        purpose: finalPurpose,
        office: finalOffice,
        contactNumber,
        email,
        checkInTime,
        exitKey,
      },
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #1A237E, #3949AB, #5C6BC0)",
      }}
    >
      <Header headerBg={headerBg} />

      <form
        onSubmit={handleSubmit}
        className="flex-1 mt-16 px-4 md:px-16 lg:px-32"
      >
        <SectionCard title="Personal Information" icon={<FaUser />}>
          <InputField
            icon={<FaUser className="text-indigo-600" />}
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value.toUpperCase())}
          />
          <InputField
            icon={<FaHome className="text-indigo-600" />}
            placeholder="Home Address"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value.toUpperCase())}
          />
        </SectionCard>

        <SectionCard title="Visit Information" icon={<IoLocationOutline />}>
          <SelectField
            icon={<IoNewspaperOutline className="text-indigo-600" />}
            value={purpose}
            onChange={handlePurposeChange}
            options={purposes}
            placeholder="Purpose of Visit"
          />
          
          {/* Show input field when purpose is "Other" */}
          {purpose === "Other" && (
            <InputField
              icon={<IoNewspaperOutline className="text-indigo-600" />}
              placeholder="Please specify your purpose"
              value={otherPurpose}
              onChange={(e) => setOtherPurpose(e.target.value.toUpperCase())}
            />
          )}
          
          <SelectField
            icon={<FaBuilding className="text-indigo-600" />}
            value={office}
            onChange={handleOfficeChange}
            options={offices}
            placeholder="Office to Visit"
          />
          
          {/* Show input field when office is "Other" */}
          {office === "Other" && (
            <InputField
              icon={<FaBuilding className="text-indigo-600" />}
              placeholder="Please specify the office"
              value={otherOffice}
              onChange={(e) => setOtherOffice(e.target.value.toUpperCase())}
            />
          )}
        </SectionCard>

        <SectionCard title="Contact Information" icon={<FaPhone />}>
          <InputField
            icon={<FaPhone className="text-indigo-600" />}
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <InputField
            icon={<FaEnvelope className="text-indigo-600" />}
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </SectionCard>

        <TermsCheckbox
          checked={agreeTerms}
          onChange={() => setAgreeTerms(!agreeTerms)}
          onOpenTerms={() => setShowTerms(true)}
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-900 text-white font-bold shadow-lg hover:bg-indigo-800 transition"
        >
          Submit Registration
        </button>
      </form>

      <Footer />

      {/* Terms Modal (unchanged) */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <h2 className="text-center font-bold text-lg sm:text-xl mb-2 text-gray-900">
                VisiTrak – Terms and Conditions
              </h2>
              <p className="text-xs text-gray-700 mb-4 text-center">
                Last Updated: October 25, 2025
              </p>

              <div className="space-y-4 text-sm sm:text-base text-gray-800">
                <p>
                  Welcome to VisiTrak! These Terms and Conditions govern your use
                  of the VisiTrak mobile application. By using this app, you agree
                  to the following:
                </p>

                <section>
                  <h3 className="font-semibold mb-1">1. Authorized Use</h3>
                  <p>
                    VisiTrak is for authorized personnel only. Unauthorized access
                    or misuse is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-1">2. Data Collection</h3>
                  <p>
                    The app may collect visitor information such as name, contact
                    details, purpose of visit, and time of entry.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-1">3. Privacy</h3>
                  <p>
                    All collected data is handled securely and used only for
                    authorized purposes.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-1">4. Limitation of Liability</h3>
                  <p>
                    The developers are not responsible for data loss or misuse
                    beyond reasonable control.
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
    </div>
  );
}