import React, { 
  useState, 
  useEffect, 
  forwardRef, 
  useImperativeHandle, 
  useRef, 
  useCallback, 
  useMemo 
} from "react";
import { 
  MapPin, 
  UserCircle, 
  Building2, 
  Newspaper, 
  PenLine, 
  AlertCircle 
} from "lucide-react";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";
import { fetchOffices } from "../src/lib/info.services";

const VisitInfoSection = forwardRef(({
  purpose,
  setPurpose,
  office,
  setOffice,
  customOffice,
  setCustomOffice,
  customPurpose,
  setCustomPurpose,
  staffName,
  setStaffName,
  errors = {},
  setErrors,
  customOfficeRef,
  customPurposeRef,
  onCustomPurposeSubmit,
}, ref) => {
  // State declarations
  const [firstFilledField, setFirstFilledField] = useState(null);
  const [offices, setOffices] = useState([]);
  const [allPurposes, setAllPurposes] = useState([]);
  const [allOffices, setAllOffices] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [filteredPurposes, setFilteredPurposes] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const staffFieldRef = useRef(null);
  const officeFieldRef = useRef(null);
  const purposeFieldRef = useRef(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => officeFieldRef.current?.focus?.(),
    reset: handleReset
  }));

  // Memoized data mappings
  const purposeToOfficeMap = useMemo(() => {
    const map = {};
    offices.forEach(office => {
      if (office.name && office.purposes && Array.isArray(office.purposes)) {
        office.purposes.forEach(p => {
          if (p?.name) {
            if (!map[p.name]) map[p.name] = [];
            if (!map[p.name].includes(office.name)) {
              map[p.name].push(office.name);
            }
          }
        });
      }
    });
    return map;
  }, [offices]);

  const officeToPurposeMap = useMemo(() => {
    const map = {};
    offices.forEach(office => {
      if (!office.name) return;
      if (office.purposes && Array.isArray(office.purposes)) {
        const purposeNames = office.purposes
          .map(p => p.name)
          .filter(name => name && name.trim() !== "");
        
        if (purposeNames.length > 0) {
          map[office.name] = purposeNames;
        } else {
          map[office.name] = allPurposes;
        }
      } else {
        map[office.name] = allPurposes;
      }
    });
    return map;
  }, [offices, allPurposes]);

  // Data fetching
  useEffect(() => {
    const loadOfficeData = async () => {
      try {
        setIsLoading(true);
        const fetchedOffices = await fetchOffices();
        
        // Filter out super admin offices
        const visitorOffices = fetchedOffices.filter(
          office => office.role !== "super" && office.name?.trim()
        );
        
        setOffices(visitorOffices);
        initializeData(visitorOffices);
        
        console.log(`✅ Loaded ${visitorOffices.length} visitor offices`);
        console.log(`✅ ${visitorOffices.reduce((acc, o) => acc + (o.purposes?.length || 0), 0)} purposes available`);
        console.log(`✅ ${visitorOffices.reduce((acc, o) => acc + (o.staffToVisit?.length || 0), 0)} staff members available`);
        
      } catch (error) {
        console.error("❌ Error fetching offices:", error);
        handleDataLoadError();
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficeData();
  }, []);

  const initializeData = (visitorOffices) => {
    // Extract office names
    const officeNames = visitorOffices
      .map(o => o.name)
      .filter(name => name && name.trim() !== "");
    
    const officesWithOther = [...officeNames, "Other"];
    setAllOffices(officeNames);
    setFilteredOffices(officesWithOther);

    // Extract purposes
    const purposeSet = new Set();
    visitorOffices.forEach(office => {
      if (office.purposes && Array.isArray(office.purposes)) {
        office.purposes.forEach(p => {
          if (p?.name?.trim()) purposeSet.add(p.name);
        });
      }
    });
    const purposesArray = Array.from(purposeSet);
    setAllPurposes(purposesArray);
    setFilteredPurposes([...purposesArray, "Other"]);

    // Extract staff
    const staffList = [];
    visitorOffices.forEach(office => {
      if (office.staffToVisit && Array.isArray(office.staffToVisit)) {
        office.staffToVisit.forEach(staff => {
          if (staff?.name?.trim()) {
            staffList.push({
              name: staff.name,
              office: office.name,
              purpose: staff.purpose || null,
            });
          }
        });
      }
    });
    setAllStaff(staffList);
    setFilteredStaffOptions(staffList.map(s => s.name));
  };

  const handleDataLoadError = () => {
    // Fallback data
    const fallbackOffices = ["REGISTRAR", "CLINIC", "CASHIER", "CCIS/CTAS OFFICE", "Other"];
    const fallbackPurposes = ["COR/TOR", "MEDICAL", "PAYMENT", "INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"];
    
    setAllOffices(fallbackOffices.filter(o => o !== "Other"));
    setFilteredOffices(fallbackOffices);
    setAllPurposes(fallbackPurposes.filter(p => p !== "Other"));
    setFilteredPurposes(fallbackPurposes);
    
    alert("Could not load office data. Using default options.");
  };

  // Field dependency logic
  useEffect(() => {
    if (firstFilledField === "staff" && staffName) {
      const selectedStaff = allStaff.find(s => s.name === staffName);
      if (!selectedStaff) return;

      const { office: staffOffice } = selectedStaff;
      setOffice(staffOffice);
      setFilteredOffices([staffOffice]);
      
      const officePurposes = officeToPurposeMap[staffOffice] || allPurposes;
      setFilteredPurposes([...officePurposes, "Other"]);
      
      const staffInOffice = allStaff
        .filter(s => s.office === staffOffice)
        .map(s => s.name);
      setFilteredStaffOptions(staffInOffice);

      setTimeout(() => purposeFieldRef.current?.focus?.(), 200);
    }
  }, [staffName, firstFilledField, allStaff, officeToPurposeMap, allPurposes, setOffice]);

  useEffect(() => {
    if (firstFilledField === "purpose" && purpose && purpose !== "Other") {
      const officesForPurpose = purposeToOfficeMap[purpose];
      if (!officesForPurpose) return;

      setFilteredOffices([...officesForPurpose, "Other"]);
      
      const staffForPurpose = allStaff
        .filter(s => officesForPurpose.includes(s.office))
        .map(s => s.name);
      setFilteredStaffOptions(staffForPurpose);

      if (officesForPurpose.length === 1 && !office) {
        setOffice(officesForPurpose[0]);
      }
      
      // Reset office if it's not in the filtered list
      if (office && !officesForPurpose.includes(office) && office !== "Other") {
        setOffice("");
      }
    }
  }, [purpose, firstFilledField, purposeToOfficeMap, allStaff, office, setOffice]);

  useEffect(() => {
    if (firstFilledField === "office" && office && office !== "Other") {
      const purposes = officeToPurposeMap[office] || allPurposes;
      setFilteredPurposes([...purposes, "Other"]);

      const staffInOffice = allStaff
        .filter(s => s.office === office)
        .map(s => s.name);
      setFilteredStaffOptions(staffInOffice);

      // Reset purpose if it's not in the filtered list
      if (purpose && !purposes.includes(purpose) && purpose !== "Other") {
        setPurpose("");
      }

      setTimeout(() => purposeFieldRef.current?.focus?.(), 200);
    }
  }, [office, firstFilledField, officeToPurposeMap, allStaff, purpose, setPurpose]);

  // Reset filters when all fields are empty
  useEffect(() => {
    if (!staffName && !purpose && !office) {
      setFirstFilledField(null);
      setFilteredOffices([...allOffices, "Other"]);
      setFilteredPurposes([...allPurposes, "Other"]);
      setFilteredStaffOptions(allStaff.map(s => s.name));
    }
  }, [staffName, purpose, office, allOffices, allPurposes, allStaff]);

  // Determine first filled field
  useEffect(() => {
    if (!firstFilledField) {
      if (staffName) setFirstFilledField("staff");
      else if (purpose) setFirstFilledField("purpose");
      else if (office) setFirstFilledField("office");
    }
  }, [staffName, purpose, office, firstFilledField]);

  // Handlers
  const handleReset = useCallback(() => {
    setPurpose("");
    setOffice("");
    setCustomPurpose("");
    setCustomOffice("");
    setStaffName("");
    setErrors?.(prev => ({ 
      ...prev, 
      purpose: false, 
      office: false 
    }));
    setShowResetConfirm(false);
    setFirstFilledField(null);
  }, [setPurpose, setOffice, setCustomPurpose, setCustomOffice, setStaffName, setErrors]);

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const handleOfficeChange = useCallback((value) => {
    setOffice(value);
    if (errors?.office) setErrors(prev => ({ ...prev, office: false }));
    
    if (!firstFilledField) setFirstFilledField("office");
    
    if (value === "Other") {
      setTimeout(() => customOfficeRef?.current?.focus?.(), 300);
    } else {
      setTimeout(() => purposeFieldRef.current?.focus?.(), 300);
    }
  }, [setOffice, errors, setErrors, firstFilledField, customOfficeRef]);

  const handlePurposeChange = useCallback((value) => {
    setPurpose(value);
    if (errors?.purpose) setErrors(prev => ({ ...prev, purpose: false }));
    
    if (!firstFilledField) setFirstFilledField("purpose");
    
    if (value === "Other") {
      setTimeout(() => customPurposeRef?.current?.focus?.(), 300);
    } else if (value && onCustomPurposeSubmit) {
      setTimeout(() => onCustomPurposeSubmit(), 300);
    }
  }, [setPurpose, errors, setErrors, firstFilledField, customPurposeRef, onCustomPurposeSubmit]);

  const handleStaffChange = useCallback((value) => {
    setStaffName(value);
    if (!firstFilledField && value) setFirstFilledField("staff");
  }, [setStaffName, firstFilledField]);

  // Derived values
  const isOfficeDisabled = firstFilledField === "staff" && !!staffName;
  const showCustomOffice = office === "Other";
  const showCustomPurpose = purpose === "Other";

  // Loading state
  if (isLoading) {
    return (
      <section className="mt-8 sm:mt-10 px-0">
        <SectionTitle 
          icon={<MapPin size={20} />} 
          text="Visit Information" 
        />
        <div className="mt-2 rounded-xl border border-[#6b4fae] bg-[#4b2a78]/60 p-6 text-center text-white">
          Loading offices and staff…
        </div>
      </section>
    );
  }

  // No data state
  if (!offices.length) {
    return (
      <section className="mt-8 sm:mt-10 px-0">
        <SectionTitle 
          icon={<MapPin size={20} />} 
          text="Visit Information" 
        />
        <div className="mt-2 rounded-xl border border-[#6b4fae] bg-[#4b2a78]/60 p-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-10 w-10 text-red-400" />
          <p className="text-white">
            No visitor offices available. Please contact the administrator.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-8 sm:mt-10 px-0">
        <SectionTitle 
          icon={<MapPin size={20} />} 
          text="Visit Information" 
        />
        
        <div className="mt-2 rounded-xl border-2 border-[#6b4fae] bg-[#4b2a78]/60 p-4 sm:p-5 lg:p-6">
          {/* Staff Selection */}
          <SelectField
            ref={staffFieldRef}
            icon={<UserCircle size={20} />}
            value={staffName}
            onChange={handleStaffChange}
            placeholder="Staff / Instructor (optional)"
            options={filteredStaffOptions}
          />

          {/* Office Selection */}
          <div className="mt-3">
            <SelectField
              ref={officeFieldRef}
              icon={<Building2 size={20} />}
              value={office}
              onChange={handleOfficeChange}
              placeholder="Office to Visit"
              options={filteredOffices}
              disabled={isOfficeDisabled}
              hasError={errors?.office}
            />
          </div>

          {/* Custom Office Input */}
          {showCustomOffice && (
            <div className="mt-3">
              <InputField
                ref={customOfficeRef}
                icon={<Building2 size={20} />}
                placeholder="Specify office"
                value={customOffice}
                onChange={setCustomOffice}
                uppercase
                onKeyDown={(e) => {
                  if (e.key === 'Enter') purposeFieldRef.current?.focus?.()
                }}
              />
            </div>
          )}

          {/* Purpose Selection */}
          <div className="mt-3">
            <SelectField
              ref={purposeFieldRef}
              icon={<Newspaper size={20} />}
              value={purpose}
              onChange={handlePurposeChange}
              placeholder="Purpose of Visit"
              options={filteredPurposes}
              hasError={errors?.purpose}
            />
          </div>

          {/* Custom Purpose Input */}
          {showCustomPurpose && (
            <div className="mt-3">
              <InputField
                ref={customPurposeRef}
                icon={<PenLine size={20} />}
                placeholder="Specify purpose"
                value={customPurpose}
                onChange={setCustomPurpose}
                uppercase
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onCustomPurposeSubmit) onCustomPurposeSubmit()
                }}
              />
            </div>
          )}

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="mt-4 ml-auto hidden rounded border border-red-500 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 sm:block"
          >
            Reset
          </button>

          {/* Mobile Reset Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="mt-4 w-full rounded border border-red-500 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 sm:hidden"
          >
            Reset Section
          </button>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
            <p className="text-lg font-semibold text-gray-800">Reset all visit information?</p>
            <p className="mt-2 text-sm text-gray-600">
              This will clear all selections in this section.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelReset}
                className="rounded-lg bg-gray-400 px-5 py-2.5 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-white hover:bg-red-700"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

VisitInfoSection.displayName = "VisitInfoSection";

export default VisitInfoSection;
