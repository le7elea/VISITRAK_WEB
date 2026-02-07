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

const AutoCompleteSelect = forwardRef(
  (
    {
      value,
      onChange,
      options = [],
      placeholder,
      disabled = false,
      hasError = false,
      icon,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        inputRef.current?.select?.();
      },
      open: () => {
        if (!disabled) setOpen(true);
      },
    }));

    useEffect(() => {
      const handleOutside = (e) => {
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(e.target)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    useEffect(() => {
      if (!open) {
        setQuery(value || "");
        setIsUserTyping(false);
        setHighlightIndex(-1);
      }
    }, [open, value]);

    const filteredOptions = options.filter((opt) => {
      if (!isUserTyping || !query.trim()) return true;
      return opt.toLowerCase().includes(query.trim().toLowerCase());
    });

    useEffect(() => {
      if (!open) return;
      if (!filteredOptions.length) {
        setHighlightIndex(-1);
        return;
      }
      const currentIndex = filteredOptions.indexOf(value);
      if (!isUserTyping && currentIndex >= 0) {
        setHighlightIndex(currentIndex);
      } else if (highlightIndex < 0 || highlightIndex >= filteredOptions.length) {
        setHighlightIndex(0);
      }
    }, [open, filteredOptions, value, isUserTyping, highlightIndex]);

    const handleToggle = () => {
      if (disabled) return;
      setOpen(true);
    };

    const handleFocus = () => {
      if (!disabled) {
        setOpen(true);
        setIsUserTyping(false);
      }
    };

    const handleInputChange = (e) => {
      setQuery(e.target.value);
      setIsUserTyping(true);
      if (!open) setOpen(true);
      setHighlightIndex(0);
    };

    const handleKeyDown = (e) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setIsUserTyping(true);
          return;
        }

        if (highlightIndex >= 0) {
          const selected = filteredOptions[highlightIndex];
          if (selected) onChange?.(selected);
          setOpen(false);
          setQuery(selected || "");
          setIsUserTyping(false);
          return;
        }

        const exactMatch = options.find(
          (opt) => opt.toLowerCase() === query.trim().toLowerCase()
        );
        if (exactMatch) {
          onChange?.(exactMatch);
          setQuery(exactMatch);
        }
        setOpen(false);
        setIsUserTyping(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlightIndex((prev) =>
          Math.min(filteredOptions.length - 1, Math.max(0, prev + 1))
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlightIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    const handleOptionSelect = (opt) => {
      if (disabled) return;
      onChange?.(opt);
      setOpen(false);
      setQuery(opt);
      setIsUserTyping(false);
    };

    const finalizeInput = () => {
      if (!isUserTyping) return;
      const exactMatch = options.find(
        (opt) => opt.toLowerCase() === query.trim().toLowerCase()
      );
      if (exactMatch && exactMatch !== value) {
        onChange?.(exactMatch);
        setQuery(exactMatch);
      } else {
        setQuery(value || "");
      }
      setIsUserTyping(false);
    };

    return (
      <div
        ref={wrapperRef}
        className="relative"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setOpen(false);
            finalizeInput();
          }
        }}
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {icon}
        </div>

        <input
          type="text"
          ref={inputRef}
          disabled={disabled}
          value={isUserTyping ? query : value || ""}
          onChange={handleInputChange}
          onClick={handleToggle}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
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
              hasError
                ? "border-2 border-red-500 bg-red-500/10 ring-2 ring-red-400/60 focus:ring-red-400"
                : "border-transparent focus:ring-indigo-400"
            }
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            focus:outline-none focus:ring-2
            transition
          `}
          placeholder={placeholder}
          aria-haspopup="listbox"
          aria-expanded={open}
          role="combobox"
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <ChevronDown size={18} className="text-[#5c4a87]" />
        </div>

        {open && !disabled && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-[#cbb7ec] bg-[#f4effb] shadow-lg">
            <ul role="listbox" className="max-h-56 overflow-auto py-1">
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-[#6d5f88]">
                  No options available
                </li>
              )}
              {filteredOptions.map((opt, idx) => {
                const isSelected = value === opt;
                const isActive = highlightIndex === idx;
                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleOptionSelect(opt)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/20 text-[#2f2450] font-semibold"
                        : isActive
                        ? "bg-indigo-500/10 text-[#2f2450]"
                        : "text-[#2f2450]"
                    }`}
                  >
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

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
    const handleMunicipalityChange = (value) => {
      setMunicipality(value);
      setBarangay("");

      setTimeout(() => {
        barangayRef.current?.focus();
      }, 200);
    };

    const handleBarangayChange = (value) => {
      setBarangay(value);
    };

    /* ---------------- UI ---------------- */
    return (
      <div className="mt-4 space-y-4">
        {/* MUNICIPALITY */}
        <AutoCompleteSelect
          ref={municipalityRef}
          value={municipality}
          onChange={handleMunicipalityChange}
          options={municipalities}
          placeholder="Select Municipality"
          hasError={errors?.homeAddress}
          icon={<FaHome className="text-indigo-500" size={16} />}
        />

        {/* BARANGAY */}
        {municipality && (
          <AutoCompleteSelect
            ref={barangayRef}
            value={barangay}
            onChange={handleBarangayChange}
            options={barangayList}
            placeholder="Select Barangay"
            hasError={errors?.homeAddress}
            icon={<FaMapMarkerAlt className="text-indigo-500" size={16} />}
          />
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
