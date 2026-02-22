import React from "react";

const Question = ({ number, text, children, highlight = false }) => {
  return (
    <div 
      className={`mb-4 sm:mb-5 transition-all duration-200 rounded-lg px-1 sm:px-2 ${
        highlight ? "bg-red-50 ring-1 ring-red-200" : ""
      }`}
    >
      <p
        className="text-[#1f1f1f] font-semibold mb-3 leading-relaxed"
        style={{ fontSize: "clamp(0.9rem, 0.7vw + 0.6rem, 1rem)" }}
      >
        <span className="mr-1.5 text-[#2c2c2c] font-medium text-sm">
          {number}.
        </span>
        {text}
      </p>
      {children}
    </div>
  );
};

export default Question;
