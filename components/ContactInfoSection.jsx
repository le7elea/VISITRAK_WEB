import React, { useState, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { MdContactPhone } from "react-icons/md";

import SectionTitle from "./SectionTitle";

export default function ContactInfoSection({
  contactNumber,
  setContactNumber,
  contactNumberRef,
  email,
  setEmail,
  emailRef,
  errors,
  setErrors,
  onContactSubmit,
  onEmailSubmit,
  isMobile = false,
  isTablet = false,
}) {
  const [contactWarning, setContactWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  // Contact Number Handler (matching React Native logic)
  const handleContactChange = (e) => {
    const text = e.target.value;
    const hasNonDigit = /[^0-9]/.test(text);
    let filteredText = text.replace(/[^0-9]/g, "");

    if (filteredText.length === 0) {
      setContactNumber("");
      setContactWarning("");
      if (setErrors) setErrors(prev => ({ ...prev, contactNumber: false }));
      return;
    }

    // Auto-format to Philippine number (09XXXXXXXXX)
    if (!filteredText.startsWith("09")) {
      filteredText = filteredText.startsWith("0") ? "09" + filteredText.substring(1) : "09" + filteredText;
    }

    if (filteredText.length > 11) filteredText = filteredText.slice(0, 11);

    if (hasNonDigit) {
      setContactWarning("Only numbers are allowed");
    } else if (filteredText.length > 0 && filteredText.length !== 11) {
      setContactWarning("Contact number must be 11 digits");
    } else {
      setContactWarning("");
    }

    setContactNumber(filteredText);

    if (errors?.contactNumber && setErrors) {
      setErrors(prev => ({ ...prev, contactNumber: false }));
    }
  };

  const handleContactKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onContactSubmit) onContactSubmit();
    }
  };

  // Email Handler (matching React Native logic)
  const handleEmailChange = (e) => {
    const text = e.target.value;
    let processedText = text;

    // Auto-complete @gmail.com
    if (text.includes("@") && !text.toLowerCase().endsWith("@gmail.com")) {
      const atIndex = text.indexOf("@");
      const beforeAt = text.slice(0, atIndex + 1);
      if (beforeAt.length > 1 && !text.toLowerCase().endsWith("gmail.com")) {
        processedText = beforeAt + "gmail.com";
      }
    }

    setEmail(processedText);

    if (processedText.trim() !== "") {
      if (!processedText.toLowerCase().endsWith("@gmail.com")) {
        setEmailWarning("Email must end with @gmail.com");
      } else {
        setEmailWarning("");
      }
    } else {
      setEmailWarning("");
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEmailSubmit) onEmailSubmit();
    }
  };

  return (
    <div className="w-full px-0 mt-6 sm:mt-8">
      {/* SECTION TITLE - Matching styling with other sections */}
      <SectionTitle
        icon={<MdContactPhone size={18} />}
        text="Contact Information"
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* MAIN CARD - Matching styling with PersonalInfoSection and VisitInfoSection */}
      <div className="mt-3 bg-[#5b3b8f]/70 backdrop-blur-md border border-[#8b6fd6] rounded-2xl p-5 sm:p-6">
        {/* CONTACT WARNING */}
        {contactWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/20 rounded-lg border border-amber-400/40 text-amber-200 text-sm mb-4">
            <span>⚠️</span>
            <span>{contactWarning}</span>
          </div>
        )}

        {/* CONTACT NUMBER INPUT */}
        <div className="mb-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FaPhoneAlt
                size={18}
                className={
                  errors?.contactNumber || contactWarning
                    ? "text-red-400"
                    : "text-indigo-500"
                }
              />
            </div>

            <input
              ref={contactNumberRef}
              id="contactNumber"
              type="tel"
              value={contactNumber || "09"}
              onChange={handleContactChange}
              onKeyDown={handleContactKeyDown}
              placeholder="Contact Number"
              className={`
                w-full h-11 sm:h-12
                pl-11 pr-4
                rounded-xl
                bg-[#e7def4]
                text-[#2f2450]
                placeholder-[#7b6a9b]
                border border-transparent
                focus:outline-none
                focus:ring-2 focus:ring-indigo-400
                transition
                ${errors?.contactNumber ? 'border-red-500' : ''}
                text-base
              `}
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* EMAIL WARNING */}
        {emailWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/20 rounded-lg border border-amber-400/40 text-amber-200 text-sm mb-4">
            <span>⚠️</span>
            <span>{emailWarning}</span>
          </div>
        )}

        {/* EMAIL INPUT */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FaEnvelope
              size={18}
              className={
                emailWarning
                  ? "text-amber-400"
                  : "text-indigo-500"
              }
            />
          </div>

          <input
            ref={emailRef}
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleEmailKeyDown}
            placeholder="Email (Optional)"
            className={`
              w-full h-11 sm:h-12
              pl-11 pr-4
              rounded-xl
              bg-[#e7def4]
              text-[#2f2450]
              placeholder-[#7b6a9b]
              border border-transparent
              focus:outline-none
              focus:ring-2 focus:ring-indigo-400
              transition
              ${emailWarning ? 'border-amber-500' : ''}
              text-base
            `}
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </div>
    </div>
  );
}
