import React, { useState, useEffect } from "react";

export default function SubmitButton({ 
  onPress, 
  title = "Submit Registration",
  disabled = false,
  isLoading = false,
  isMobile = false,
  isTablet = false 
}) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSpacing = (size) => {
    if (isMobile) return `${size * 0.8}px`;
    if (isTablet) return `${size}px`;
    return `${size * 1.2}px`;
  };

  const getFontSize = (size) => {
    if (windowWidth > 1024) return `${size * 1.1}px`;
    if (windowWidth > 768) return `${size}px`;
    return `${size * 0.9}px`;
  };

  const handleClick = (e) => {
    if (!disabled && !isLoading && onPress) {
      onPress(e);
    }
  };

  return (
    <div className="w-full px-0 mt-6 mb-6">
      <div className="w-full">
        <button
          onClick={handleClick}
          disabled={disabled || isLoading}
          className={`
            w-full h-11 sm:h-12
            bg-gradient-to-r from-[#7a2ff2] to-[#5a2bd8]
            disabled:opacity-60 disabled:cursor-not-allowed
            rounded-lg
            shadow-md
            transition-all duration-200
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-[#a88be0] focus:ring-offset-2 focus:ring-offset-[#3b1c62]
          `}
          style={{
            marginTop: getSpacing(18),
            marginBottom: getSpacing(10),
          }}
        >
          <span 
            className={`
              font-semibold tracking-wide text-center text-sm sm:text-base
            `}
            style={{ fontSize: getFontSize(isMobile ? 14 : 16) }}
          >
            {isLoading ? 'Processing...' : title}
          </span>
        </button>
      </div>
    </div>
  );
}
