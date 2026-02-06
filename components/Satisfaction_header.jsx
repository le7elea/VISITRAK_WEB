import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Header = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8 relative mb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-white/20 hover:bg-white/30 rounded-lg flex justify-center items-center border-2 border-blue-200/50 shadow-md transition-all duration-200 active:scale-95"
        style={{
          minWidth: "44px",
          minHeight: "44px",
          padding: "8px",
        }}
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <h1
          className="font-semibold text-white text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl truncate"
          style={{
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Spacer to balance the layout */}
      <div style={{ width: "44px" }} />
    </div>
  );
};

// Alternative version with responsive font sizes using clamp()
const HeaderWithClamp = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8 relative mb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-white/20 hover:bg-white/30 rounded-lg flex justify-center items-center border-2 border-blue-200/50 shadow-md transition-all duration-200 active:scale-95 w-11 h-11 md:w-12 md:h-12"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </button>

      {/* Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        <h1
          className="font-semibold text-white text-center truncate"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Spacer */}
      <div className="w-11 h-11 md:w-12 md:h-12" />
    </div>
  );
};

// Version with gradient background (if needed)
const HeaderWithGradient = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Gradient background similar to original */}
      <div className="absolute inset-0 bg-#381366" />
      
      <div className="relative flex items-center justify-between px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 mb-6 sm:mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="relative bg-white/20 hover:bg-white/30 rounded-lg flex justify-center items-center border-2 border-blue-200/50 shadow-md transition-all duration-200 active:scale-95 z-10 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
        </button>

        {/* Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-10">
          <h1
            className="font-semibold text-white text-center truncate"
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2.75rem)",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Spacer */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12" />
      </div>
    </div>
  );
};

// Choose which version to export
export default HeaderWithGradient; // or Header or HeaderWithClamp
