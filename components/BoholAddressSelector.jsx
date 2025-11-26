import { useState, useEffect } from "react";
import { IoMapOutline, IoLocationOutline } from "react-icons/io5";

// Dummy data utilities (replace with your real boholAddressData.js)
import {
  getMunicipalities,
  getBarangays,
  formatAddressForDB,
} from "../src/data/boholAddressData";

export default function BoholAddressSelector({
  homeAddress,
  setHomeAddress,
  errors,
  onAddressChange,
}) {
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  const municipalities = getMunicipalities();
  const barangayList = municipality ? getBarangays(municipality) : [];

  useEffect(() => {
    if (municipality && barangay) {
      const fullAddress = `${barangay}, ${municipality}, Bohol`;
      setHomeAddress(fullAddress);

      if (onAddressChange) {
        const dbFormat = formatAddressForDB(municipality, barangay);
        onAddressChange(dbFormat);
      }
    } else {
      setHomeAddress("");
      if (onAddressChange) onAddressChange(null);
    }
  }, [municipality, barangay]);

  useEffect(() => {
    if (homeAddress && !municipality && !barangay) {
      const parts = homeAddress.split(", ");
      if (parts.length >= 2) {
        const [brgy, mun] = parts;
        setBarangay(brgy);
        setMunicipality(mun);
      }
    }
  }, []);

  const handleMunicipalityChange = (e) => {
    setMunicipality(e.target.value);
    setBarangay("");
  };

  const handleBarangayChange = (e) => {
    setBarangay(e.target.value);
  };

  return (
    <div className="mt-3 w-full max-w-md">
      {/* Municipality Dropdown */}
      <div
        className={`flex items-center bg-white rounded-lg px-2 py-2 mb-6 border-2 ${
          errors?.homeAddress ? "border-red-500" : "border-gray-400"
        }`}
      >
        <IoMapOutline className="text-indigo-700 mr-1.5 text-xl" />

        <select
          value={municipality}
          onChange={handleMunicipalityChange}
          className="w-full bg-transparent text-gray-900 focus:outline-none"
        >
          <option value="">Select Municipality</option>
          {municipalities.map((mun) => (
            <option key={mun} value={mun}>
              {mun}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay Dropdown */}
      {municipality && (
        <div
          className={`flex items-center bg-white rounded-lg px-2 py-2 mb-3 border-2 ${
          errors?.homeAddress ? "border-red-500" : "border-gray-400"
        }`}
      >
        <IoLocationOutline className="text-indigo-700 mr-1.5 text-xl" />          <select
            value={barangay}
            onChange={handleBarangayChange}
            disabled={barangayList.length === 0}
            className="w-full bg-transparent text-gray-900 focus:outline-none"
          >
            <option value="">Select Barangay</option>
            {barangayList.map((brgy) => (
              <option key={brgy} value={brgy}>
                {brgy}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Address Display */}
      {municipality && barangay && (
        <div className="mt-4 p-3 bg-indigo-100 rounded-md border-l-4 border-indigo-500">
          <p className="text-black text-xs mb-1 font-medium">Selected Address:</p>
          <p className="text-black text-sm font-semibold">{homeAddress}</p>
        </div>
      )}

      {/* Error Message */}
      {errors?.homeAddress && (
        <p className="text-red-500 mt-2 text-sm">{errors.homeAddress}</p>
      )}
    </div>
  );
}
