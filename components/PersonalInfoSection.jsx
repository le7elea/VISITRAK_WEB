import React, { useState, useRef } from "react";
import { FaUser, FaUserCircle, FaHome } from "react-icons/fa";
import { MdWarning, MdCheckCircle } from "react-icons/md";


import SectionTitle from "./SectionTitle";
import BoholAddressSelector from "./BoholAddressSelector";
import { checkActiveVisitByName } from "../src/lib/visits.service";

export default function PersonalInfoSection({
  fullName,
  setFullName,
  fullNameRef,
  homeAddress,
  setHomeAddress,
  homeAddressRef,
  outsideBohol,
  setOutsideBohol,
  errors,
  setErrors,
  nameExistsToday,
  checkingName,
  onFullNameSubmit,
  onHomeAddressSubmit,
  isMobile = false,
  isTablet = false,
}) {
  const [nameWarning, setNameWarning] = useState("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const debounceRef = useRef(null);

  const handleOutsideToggle = (e) => {
    const nextValue = e.target.checked;
    setOutsideBohol(nextValue);
    if (!nextValue) {
      setHomeAddress("");
    }

    if (errors?.homeAddress) {
      setErrors((prev) => ({ ...prev, homeAddress: false }));
    }
  };

  const handleOutsideAddressChange = (e) => {
    setHomeAddress(e.target.value);
    if (errors?.homeAddress) {
      setErrors((prev) => ({ ...prev, homeAddress: false }));
    }
  };

  const handleOutsideAddressKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onHomeAddressSubmit?.();
    }
  };

  /* ---------------- NAME HANDLER ---------------- */
  const handleNameChange = (e) => {
    const text = e.target.value;
    const filtered = text.replace(/[^a-zA-Z\s]/g, "");
    const upper = filtered.toUpperCase();
    let warning = "";

    if (text !== filtered) warning = "Only letters and spaces are allowed";
    if (filtered.trim().length === 0 && filtered.length > 0) {
      warning = "Name cannot be only spaces";
      setNameWarning(warning);
      setFullName("");
      return;
    }

    setFullName(upper);
    setNameWarning(warning);

    if (errors?.fullName) {
      setErrors((prev) => ({ ...prev, fullName: false }));
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (upper.trim().length < 2) return;
      try {
        setCheckingDuplicate(true);
        const exists = await checkActiveVisitByName(upper.trim());
        if (exists) {
          setNameWarning("⚠️ This visitor is already checked in today");
          setErrors((prev) => ({ ...prev, fullName: true }));
        }
      } catch (err) {
        console.error("Duplicate check failed:", err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onFullNameSubmit?.();
    }
  };

  return (
    <div className="w-full px-0 mt-6 sm:mt-8">
      {/* SECTION TITLE */}
      <SectionTitle
        icon={<FaUser size={18} />}
        text="Personal Information"
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* MAIN CARD */}
      <div
        className="
          mt-3
          bg-[#5b3b8f]/70 backdrop-blur-md
          border border-[#8b6fd6]
          rounded-2xl
          p-5 sm:p-6
          relative z-30
        "
      >
        {/* WARNINGS */}
        <div className="space-y-3 mb-4">
          {nameWarning && (
            <div
              className={`
                flex items-center gap-2 p-3 rounded-lg text-sm
                ${
                  nameWarning.includes("already")
                    ? "bg-red-500/20 text-red-200 border border-red-400/40"
                    : "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                }
              `}
            >
              <MdWarning />
              <span>{nameWarning}</span>
            </div>
          )}

          {(checkingDuplicate || checkingName) && (
            <div className="flex items-center gap-3 p-3 bg-indigo-500/20 rounded-lg border border-indigo-400/40 text-indigo-200 text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-indigo-300" />
              Checking visitor…
            </div>
          )}

          {fullName && !nameWarning && !checkingDuplicate && !checkingName && (
            <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg border border-green-400/40 text-green-200 text-sm">
              <MdCheckCircle />
              Visitor name available
            </div>
          )}
        </div>

        {/* FULL NAME INPUT */}
        <div className="mb-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FaUserCircle
                size={18}
                className={
                  errors?.fullName || nameWarning
                    ? "text-red-400"
                    : "text-indigo-500"
                }
              />
            </div>

            <input
              ref={fullNameRef}
              id="fullName"
              type="text"
              value={fullName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder="Full Name"
              className={`
                w-full h-11 sm:h-12
                pl-11 pr-4
                rounded-xl
                text-[#2f2450]
                placeholder-[#7b6a9b]
                border
                focus:outline-none
                focus:ring-2
                transition
                ${
                  errors?.fullName
                    ? "border-2 border-red-500 bg-red-500/10 ring-2 ring-red-400/60 focus:ring-red-400"
                    : "border-transparent bg-[#e7def4] focus:ring-indigo-400"
                }
              `}
              autoCapitalize="words"
              autoComplete="name"
            />
          </div>
        </div>

        {/* OUTSIDE BOHOL TOGGLE */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <label
            htmlFor="outsideBoholToggle"
            className="text-sm font-semibold text-indigo-100"
          >
            Outside Bohol?
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="outsideBoholToggle"
              type="checkbox"
              checked={outsideBohol}
              onChange={handleOutsideToggle}
              className="sr-only peer"
            />
            <div className="h-6 w-11 rounded-full bg-indigo-200/70 transition-colors peer-checked:bg-emerald-400/80" />
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        {/* ADDRESS SELECTOR */}
        {outsideBohol ? (
          <div className="mb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FaHome
                  size={16}
                  className={errors?.homeAddress ? "text-red-400" : "text-indigo-500"}
                />
              </div>
              <input
                ref={homeAddressRef}
                id="homeAddress"
                type="text"
                value={homeAddress}
                onChange={handleOutsideAddressChange}
                onKeyDown={handleOutsideAddressKeyDown}
                placeholder="Complete Address (Outside Bohol)"
                className={`
                  w-full h-11 sm:h-12
                  pl-11 pr-4
                  rounded-xl
                  text-[#2f2450]
                  placeholder-[#7b6a9b]
                  border
                  focus:outline-none
                  focus:ring-2
                  transition
                  ${
                    errors?.homeAddress
                      ? "border-2 border-red-500 bg-red-500/10 ring-2 ring-red-400/60 focus:ring-red-400"
                      : "border-transparent bg-[#e7def4] focus:ring-indigo-400"
                  }
                `}
                autoComplete="street-address"
              />
            </div>
          </div>
        ) : (
          <BoholAddressSelector
            ref={homeAddressRef}
            homeAddress={homeAddress}
            setHomeAddress={setHomeAddress}
            errors={errors}
            setErrors={setErrors}
            onHomeAddressSubmit={onHomeAddressSubmit}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        )}

        {/* SELECTED ADDRESS PREVIEW */}
        {homeAddress?.barangay && (
          <div
            className="
              mt-4
              bg-[#e7def4]
              rounded-xl
              p-3
              border-l-4 border-indigo-500
            "
          >
            <p className="text-xs font-semibold text-[#4b3a6a]">
              Selected Address:
            </p>
            <p className="text-sm font-medium text-[#2f2450]">
              {homeAddress.barangay},{" "}
              {homeAddress.municipality}, Bohol
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
