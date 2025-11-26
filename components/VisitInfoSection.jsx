import { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import SectionTitle from "./SectionTitle";
import SelectField from "./SelectField";
import InputField from "./InputField";

export default function VisitInfoSection({
  purpose,
  setPurpose,
  office,
  setOffice,
  purposes,
  offices,
  errors,
  setErrors
}) {
  const [customPurpose, setCustomPurpose] = useState("");
  const [customOffice, setCustomOffice] = useState("");
  const [staffName, setStaffName] = useState("");
  const [firstFilled, setFirstFilled] = useState(null);
  const [filteredPurposes, setFilteredPurposes] = useState(purposes);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);

  const purposeToOffice = {
    "COR/TOR": "REGISTRAR",
    "MEDICAL": "CLINIC",
    "PAYMENT": "CASHIER",
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
    "CCIS/CTAS OFFICE": [
      { name: "Ms. Sasha Isabela Uy" },
      { name: "Mrs. Cathlene Leah Gabo" },
      { name: "Mr. Raymond Cempron" },
      { name: "Mr. Emiliano Maravilla" },
      { name: "Mrs. Dhoree Maravilla" },
    ],
  };

  const officeToPurposeMap = {
    REGISTRAR: ["COR/TOR", "Other"],
    CLINIC: ["Medical Checkup", "Medical Certificate", "Dental Checkup", "Other"],
    CASHIER: ["PAYMENT", "Other"],
    "CCIS/CTAS OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
  };

  const allStaffOptions = Object.entries(officeStaffData).flatMap(([office, staff]) =>
    staff.map((s) => ({ ...s, office }))
  );

  const isOfficeAutoAssigned = purposeToOffice[purpose] !== undefined;

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
    if (staffName) {
      const selectedStaff = allStaffOptions.find((s) => s.name === staffName);
      if (selectedStaff) {
        setOffice(selectedStaff.office);
        setCustomOffice("");
      }
    }
  }, [staffName]);

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

  useEffect(() => {
    if (office) {
      setFilteredStaffOptions(allStaffOptions.filter((s) => s.office === office));
    } else {
      setFilteredStaffOptions(allStaffOptions);
    }
  }, [office]);

  return (
    <div className="mt-8 p-6 bg-white/10 border-2 border-indigo-400 rounded-xl">
      <SectionTitle icon="📍" text="Visit Information" />

      <SelectField
        icon="🧑‍🏫"
          selectedValue={staffName}
          onValueChange={(v) => {
            const staffDisabled = firstFilled === "purpose";
            setStaffName(v);
            if (!firstFilled && v) setFirstFilled("staff");

            if (!staffDisabled && !v) {
              setPurpose("");
              setCustomPurpose("");
              setCustomOffice("");
            }
          }}
          placeholder="Staff / Instructor Name (optional)"
          options={filteredStaffOptions.map((s) => s.name)}
        />

      <SelectField
        icon="🏢"
        selectedValue={office}
        onValueChange={(v) => {
          if (!isOfficeAutoAssigned && !(firstFilled === "staff" && !!staffName)) {
            setOffice(v);
            if (v !== "Other") setCustomOffice("");
            setStaffName("");
          }
        }}
        placeholder="Office to Visit"
        options={offices}
        disabled={isOfficeAutoAssigned || (firstFilled === "staff" && !!staffName)}
      />

      {office === "Other" && !isOfficeAutoAssigned && (
        <InputField
          icon="🏛️"
          placeholder="Specify Office"
          value={customOffice}
          onChange={(e) => setCustomOffice(e.target.value)}
        />
      )}

      <SelectField
        icon="📝"
        selectedValue={purpose}
        onValueChange={(v) => {
          setPurpose(v);
          if (v !== "Other") setCustomPurpose("");
          if (!firstFilled && v) setFirstFilled("purpose");
        }}
        placeholder="Purpose of Visit"
        options={filteredPurposes}
      />

      {purpose === "Other" && (
        <InputField
          icon="✏️"
          placeholder="Specify Purpose"
          value={customPurpose}
          onChange={(e) => setCustomPurpose(e.target.value)}
        />
      )}
    </div>
  );
}
