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

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-redirect if QR contains ?redirect=xxx&id=yyy
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const id = searchParams.get("id");

    if (redirect) {
      if (id) {
        navigate(`/${redirect}/${id}`, { replace: true });
      } else {
        navigate(`/${redirect}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  const purposes = ["COR/TOR", "Medical", "Delivery", "Maintenance", "Other"];
  const offices = [
    "Registrar",
    "Clinic",
    "Finance Office",
    "IT Support",
    "Management",
  ];

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
    if (!fullName || !purpose || !office || !contactNumber) {
      alert("Please fill in all required fields");
      return;
    }

    const exitKey = generateExitKey();
    const checkInTime = new Date().toLocaleTimeString();

    navigate("/success", {
      state: {
        fullName,
        homeAddress,
        purpose,
        office,
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
      style={{ background: "linear-gradient(to bottom, #1A237E, #3949AB, #5C6BC0)" }}
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
            onChange={(e) => setFullName(e.target.value)}
          />
          <InputField
            icon={<FaHome className="text-indigo-600" />}
            placeholder="Home Address"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
          />
        </SectionCard>

        <SectionCard title="Visit Information" icon={<IoLocationOutline />}>
          <SelectField
            icon={<IoNewspaperOutline className="text-indigo-600" />}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            options={purposes}
            placeholder="Purpose of Visit"
          />
          <SelectField
            icon={<FaBuilding className="text-indigo-600" />}
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            options={offices}
            placeholder="Office to Visit"
          />
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
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-900 text-white font-bold shadow-lg hover:bg-indigo-800 transition"
        >
          Submit Registration
        </button>
      </form>

      <Footer />
    </div>
  );
}
