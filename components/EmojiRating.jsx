import React from "react";
import { 
  IoSadOutline, IoSad, IoHappyOutline, IoHappy 
} from "react-icons/io5";
import { 
  MdOutlineSentimentNeutral, MdSentimentNeutral, 
  MdOutlineSentimentDissatisfied, MdSentimentDissatisfied 
} from "react-icons/md";
import { FaRegSmile, FaSmile } from "react-icons/fa";

export default function EmojiRating({ value, onChange, notApplicable, onNotApplicableChange }) {
  const icons = [
    { inactive: <IoSadOutline />, active: <IoSad />, label: "Very Dissatisfied" },
    { inactive: <MdOutlineSentimentDissatisfied />, active: <MdSentimentDissatisfied />, label: "Dissatisfied" },
    { inactive: <MdOutlineSentimentNeutral />, active: <MdSentimentNeutral />, label: "Neutral" },
    { inactive: <IoHappyOutline />, active: <IoHappy />, label: "Satisfied" },
    { inactive: <FaRegSmile />, active: <FaSmile />, label: "Very Satisfied" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4 w-full justify-center">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {icons.map((icon, index) => {
          const isActive = value === index + 1;
          return (
            <button
              key={index}
              type="button"
              disabled={notApplicable} // disable clicks when NA is checked
              onClick={() => onChange(index + 1)}
              className={`p-2 rounded-full transition-all duration-200 
                ${isActive 
                  ? "bg-indigo-100 text-indigo-600 scale-110" 
                  : "text-gray-500 opacity-70 hover:opacity-100 hover:scale-105"
                } sm:p-3 sm:text-2xl text-xl cursor-pointer ${notApplicable ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isActive ? icon.active : icon.inactive}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm mt-2 sm:mt-0 sm:ml-6 cursor-pointer">
        <input
          type="checkbox"
          checked={notApplicable}
          onChange={(e) => onNotApplicableChange(e.target.checked)}
          className="form-checkbox h-4 w-4 sm:h-6 sm:w-6 text-indigo-600"
        />
        Not Applicable
      </label>
    </div>
  );
}
