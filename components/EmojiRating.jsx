import React from "react";
import {
  MdSentimentVeryDissatisfied,
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVerySatisfied,
} from "react-icons/md";
import { LuCheck } from "react-icons/lu";

const satisfactionLabels = [
  "Very unsatisfied (1)",
  "Unsatisfied (2)",
  "Neutral (3)",
  "Satisfied (4)",
  "Very satisfied (5)",
];

const icons = [
  {
    Component: MdSentimentVeryDissatisfied,
    value: 1,
    color: "#ef4444",
  },
  {
    Component: MdSentimentDissatisfied,
    value: 2,
    color: "#f97316",
  },
  {
    Component: MdSentimentNeutral,
    value: 3,
    color: "#eab308",
  },
  {
    Component: MdSentimentSatisfied,
    value: 4,
    color: "#39ff14",
  },
  {
    Component: MdSentimentVerySatisfied,
    value: 5,
    color: "#4f46e5",
  },
];

const EmojiRating = ({ value, onChange }) => {
  const notApplicable = value === 0;

  const handleNotApplicable = () => {
    onChange(notApplicable ? undefined : 0);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 sm:gap-5 md:gap-6">
        <div className="flex items-center justify-between w-full md:flex-1 md:pr-6 lg:pr-10">
          {icons.map((icon) => {
            const IconComponent = icon.Component;
            const isActive = value === icon.value;
            const iconColor = isActive && !notApplicable ? icon.color : "#9b9b9b";
            const labelColor = isActive && !notApplicable ? icon.color : "#777777";

            return (
              <div key={icon.value} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onChange(icon.value)}
                  className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8f8f8f]/40 ${
                    isActive ? "ring-1 ring-black/10 shadow-sm bg-[#ececec]" : "hover:bg-[#ececec]"
                  }`}
                  aria-label={`Rate ${icon.value}`}
                >
                  <IconComponent
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 transition-colors duration-200"
                    style={{
                      color: iconColor,
                    }}
                  />
                </button>
                <span
                  className="text-xs sm:text-sm mt-0.5 font-medium"
                  style={{
                    color: labelColor,
                  }}
                >
                  {icon.value}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNotApplicable}
          className="flex items-center w-fit md:shrink-0 focus:outline-none focus:ring-2 focus:ring-[#8f8f8f]/40 px-2 py-1 rounded-md hover:bg-[#ececec]"
        >
          <div
            className={`w-4 h-4 mr-2 rounded-[3px] border flex items-center justify-center transition-colors duration-200 ${
              notApplicable
                ? "bg-[#4f4f4f] border-[#4f4f4f]"
                : "border-[#878787] bg-white"
            }`}
          >
            {notApplicable && <LuCheck className="w-3 h-3 text-white" />}
          </div>
          <span className="text-[#2f2f2f] text-sm sm:text-base font-medium select-none whitespace-nowrap">
            Not Applicable.
          </span>
        </button>
      </div>

      <div className="mt-2 text-xs sm:text-sm text-[#777777] min-h-[20px] text-center">
        {value === undefined || value === null
          ? "Please select a rating"
          : notApplicable
          ? "Not Applicable selected"
          : `Selected: ${satisfactionLabels[value - 1]}`}
      </div>
    </div>
  );
};

export default EmojiRating;
