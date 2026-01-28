import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaExclamationCircle,
} from "react-icons/fa";
import { IoNewspaperOutline, IoLocationOutline } from "react-icons/io5";

import headerBg from "../src/assets/BG2.png";
import Header from "../components/Form-header";
import SectionCard from "../components/SectionCard";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import TermsCheckbox from "../components/TermsCheckbox";
import BoholAddressSelector from "../components/BoholAddressSelector";
import Footer from "../components/Footer";

// ============================================
// CONSTANTS
// ============================================
// Purpose to Office mapping for filtering
const PURPOSE_TO_OFFICE = {
  "COR/TOR": "REGISTRAR",
  "MEDICAL CHECKUP": "CLINIC",
  "MEDICAL CERTIFICATE": "CLINIC",
  "DENTAL CHECKUP": "CLINIC",
  "PAYMENT": "CASHIER",
  "INQUIRY": null, // Multiple offices can handle inquiry
  "ADVISING": null, // Multiple offices can handle advising
  "CONSULTATION": null, // Multiple offices can handle consultation
  "SUBMISSION OF REQUIREMENTS": "ADMIN OFFICE",
  "VISIT": null,
  "SEMINAR / WEBINAR": null,
  "Other": null,
};

const OFFICE_STAFF_DATA = {
  REGISTRAR: [
    { name: "Ms. Uy", purpose: "COR/TOR" },
    { name: "Ms. Dela Cruz", purpose: "COR/TOR" },
  ],
  CLINIC: [
    { name: "Dr. Santos", purpose: "MEDICAL CHECKUP" },
    { name: "Dr. Villanueva", purpose: "MEDICAL CHECKUP" },
  ],
  CASHIER: [{ name: "Mr. Tan", purpose: "PAYMENT" }],
  "ADMIN OFFICE": [
    { name: "Ms. Jeanette B. Darunday" },
    { name: "Ms. Annabelle T. Pabas" },
    { name: "Ms. Maricel E. Cal" },
  ],
  "CCIS & CTAS FACULTY": [
    { name: "Ms. Sasha Isabela Uy" },
    { name: "Mrs. Cathlene Leah Gabo" },
    { name: "Mr. Raymond Cempron" },
    { name: "Mr. Emiliano Maravilla" },
    { name: "Mrs. Dhoree Maravilla" },
  ],
  "CCIS EXTENSION FACULTY": [
    { name: "Ms. Sasha Isabela Uy" },
    { name: "Mrs. Cathlene Leah Gabo" },
  ],
  "CCJ FACULTY": [
    { name: "Dr. Mary Grace M. Quino" },
    { name: "Mr. Dave Vincent G. Estrobo" },
  ],
};

const OFFICE_TO_PURPOSE_MAP = {
  REGISTRAR: ["COR/TOR", "Other"],
  CLINIC: ["MEDICAL CHECKUP", "MEDICAL CERTIFICATE", "DENTAL CHECKUP", "Other"],
  CASHIER: ["PAYMENT", "Other"],
  "ADMIN OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
  "CCIS & CTAS FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
  "CCIS EXTENSION FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
  "CCJ FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
};

const DEFAULT_PURPOSES = [
  "COR/TOR",
  "MEDICAL CHECKUP",
  "PAYMENT",
  "VISIT",
  "SEMINAR / WEBINAR",
  "Other",
];

const OFFICES = [
  "REGISTRAR",
  "CLINIC",
  "CASHIER",
  "ADMIN OFFICE",
  "CCIS & CTAS FACULTY",
  "CCIS EXTENSION FACULTY",
  "CCJ FACULTY",
  "Other",
];

const PHONE_PREFIX = "09";
const PHONE_LENGTH = 11;
const EXIT_KEY_LENGTH = 6;
const EXIT_KEY_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateExitKey = () => {
  return Array.from({ length: EXIT_KEY_LENGTH }, () =>
    EXIT_KEY_CHARS.charAt(Math.floor(Math.random() * EXIT_KEY_CHARS.length))
  ).join("");
};

const validateEmail = (email) => {
  if (!email) return { valid: true, error: "" };
  if (!email.endsWith("@gmail.com")) {
    return { valid: false, error: "Use your personal Gmail account (@gmail.com)." };
  }
  return { valid: true, error: "" };
};

const validateContactNumber = (number) => {
  if (!number || number.length !== PHONE_LENGTH) {
    return { valid: false, error: "Contact number must be 11 digits long." };
  }
  if (!number.startsWith(PHONE_PREFIX)) {
    return { valid: false, error: `Contact number must start with ${PHONE_PREFIX}.` };
  }
  return { valid: true, error: "" };
};

