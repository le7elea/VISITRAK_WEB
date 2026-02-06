import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

import {
  getMunicipalities,
  getBarangays,
  formatAddressForDB,
} from "../src/data/boholAddressData";

const BoholAddressSelector = forwardRef(
  (
    {
      homeAddress,
      setHomeAddress,
      errors,
      onAddressChange,
      onAddressPartsChange,
      onSubmitEditing,
    },
    ref
  ) => {
    const [municipality, setMunicipality] = useState("");
    const [barangay, setBarangay] = useState("");

    const municipalityRef = useRef(null);
    const barangayRef = useRef(null);

    const municipalities = getMunicipalities();
    const barangayList = municipality ? getBarangays(municipality) : [];

    /* ---------------- EXPOSE FOCUS ---------------- */
    useImperativeHandle(ref, () => ({
      focus: () => {
        municipalityRef.current?.focus();
      },
    }));

    /* ---------------- EFFECTS ---------------- */
    useEffect(() => {
      onAddressPartsChange?.({ municipality, barangay });

      if (municipality && barangay) {
        const fullAddress = `${barangay}, ${municipality}, Bohol`;
        setHomeAddress(fullAddress);

        if (onAddressChange) {
          const dbFormat = formatAddressForDB(municipality, barangay);
          onAddressChange(dbFormat);
        }

        onSubmitEditing?.();
      } else {
        setHomeAddress("");
        onAddressChange?.(null);
      }
    }, [municipality, barangay]);

    useEffect(() => {
      if (homeAddress && !municipality && !barangay) {
        const parts = homeAddress.split(", ");
        if (parts.length >= 2) {
          setBarangay(parts[0]);
          setMunicipality(parts[1]);
        }
      }
    }, []);

    /* ---------------- HANDLERS ---------------- */
    const handleMunicipalityChange = (e) => {
      setMunicipality(e.target.value);
      setBarangay("");

      setTimeout(() => {
        barangayRef.current?.focus();
      }, 200);
    };

    const handleBarangayChange = (e) => {
      setBarangay(e.target.value);
    };

    /* ---------------- UI ---------------- */
    return (
      <div className="mt-4 space-y-4">
        {/* MUNICIPALITY */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FaHome className="text-indigo-500" size={16} />
          </div>

          <select
            ref={municipalityRef}
            value={municipality}
            onChange={handleMunicipalityChange}
            className={`
              w-full h-11 sm:h-12
              pl-11 pr-10
              rounded-xl
              bg-[#e7def4]
              text-[#2f2450]
              text-sm sm:text-base
              appearance-none
              border
              ${
                errors?.homeAddress
                  ? "border-red-400 focus:ring-red-400"
                  : "border-transparent focus:ring-indigo-400"
              }
              focus:outline-none focus:ring-2
              transition
            `}
          >
            <option value="">Select Municipality</option>
            {municipalities.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-[#5c4a87]" />
          </div>
        </div>

        {/* BARANGAY */}
        {municipality && (
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-indigo-500" size={16} />
            </div>

            <select
              ref={barangayRef}
              value={barangay}
              onChange={handleBarangayChange}
              className={`
                w-full h-11 sm:h-12
                pl-11 pr-10
                rounded-xl
                bg-[#e7def4]
                text-[#2f2450]
                text-sm sm:text-base
                border
                appearance-none
                ${
                  errors?.homeAddress
                    ? "border-red-400 focus:ring-red-400"
                    : "border-transparent focus:ring-indigo-400"
                }
                focus:outline-none focus:ring-2
                transition
              `}
            >
              <option value="">Select Barangay</option>
              {barangayList.map((brgy) => (
                <option key={brgy} value={brgy}>
                  {brgy}
                </option>
              ))}
            </select>

            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <ChevronDown size={18} className="text-[#5c4a87]" />
            </div>
          </div>
        )}

        {/* SELECTED ADDRESS */}
        {municipality && barangay && (
          <div className="
            bg-[#e7def4]
            rounded-xl
            p-3
            border-l-4 border-indigo-500
          ">
            <p className="text-xs font-semibold text-[#4b3a6a]">
              Selected Address:
            </p>
            <p className="text-sm font-medium text-[#2f2450]">
              {homeAddress}
            </p>
          </div>
        )}

        {/* ERROR */}
        {errors?.homeAddress && (
          <p className="text-sm text-red-500">
            {errors.homeAddress}
          </p>
        )}
      </div>
    );
  }
);

export default BoholAddressSelector;
