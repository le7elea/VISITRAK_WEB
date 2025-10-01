import { useState } from "react";
import { 
  IoSadOutline, IoSad, IoHappyOutline, IoHappy 
} from "react-icons/io5";
import { 
  MdOutlineSentimentNeutral, MdSentimentNeutral, 
  MdOutlineSentimentDissatisfied, MdSentimentDissatisfied 
} from "react-icons/md";
import { FaRegSmile, FaSmile } from "react-icons/fa";

function EmojiRating({ value, onChange, notApplicable, onNotApplicableChange }) {
  const icons = [
    { inactive: <IoSadOutline />, active: <IoSad /> },
    { inactive: <MdOutlineSentimentDissatisfied />, active: <MdSentimentDissatisfied /> },
    { inactive: <MdOutlineSentimentNeutral />, active: <MdSentimentNeutral /> },
    { inactive: <IoHappyOutline />, active: <IoHappy /> },
    { inactive: <FaRegSmile />, active: <FaSmile /> },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4 w-full justify-center">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {icons.map((icon, index) => {
          const isActive = value === index + 1 && !notApplicable;
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(index + 1);
                onNotApplicableChange(false);
              }}
              className={`p-2 rounded-full transition-all duration-200 
                ${isActive 
                  ? "bg-indigo-100 text-indigo-600 scale-110" 
                  : "text-gray-500 opacity-70 hover:opacity-100 hover:scale-105"
                } 
                sm:p-3 sm:text-2xl text-xl`}
            >
              {isActive ? icon.active : icon.inactive}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm mt-2 sm:mt-0 sm:ml-6">
        <input
          type="checkbox"
          checked={notApplicable}
          onChange={(e) => {
            onNotApplicableChange(e.target.checked);
            if (e.target.checked) onChange(0);
          }}
          className="form-checkbox h-4 w-4 sm:h-6 sm:w-6 text-indigo-600"
        />
        Not Applicable
      </label>
    </div>
  );
}

export default function App() {
  const [rating, setRating] = useState(0);
  const [notApplicable, setNotApplicable] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6">
      <EmojiRating
        value={rating}
        onChange={setRating}
        notApplicable={notApplicable}
        onNotApplicableChange={setNotApplicable}
      />

      <p className="text-sm text-center sm:text-base">
        {notApplicable
          ? "Not Applicable selected"
          : rating > 0
          ? `You selected: ${rating}`
          : "No rating yet"}
      </p>
    </div>
  );
}
