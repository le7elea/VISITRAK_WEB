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
  getMunicipalities as getLocalMunicipalities,
  getBarangays as getLocalBarangays,
  formatAddressForDB,
} from "../src/data/boholAddressData";
import {
  fetchBoholCitiesMunicipalities,
  fetchBarangaysByCityMunicipalityCode,
  normalizeLocalityName,
} from "../src/lib/psgc.service";

const localMunicipalityNames = getLocalMunicipalities();

const resolveLocalMunicipalityName = (municipalityName) =>
  localMunicipalityNames.find(
    (localName) =>
      normalizeLocalityName(localName) === normalizeLocalityName(municipalityName)
  ) || municipalityName;

const getFallbackBarangays = (municipalityName) =>
  getLocalBarangays(resolveLocalMunicipalityName(municipalityName));

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
      setErrors,
      onAddressChange,
      onAddressPartsChange,
      onSubmitEditing,
      onHomeAddressSubmit,
    },
    ref
  ) => {
    const [municipality, setMunicipality] = useState("");
    const [barangay, setBarangay] = useState("");
    const [municipalityOptions, setMunicipalityOptions] = useState([]);
    const [municipalityCodeByName, setMunicipalityCodeByName] = useState({});
    const [barangayOptions, setBarangayOptions] = useState([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [isFallbackMode, setIsFallbackMode] = useState(false);

    const municipalityRef = useRef(null);
    const barangayRef = useRef(null);
    const barangayCacheRef = useRef({});
    const submitHandlerRef = useRef(null);

    /* ---------------- EXPOSE FOCUS ---------------- */
    useImperativeHandle(ref, () => ({
      focus: () => {
        municipalityRef.current?.focus();
      },
    }));

    /* ---------------- EFFECTS ---------------- */
    useEffect(() => {
      let isMounted = true;

      const loadMunicipalities = async () => {
        setLoadingMunicipalities(true);

        try {
          const rows = await fetchBoholCitiesMunicipalities();
          if (!isMounted) return;

          const names = rows.map((row) => row.name);
          const codeMap = rows.reduce((acc, row) => {
            acc[row.name] = row.code;
            return acc;
          }, {});

          setMunicipalityOptions(names);
          setMunicipalityCodeByName(codeMap);
          setIsFallbackMode(false);
        } catch (error) {
          console.warn(
            "PSGC municipalities unavailable. Falling back to local Bohol list.",
            error
          );
          if (!isMounted) return;

          setMunicipalityOptions(getLocalMunicipalities());
          setMunicipalityCodeByName({});
          setIsFallbackMode(true);
        } finally {
          if (isMounted) {
            setLoadingMunicipalities(false);
          }
        }
      };

      loadMunicipalities();

      return () => {
        isMounted = false;
      };
    }, []);

    useEffect(() => {
      submitHandlerRef.current = onHomeAddressSubmit || onSubmitEditing;
    }, [onHomeAddressSubmit, onSubmitEditing]);

    useEffect(() => {
      let isMounted = true;

      const loadBarangays = async () => {
        if (!municipality) {
          setBarangayOptions([]);
          return;
        }

        const syncBarangay = (nextBarangays) => {
          setBarangayOptions(nextBarangays);
          setBarangay((current) =>
            current && !nextBarangays.includes(current) ? "" : current
          );
        };

        if (isFallbackMode) {
          syncBarangay(getFallbackBarangays(municipality));
          return;
        }

        const municipalityCode = municipalityCodeByName[municipality];

        if (!municipalityCode) {
          syncBarangay(getFallbackBarangays(municipality));
          return;
        }

        const cached = barangayCacheRef.current[municipalityCode];
        if (cached) {
          syncBarangay(cached);
          return;
        }

        setLoadingBarangays(true);
        try {
          const apiBarangays = await fetchBarangaysByCityMunicipalityCode(
            municipalityCode
          );

          if (!isMounted) return;

          const resolvedBarangays = apiBarangays.length
            ? apiBarangays
            : getFallbackBarangays(municipality);

          barangayCacheRef.current[municipalityCode] = resolvedBarangays;
          syncBarangay(resolvedBarangays);
        } catch (error) {
          console.warn(
            "PSGC barangays unavailable. Falling back to local Bohol list.",
            error
          );
          if (!isMounted) return;
          syncBarangay(getFallbackBarangays(municipality));
        } finally {
          if (isMounted) {
            setLoadingBarangays(false);
          }
        }
      };

      loadBarangays();

      return () => {
        isMounted = false;
      };
    }, [isFallbackMode, municipality, municipalityCodeByName]);

    useEffect(() => {
      onAddressPartsChange?.({ municipality, barangay });

      if (municipality && barangay) {
        const fullAddress = `${barangay}, ${municipality}, Bohol`;
        setHomeAddress(fullAddress);

        if (onAddressChange) {
          const dbFormat = formatAddressForDB(municipality, barangay);
          onAddressChange(dbFormat);
        }

        submitHandlerRef.current?.();
      } else {
        setHomeAddress("");
        onAddressChange?.(null);
      }
    }, [
      municipality,
      barangay,
      onAddressPartsChange,
      setHomeAddress,
      onAddressChange,
    ]);

    useEffect(() => {
      if (homeAddress && !municipality && !barangay) {
        const parts = homeAddress.split(", ");
        if (parts.length >= 2) {
          const parsedBarangay = parts[0];
          const parsedMunicipality = parts[1];

          const resolvedMunicipality =
            municipalityOptions.find(
              (option) =>
                normalizeLocalityName(option) ===
                normalizeLocalityName(parsedMunicipality)
            ) || parsedMunicipality;

          setBarangay(parsedBarangay);
          setMunicipality(resolvedMunicipality);
        }
      }
    }, [barangay, homeAddress, municipality, municipalityOptions]);

    /* ---------------- HANDLERS ---------------- */
    const handleMunicipalityChange = (value) => {
      setMunicipality(value);
      setBarangay("");
      if (setErrors && errors?.homeAddress) {
        setErrors((prev) => ({ ...prev, homeAddress: false }));
      }

      setTimeout(() => {
        barangayRef.current?.focus();
      }, 200);
    };

    const handleBarangayChange = (value) => {
      setBarangay(value);
      if (setErrors && errors?.homeAddress) {
        setErrors((prev) => ({ ...prev, homeAddress: false }));
      }
    };

    /* ---------------- UI ---------------- */
    return (
      <div className="mt-4 space-y-4">
        {/* MUNICIPALITY */}
        <AutoCompleteSelect
          ref={municipalityRef}
          value={municipality}
          onChange={handleMunicipalityChange}
          options={municipalityOptions}
          placeholder="Select Municipality"
          disabled={loadingMunicipalities}
          hasError={errors?.homeAddress}
          icon={<FaHome className="text-indigo-500" size={16} />}
        />
        {loadingMunicipalities && (
          <p className="text-xs text-indigo-200">Loading municipalities...</p>
        )}
        {!loadingMunicipalities && isFallbackMode && (
          <p className="text-xs text-amber-200">
            PSGC is unavailable. Using local Bohol address list.
          </p>
        )}

        {/* BARANGAY */}
        {municipality && (
          <AutoCompleteSelect
            ref={barangayRef}
            value={barangay}
            onChange={handleBarangayChange}
            options={barangayOptions}
            placeholder="Select Barangay"
            disabled={loadingBarangays}
            hasError={errors?.homeAddress}
            icon={<FaMapMarkerAlt className="text-indigo-500" size={16} />}
          />
        )}
        {municipality && loadingBarangays && (
          <p className="text-xs text-indigo-200">Loading barangays...</p>
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
