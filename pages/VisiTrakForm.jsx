import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import BackgroundCarousel from "../components/BackgroundCarousel";
import PersonalInfoSection from "../components/PersonalInfoSection";
import VisitInfoSection from "../components/VisitInfoSection";
import ContactInfoSection from "../components/ContactInfoSection";
import TermsAgreement from "../components/TermsAgreement";
import SubmitButton from "../components/SubmitButton";
import DuplicateVisitModal from "../components/DuplicateVisitModal";

import backG01 from "../src/assets/backG009.png";
import backG02 from "../src/assets/backG004.png";
import backG03 from "../src/assets/backG010.png";

import { addVisit, checkActiveVisitByName } from "../src/lib/visits.service";

const toAddressText = (value) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const barangay = typeof value.barangay === "string" ? value.barangay.trim() : "";
    const municipality =
      typeof value.municipality === "string" ? value.municipality.trim() : "";
    const province = typeof value.province === "string" ? value.province.trim() : "";

    return [barangay, municipality, province].filter(Boolean).join(", ").trim();
  }

  return "";
};

export default function VisiTrakForm() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);

  /* 🔹 SECTION POSITIONS */
  const sectionPositions = useRef({});

  /* 🔹 INPUT REFS */
  const fullNameRef = useRef(null);
  const homeAddressRef = useRef(null);
  const customOfficeRef = useRef(null);
  const customPurposeRef = useRef(null);
  const contactNumberRef = useRef(null);
  const emailRef = useRef(null);
  const agreeTermsRef = useRef(null);

  /* 🔹 FORM STATE */
  const [fullName, setFullName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [outsideBohol, setOutsideBohol] = useState(false);
  const [office, setOffice] = useState("");
  const [customOffice, setCustomOffice] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [staffName, setStaffName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emojiRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* 🔹 DUPLICATE CHECK STATE */
  const [nameExistsToday, setNameExistsToday] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [duplicateVisitInfo, setDuplicateVisitInfo] = useState(null);

  /* 🔹 MODAL STATE */
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);

  /* 🔹 RESPONSIVE STATE */
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const images = [backG01, backG02, backG03];

  /* 🔹 HANDLE RESPONSIVE BREAKPOINTS */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 🔹 SCROLL TO SECTION */
  const scrollToSection = (section) => {
    const y = sectionPositions.current[section];
    if (y !== undefined) {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: Math.max(0, y - (isMobile ? 80 : 40)),
          behavior: "smooth",
        });
      }
    }
  };

  /* 🔹 SECTION → FIELD MAPPING */
  const sectionErrorMap = {
    personal: ["fullName", "homeAddress"],
    visit: ["office", "customOffice", "purpose", "customPurpose"],
    contact: ["contactNumber"],
    terms: ["agreeTerms"],
  };

  /* ======================================================
     🔍 AUTO DUPLICATE CHECK (RUNS WHILE TYPING FULL NAME)
  ====================================================== */
  useEffect(() => {
    const handler = setTimeout(async () => {
      const name = fullName.trim();
      if (name.length < 3) {
        setNameExistsToday(false);
        setDuplicateVisitInfo(null);
        return;
      }

      setCheckingName(true);
      try {
        const existingVisit = await checkActiveVisitByName(name);
        if (existingVisit) {
          setNameExistsToday(true);
          setDuplicateVisitInfo(existingVisit);
          setErrors((prev) => ({ ...prev, fullName: true }));
          setDuplicateModalVisible(true);
        } else {
          setNameExistsToday(false);
          setDuplicateVisitInfo(null);
        }
      } catch (error) {
        console.error("❌ Name duplicate check error:", error);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [fullName]);

  /* 🔹 FOCUS MANAGEMENT FOR RESPONSIVE */
  const handleInputSubmit = (nextRef) => {
    if (nextRef && nextRef.current) {
      // Small delay for mobile keyboard management
      setTimeout(() => {
        nextRef.current.focus();
      }, isMobile ? 100 : 0);
    }
  };

  /* 🔹 SUBMIT */
  const onSubmit = async () => {
    if (submitting) return;

    // 🔴 BLOCK IF DUPLICATE FOUND
    if (nameExistsToday && duplicateVisitInfo) {
      setDuplicateModalVisible(true);
      scrollToSection("personal");
      return;
    }

    const digitsOnly = (contactNumber || "").replace(/[^0-9]/g, "");
    const normalizedAddress = toAddressText(homeAddress);

    const newErrors = {
      fullName: fullName.trim() === "",
      homeAddress: normalizedAddress === "",
      office: office.trim() === "",
      customOffice: office === "Other" && customOffice.trim() === "",
      purpose: purpose.trim() === "",
      customPurpose: purpose === "Other" && customPurpose.trim() === "",
      contactNumber: digitsOnly.length !== 11,
      agreeTerms: !agreeTerms,
    };

    setErrors(newErrors);

    // 🔹 FIND FIRST SECTION WITH ERROR
    for (const section in sectionErrorMap) {
      const hasError = sectionErrorMap[section].some(
        (field) => newErrors[field]
      );
      if (hasError) {
        scrollToSection(section);
        return;
      }
    }

    // 🔹 ALL VALID
    const finalOffice = office === "Other" ? customOffice : office;
    const finalPurpose = purpose === "Other" ? customPurpose : purpose;

    const visitData = {
      name: fullName,
      address: normalizedAddress,
      office: finalOffice,
      purpose: finalPurpose,
      staffName: staffName.trim(),
      contactNumber: digitsOnly,
      email: email.trim().toLowerCase(),
      rating: emojiRating,
      comment: "",
      checkOutTime: null,
    };

    setSubmitting(true);
    try {
      await addVisit(visitData);
      const checkInTimeDisplay = new Date().toLocaleTimeString();
      navigate("/success", {
        state: { ...visitData, checkInTime: checkInTimeDisplay },
      });
    } catch (error) {
      console.error("Firestore submission error:", error);
      alert(error?.message || "Failed to submit visit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483]"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #381366, #4A2279, #573483)'
      }}
    >
      <div 
        ref={containerRef}
        className="min-h-screen h-[100dvh] overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        {/* Background Carousel (edge-to-edge) */}
        <div className="w-full pb-6 sm:pb-8 lg:pb-10">
          <BackgroundCarousel 
            images={images} 
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>

        <div 
          ref={formRef}
          className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8"
        >

          {/* 🔹 PERSONAL INFO */}
          <div
            ref={(el) => {
              if (el) {
                sectionPositions.current.personal = el.offsetTop;
              }
            }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <PersonalInfoSection
              fullName={fullName}
              setFullName={setFullName}
              fullNameRef={fullNameRef}
              homeAddress={homeAddress}
              setHomeAddress={setHomeAddress}
              homeAddressRef={homeAddressRef}
              outsideBohol={outsideBohol}
              setOutsideBohol={setOutsideBohol}
              errors={errors}
              setErrors={setErrors}
              checkingName={checkingName}
              onFullNameSubmit={() => handleInputSubmit(homeAddressRef)}
              onHomeAddressSubmit={() => handleInputSubmit(customOfficeRef)}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          {/* 🔹 VISIT INFO */}
          <div
            ref={(el) => {
              if (el) {
                sectionPositions.current.visit = el.offsetTop;
              }
            }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <VisitInfoSection
              purpose={purpose}
              setPurpose={setPurpose}
              office={office}
              setOffice={setOffice}
              customOffice={customOffice}
              setCustomOffice={setCustomOffice}
              customPurpose={customPurpose}
              setCustomPurpose={setCustomPurpose}
              staffName={staffName}
              setStaffName={setStaffName}
              errors={errors}
              setErrors={setErrors}
              customOfficeRef={customOfficeRef}
              customPurposeRef={customPurposeRef}
              onCustomOfficeSubmit={() => handleInputSubmit(contactNumberRef)}
              onCustomPurposeSubmit={() => handleInputSubmit(contactNumberRef)}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          {/* 🔹 CONTACT INFO */}
          <div
            ref={(el) => {
              if (el) {
                sectionPositions.current.contact = el.offsetTop;
              }
            }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <ContactInfoSection
              contactNumber={contactNumber}
              setContactNumber={setContactNumber}
              contactNumberRef={contactNumberRef}
              email={email}
              setEmail={setEmail}
              emailRef={emailRef}
              errors={errors}
              setErrors={setErrors}
              onContactSubmit={() => handleInputSubmit(emailRef)}
              onEmailSubmit={onSubmit}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          {/* 🔹 TERMS */}
          <div
            ref={(el) => {
              if (el) {
                sectionPositions.current.terms = el.offsetTop;
              }
            }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <TermsAgreement
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms}
              ref={agreeTermsRef}
              errors={errors}
              setErrors={setErrors}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          <div className="mt-8 sm:mt-12 lg:mt-16">
            <SubmitButton 
              onPress={onSubmit} 
              disabled={submitting}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16">
            <Footer isMobile={isMobile} isTablet={isTablet} />
          </div>
        </div>
      </div>

      {/* 🔹 DUPLICATE MODAL WITH VISITOR DETAILS */}
      <DuplicateVisitModal
        visible={duplicateModalVisible}
        onClose={() => setDuplicateModalVisible(false)}
        onProceed={() => {
          setDuplicateModalVisible(false);
          navigate("/exit");
        }}
        visitorData={duplicateVisitInfo}
        isMobile={isMobile}
        isTablet={isTablet}
      />
    </div>
  );
}
