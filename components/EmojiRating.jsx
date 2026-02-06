import React, { useState } from "react";
import { 
  MdSentimentVeryDissatisfied, 
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVerySatisfied
} from "react-icons/md";
import { LuCheck } from "react-icons/lu";

const satisfactionLabels = [
  "Very unsatisfied (1)",
  "Unsatisfied (2)",
  "Neutral (3)",
  "Satisfied (4)",
  "Very Satisfied (5)",
];

const icons = [
  { 
    Component: MdSentimentVeryDissatisfied,
    value: 1,
    color: "#ef4444"
  },
  { 
    Component: MdSentimentDissatisfied,
    value: 2,
    color: "#f97316"
  },
  { 
    Component: MdSentimentNeutral,
    value: 3,
    color: "#eab308"
  },
  { 
    Component: MdSentimentSatisfied,
    value: 4,
    color: "#22c55e"
  },
  { 
    Component: MdSentimentVerySatisfied,
    value: 5,
    color: "#3b82f6"
  },
];

const EmojiRating = ({ value, onChange }) => {
  const [notApplicable, setNotApplicable] = useState(false);

  const handleEmojiPress = (selectedValue) => {
    setNotApplicable(false);
    onChange(selectedValue);
  };

  const handleNotApplicable = () => {
    setNotApplicable((prev) => {
      const next = !prev;
      if (next) onChange(null);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Container for all emojis and checkbox */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full px-3 sm:px-4 md:px-6 gap-3 sm:gap-4 md:gap-6">
        {/* Emoji Container */}
        <div className="flex justify-between w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {icons.map((icon) => {
            const isActive = value === icon.value && !notApplicable;
            const IconComponent = icon.Component;

            return (
              <div key={icon.value} className="flex flex-col items-center">
                <button
                  onClick={() => handleEmojiPress(icon.value)}
                  className={`p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 ${
                    isActive 
                      ? "bg-indigo-100 transform scale-105 shadow-sm" 
                      : "hover:bg-gray-100"
                  }`}
                  type="button"
                  aria-label={`Rate ${icon.value}`}
                >
                  <IconComponent
                    style={{ 
                      color: isActive ? icon.color : "#9ca3af",
                    }}
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 transition-colors duration-200"
                  />
                </button>
                <span className="text-[11px] sm:text-xs lg:text-sm text-gray-500 mt-1 font-medium">
                  {icon.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Checkbox */}
        <button
          onClick={handleNotApplicable}
          className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 px-2 py-1.5 rounded-lg hover:bg-gray-50"
          type="button"
        >
          <div
            className={`w-5 h-5 mr-2 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
              notApplicable
                ? "bg-indigo-600 border-indigo-600"
                : "border-gray-400 bg-white hover:border-indigo-400"
            }`}
          >
            {notApplicable && (
              <LuCheck className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span className="text-gray-700 text-xs sm:text-sm lg:text-base font-medium select-none whitespace-nowrap">
            Not Applicable
          </span>
        </button>
      </div>

      {/* Status Text */}
      <div className="mt-3 sm:mt-4 text-center text-gray-600 text-xs sm:text-sm lg:text-base min-h-[20px] px-3 sm:px-4">
        <div className={`py-2 px-4 rounded-lg ${
          notApplicable ? "bg-purple-50 text-purple-700" :
          value ? "bg-indigo-50 text-indigo-700" : 
          "bg-gray-50 text-gray-500"
        }`}>
          {notApplicable
            ? "✓ Not Applicable selected"
            : value
            ? `✓ You selected: ${satisfactionLabels[value - 1]}`
            : "Please select a rating"}
        </div>
      </div>
    </div>
  );
};

export default EmojiRating;
