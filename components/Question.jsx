import React from "react";

const Question = ({ number, text, children, highlight = false }) => {
  return (
    <div 
      className={`mb-6 transition-all duration-200 ${
        highlight ? "animate-pulse" : ""
      }`}
    >
      <p
        className="text-gray-900 font-semibold mb-2 leading-relaxed"
        style={{ fontSize: "clamp(0.95rem, 1.2vw + 0.5rem, 1.35rem)" }}
      >
        <span className="mr-2 text-gray-900 font-normal text-sm sm:text-base">
          {number}.
        </span>
        {text}
      </p>
      {children}
    </div>
  );
};

export default Question;