const validateFullName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: "Full name is required." };
  }
  if (/[0-9]/.test(name)) {
    return { valid: false, error: "Full name cannot contain numbers." };
  }
  return { valid: true, error: "" };
};

// ============================================
// ENHANCED VISITOR INFO LOGIC HOOK
// ============================================
const useVisitorInfoLogic = () => {
  const [purpose, setPurpose] = useState("");
  const [office, setOffice] = useState("");
  const [staffName, setStaffName] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [customOffice, setCustomOffice] = useState("");

  // All staff with their office info
  const allStaffOptions = useMemo(
    () =>
      Object.entries(OFFICE_STAFF_DATA).flatMap(([office, staff]) =>
        staff.map((s) => ({ ...s, office }))
      ),
    []
  );

  // Get selected staff object
  const selectedStaffObject = useMemo(() => {
    return allStaffOptions.find((s) => s.name === staffName) || null;
  }, [staffName, allStaffOptions]);

  // STEP 1: Determine available staff based on current selections
  const filteredStaffOptions = useMemo(() => {
    let filtered = allStaffOptions;

    // Filter by office if selected and not "Other"
    if (office && office !== "Other") {
      filtered = filtered.filter((s) => s.office === office);
    }

    // Further filter by purpose if staff has specific purpose assignments
    if (purpose && purpose !== "Other") {
      const staffWithPurpose = filtered.filter((s) => s.purpose === purpose);
      // Only apply purpose filter if there are staff with that specific purpose
      if (staffWithPurpose.length > 0) {
        filtered = staffWithPurpose;
      }
    }

    return filtered;
  }, [office, purpose, allStaffOptions]);

  // STEP 2: Determine available offices based on current selections
  const filteredOffices = useMemo(() => {
    // Priority 1: If staff is selected, show only their office + Other
    if (selectedStaffObject) {
      return [selectedStaffObject.office, "Other"];
    }

    // Priority 2: If purpose has specific office, show only that office + Other
    if (purpose && purpose !== "Other" && PURPOSE_TO_OFFICE[purpose]) {
      return [PURPOSE_TO_OFFICE[purpose], "Other"];
    }

    // Default: Show all offices
    return OFFICES;
  }, [selectedStaffObject, purpose]);

  // STEP 3: Determine available purposes based on current selections
  const filteredPurposes = useMemo(() => {
    // Priority 1: If staff is selected, show purposes allowed for their office
    if (selectedStaffObject && OFFICE_TO_PURPOSE_MAP[selectedStaffObject.office]) {
      return OFFICE_TO_PURPOSE_MAP[selectedStaffObject.office];
    }

    // Priority 2: If office is selected, show purposes allowed for that office
    if (office && office !== "Other" && OFFICE_TO_PURPOSE_MAP[office]) {
      return OFFICE_TO_PURPOSE_MAP[office];
    }

    // Default: Show all default purposes
    return DEFAULT_PURPOSES;
  }, [selectedStaffObject, office]);

  // STEP 4: Determine if office field should be disabled
  const isOfficeDisabled = useMemo(() => {
    // Disabled if staff is selected (staff determines office)
    if (selectedStaffObject) return true;
    
    // Disabled if purpose maps to a specific office
    if (purpose && purpose !== "Other" && PURPOSE_TO_OFFICE[purpose]) return true;
    
    return false;
  }, [selectedStaffObject, purpose]);

  // STEP 5: Auto-fill office when purpose is selected (but only if no staff selected)
  useEffect(() => {
    // Don't auto-fill office if staff is already selected
    if (staffName) return;

    // Auto-fill office if purpose has a specific office mapping
    if (purpose && purpose !== "Other" && PURPOSE_TO_OFFICE[purpose]) {
      const mappedOffice = PURPOSE_TO_OFFICE[purpose];
      if (mappedOffice && mappedOffice !== office) {
        setOffice(mappedOffice);
        setCustomOffice("");
      }
    }
  }, [purpose, staffName]);

  // STEP 6: Auto-fill office when staff is selected (NO AUTO-FILL PURPOSE)
  useEffect(() => {
    if (selectedStaffObject) {
      // Auto-fill office only
      if (selectedStaffObject.office !== office) {
        setOffice(selectedStaffObject.office);
        setCustomOffice("");
      }

      // DO NOT auto-fill purpose - let user choose
    }
  }, [staffName]);

  // Event Handlers
  const handlePurposeChange = useCallback((e) => {
    const selectedPurpose = e.target.value;
    setPurpose(selectedPurpose);

    // Clear custom purpose if not "Other"
    if (selectedPurpose !== "Other") {
      setCustomPurpose("");
    }

    // DON'T clear staff when purpose changes
    // Staff can have multiple purposes or no specific purpose
  }, []);

  const handleOfficeChange = useCallback((e) => {
    const selectedOffice = e.target.value;
    setOffice(selectedOffice);

    // Clear custom office if not "Other"
    if (selectedOffice !== "Other") {
      setCustomOffice("");
    }

    // Clear staff only if they don't belong to the selected office
    if (selectedStaffObject && 
        selectedStaffObject.office !== selectedOffice && 
        selectedOffice !== "Other") {
      setStaffName("");
    }
  }, [selectedStaffObject]);

  const handleStaffChange = useCallback((e) => {
    const value = e.target.value;
    setStaffName(value);
  }, []);

  const handleReset = useCallback(() => {
    setPurpose("");
    setOffice("");
    setStaffName("");
    setCustomPurpose("");
    setCustomOffice("");
  }, []);

  const getFinalValues = useCallback(() => {
    const finalPurpose = purpose === "Other" ? customPurpose.trim() : purpose;
    const finalOffice = office === "Other" ? customOffice.trim() : office;

    return {
      purpose: finalPurpose,
      office: finalOffice,
      staffName,
      isValid: !!finalPurpose && !!finalOffice,
    };
  }, [purpose, customPurpose, office, customOffice, staffName]);

  return {
    purpose,
    office,
    staffName,
    customPurpose,
    customOffice,
    filteredPurposes,
    filteredOffices,
    filteredStaffOptions,
    handlePurposeChange,
    handleOfficeChange,
    handleStaffChange,
    setCustomPurpose,
    setCustomOffice,
    handleReset,
    isOfficeDisabled,
    getFinalValues,
  };
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function VisiTrakForm() {
  // Personal Information State
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [contactNumber, setContactNumber] = useState(PHONE_PREFIX);
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Error State
  const [errors, setErrors] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Visitor Info Logic
  const {
    purpose,
    office,
    staffName,
    customPurpose,
    customOffice,
    filteredPurposes,
    filteredOffices,
    filteredStaffOptions,
    handlePurposeChange,
    handleOfficeChange,
    handleStaffChange,
    setCustomPurpose,
    setCustomOffice,
    handleReset,
    isOfficeDisabled,
    getFinalValues,
  } = useVisitorInfoLogic();

  // Handle redirect on mount
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const id = searchParams.get("id");
    if (redirect) {
      const path = id ? `/${redirect}/${id}` : `/${redirect}`;
      navigate(path, { replace: true });
    }
  }, [searchParams, navigate]);

  // Event Handlers
  const handleFullNameChange = useCallback((e) => {
    const value = e.target.value;
    const validation = validateFullName(value);

    setErrors((prev) => ({ ...prev, fullName: validation.error }));

    if (validation.valid || value === "") {
      setFullName(value.toUpperCase());
    }
  }, []);

  const handleContactNumberChange = useCallback((e) => {
    const value = e.target.value;

    if (!/^[0-9]*$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        contactNumber: "Contact number can only contain numbers.",
      }));
      return;
    }

    if (value.length <= PHONE_LENGTH) {
      let newValue = value;
      if (!value.startsWith(PHONE_PREFIX)) {
        newValue = value.length <= 2 ? PHONE_PREFIX : PHONE_PREFIX + value.substring(2);
      }
      setContactNumber(newValue);

      if (newValue.length === PHONE_LENGTH) {
        setErrors((prev) => ({ ...prev, contactNumber: "" }));
      }
    }
  }, []);

  const handleEmailChange = useCallback((e) => {
    let value = e.target.value;

    // Auto-append @gmail.com
    if (value.endsWith("@")) {
      value += "gmail.com";
    }

    setEmail(value);

    const validation = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: validation.error }));
  }, []);

  const handleResetVisitorInfo = useCallback(() => {
    handleReset();
    setShowResetModal(false);
  }, [handleReset]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Reset errors
      setErrors({ fullName: "", contactNumber: "", email: "" });

      // Validate terms
      if (!agreeTerms) {
        alert("Please agree to the Terms and Conditions");
        return;
      }

      // Validate full name
      const nameValidation = validateFullName(fullName);
      if (!nameValidation.valid) {
        setErrors((prev) => ({ ...prev, fullName: nameValidation.error }));
        return;
      }

      // Get final visitor info values
      const { purpose: finalPurpose, office: finalOffice, staffName: finalStaff, isValid } = getFinalValues();

      // Validate required fields
      if (!isValid) {
        alert("Please fill in all required fields (Purpose and Office).");
        return;
      }

      if (purpose === "Other" && !customPurpose.trim()) {
        alert("Please specify your purpose of visit.");
        return;
      }

      if (office === "Other" && !customOffice.trim()) {
        alert("Please specify the office.");
        return;
      }

      // Validate contact number
      const contactValidation = validateContactNumber(contactNumber);
      if (!contactValidation.valid) {
        setErrors((prev) => ({ ...prev, contactNumber: contactValidation.error }));
        return;
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setErrors((prev) => ({ ...prev, email: emailValidation.error }));
        return;
      }

      // Generate exit key and timestamp
      const exitKey = generateExitKey();
      const checkInTime = new Date().toLocaleTimeString();

      // Navigate to success page
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
          staffName: finalStaff,
        },
      });
    },
    [
      agreeTerms,
      fullName,
      purpose,
      customPurpose,
      office,
      customOffice,
      contactNumber,
      email,
      homeAddress,
      getFinalValues,
      navigate,
    ]
  );

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #381366, #4A2279, #573483)",
      }}
    >
      <Header headerBg={headerBg} />

      <form onSubmit={handleSubmit} className="flex-1 mt-16 px-4 md:px-16 lg:px-32">
        {/* Personal Information Section */}
        <SectionCard title="Personal Information" icon={<FaUser />}>
          {errors.fullName && <p className="text-orange-400 text-sm mb-3">{errors.fullName}</p>}
          <InputField
            icon={<FaUser className="text-indigo-600" />}
            placeholder="Full Name"
            value={fullName}
            onChange={handleFullNameChange}
            aria-label="Full Name"
            required
          />

          <BoholAddressSelector homeAddress={homeAddress} setHomeAddress={setHomeAddress} />
        </SectionCard>

        {/* Visitor Information Section */}
        <SectionCard title="Visitor Information" icon={<IoLocationOutline />}>

          {/* Purpose of Visit - THIRD FIELD */}
          <SelectField
            icon={<IoNewspaperOutline className="text-indigo-600" />}
            value={purpose}
            onChange={handlePurposeChange}
            options={filteredPurposes}
            placeholder="Purpose of Visit"
            aria-label="Purpose"
            required
          />

          {purpose === "Other" && (
            <InputField
              icon={<IoNewspaperOutline className="text-indigo-600" />}
              placeholder="Please specify your purpose"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value.toUpperCase())}
              aria-label="Custom Purpose"
              required
            />
          )}
          

          {/* Office to Visit - SECOND FIELD */}
          <SelectField
            icon={<FaBuilding className="text-indigo-600" />}
            value={office}
            onChange={handleOfficeChange}
            options={filteredOffices}
            placeholder="Office to Visit"
            disabled={isOfficeDisabled}
            aria-label="Office"
            required
          />

          {office === "Other" && (
            <InputField
              icon={<FaBuilding className="text-indigo-600" />}
              placeholder="Please specify the office"
              value={customOffice}
              onChange={(e) => setCustomOffice(e.target.value.toUpperCase())}
              aria-label="Custom Office"
              required
            />
          )}

          
          

          {/* Reset Button */}
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 text-sm bg-red-400/0 text-orange-400 border border-orange-600 rounded-lg hover:bg-red-600/30 transition"
            >
              Reset
            </button>
          </div>
        </SectionCard>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <FaExclamationCircle className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Reset Visitor Information?</h3>
              </div>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to reset all visitor information fields?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetVisitorInfo}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Section */}
        <SectionCard title="Contact Information" icon={<FaPhone />}>
          {errors.contactNumber && (
            <p className="text-orange-400 text-sm mb-3">{errors.contactNumber}</p>
          )}
          <InputField
            icon={<FaPhone className="text-indigo-600" />}
            placeholder="Contact Number"
            value={contactNumber}
            onChange={handleContactNumberChange}
            aria-label="Contact Number"
            required
          />

          {errors.email && <p className="text-orange-400 text-sm mb-3">{errors.email}</p>}
          <InputField
            icon={<FaEnvelope className="text-indigo-600" />}
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={handleEmailChange}
            aria-label="Email"
          />
        </SectionCard>

        {/* Terms and Submit */}
        <TermsCheckbox
          checked={agreeTerms}
          onChange={() => setAgreeTerms(!agreeTerms)}a
          onOpenTerms={() => {}}
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold shadow-lg hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!agreeTerms}
        >
          Submit Registration
        </button>
      </form>

      <Footer />
    </div>
  );
}