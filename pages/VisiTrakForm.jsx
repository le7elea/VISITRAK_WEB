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
import BoholAddressSelector from "../components/BoholAddressSelector";
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
  const [staffName, setStaffName] = useState("");
  const [firstFilled, setFirstFilled] = useState(null);
  const [customPurpose, setCustomPurpose] = useState("");
  const [customOffice, setCustomOffice] = useState("");

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

  const officeStaffData = {
    REGISTRAR: [
      { name: "Ms. Uy", purpose: "COR/TOR" },
      { name: "Ms. Dela Cruz", purpose: "COR/TOR" },
    ],
    CLINIC: [
      { name: "Dr. Santos", purpose: "MEDICAL" },
      { name: "Dr. Villanueva", purpose: "MEDICAL" },
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

  const officeToPurposeMap = {
    REGISTRAR: ["COR/TOR", "Other"],
    CLINIC: ["Medical Checkup", "Medical Certificate", "Dental Checkup", "Other"],
    CASHIER: ["PAYMENT", "Other"],
    "ADMIN OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
    "CCIS & CTAS FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
    "CCIS EXTENSION FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
    "CCJ FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
  };

  const allStaffOptions = Object.entries(officeStaffData).flatMap(([office, staff]) =>
    staff.map((s) => ({ ...s, office }))
  );

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

  const [filteredPurposes, setFilteredPurposes] = useState(purposes);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState(allStaffOptions);

  const isOfficeAutoAssigned = purposeToOffice[purpose] !== undefined;

  useEffect(() => {
    if (office) {
      setFilteredStaffOptions(allStaffOptions.filter((s) => s.office === office));
    } else {
      setFilteredStaffOptions(allStaffOptions);
    }
  }, [office]);

  useEffect(() => {
    if (staffName) {
      const selectedStaff = allStaffOptions.find((s) => s.name === staffName);
      if (selectedStaff) {
        setOffice(selectedStaff.office);
        setOtherOffice("");
      }
    }
  }, [staffName]);

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
    setCustomPurpose(selectedPurpose === "Other" ? customPurpose : "");
    if (!firstFilled && selectedPurpose) setFirstFilled("purpose");
    setStaffName("");
  };

  // Handle office change
  const handleOfficeChange = (e) => {
    const selectedOffice = e.target.value;
    if (!isOfficeAutoAssigned && !(firstFilled === "staff" && !!staffName)) {
      setOffice(selectedOffice);
      setCustomOffice(selectedOffice === "Other" ? customOffice : "");
      setStaffName("");
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
        staffName,
      },
    });
  };

  useEffect(() => {
    if (!purpose) {
      setOffice("");
      setCustomOffice("");
      return;
    }

    if (purposeToOffice[purpose]) {
      setOffice(purposeToOffice[purpose]);
    }
  }, [purpose]);

  useEffect(() => {
    if (office && officeToPurposeMap[office]) {
      setFilteredPurposes(officeToPurposeMap[office]);
      if (purpose && purpose !== "Other" && !officeToPurposeMap[office].includes(purpose)) {
        setPurpose("");
        setCustomPurpose("");
      }
    } else {
      setFilteredPurposes(purposes);
    }
  }, [office]);

  useEffect(() => {
    if (!firstFilled) {
      if (staffName) setFirstFilled("staff");
      else if (purpose) setFirstFilled("purpose");
    }
  }, [staffName, purpose]);

  useEffect(() => {
    if (!staffName && !purpose && firstFilled) setFirstFilled(null);
  }, [staffName, purpose]);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #381366, #4A2279, #573483)",
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
          <BoholAddressSelector
            homeAddress={homeAddress}
            setHomeAddress={setHomeAddress}
          />
        </SectionCard>

        <SectionCard title="Visit Information" icon={<IoLocationOutline />}>
          <SelectField
            icon={<FaUser className="text-indigo-600" />}
            value={staffName}
            onChange={(e) => {
              const staffDisabled = firstFilled === "purpose";
              setStaffName(e.target.value);
              if (!firstFilled && e.target.value) setFirstFilled("staff");

              if (!staffDisabled && !e.target.value) {
                setPurpose("");
                setCustomPurpose("");
                setCustomOffice("");
              }
            }}
            options={filteredStaffOptions.map((s) => s.name)}
            placeholder="Staff / Instructor Name (optional)"
          />

          <SelectField
            icon={<FaBuilding className="text-indigo-600" />}
            value={office}
            onChange={handleOfficeChange}
            options={offices}
            placeholder="Office to Visit"
            disabled={!!staffName}
          />
          
          {/* Show input field when office is "Other" */}
          {office === "Other" && !isOfficeAutoAssigned && (
            <InputField
              icon={<FaBuilding className="text-indigo-600" />}
              placeholder="Please specify the office"
              value={customOffice}
              onChange={(e) => setCustomOffice(e.target.value.toUpperCase())}
            />
          )}

          <SelectField
            icon={<IoNewspaperOutline className="text-indigo-600" />}
            value={purpose}
            onChange={handlePurposeChange}
            options={filteredPurposes}
            placeholder="Purpose of Visit"
            disabled={false}
          />
          
          {/* Show input field when purpose is "Other" */}
          {purpose === "Other" && (
            <InputField
              icon={<IoNewspaperOutline className="text-indigo-600" />}
              placeholder="Please specify your purpose"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value.toUpperCase())}
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
    </div>
  );
}