import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaUser, FaBuilding, FaClipboardList, FaCalendarCheck, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

export default function DuplicateVisitModal({ 
  visible, 
  onClose, 
  onProceed, 
  visitorData,
  isMobile = false,
  isTablet = false 
}) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isClosing, setIsClosing] = useState(false);

  const { name, office, purpose, checkInTime } = visitorData || {};

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && visible) {
        handleClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  // Responsive scaling
  const getScale = () => {
    if (windowWidth > 1024) return 1.2; // Desktop
    if (windowWidth > 768) return 1.0; // Tablet
    return 0.9; // Mobile
  };

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

  const getModalWidth = () => {
    if (windowWidth > 1024) return "max-w-lg";
    if (windowWidth > 768) return "max-w-md";
    return "max-w-sm";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    
    try {
      let date;
      if (timestamp.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return "-";
      }

      if (isNaN(date.getTime())) return "-";

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      return date.toLocaleString("en-PH", {
        weekday: isToday ? undefined : "short",
        year: isToday ? undefined : "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "-";
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleProceed = () => {
    onProceed();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible && !isClosing) return null;

  const scale = getScale();
  const modalWidth = getModalWidth();

  const visitorDetails = [
    { icon: <FaUser />, label: "Name", value: name || "-" },
    { icon: <FaBuilding />, label: "Office", value: office || "-" },
    { icon: <FaClipboardList />, label: "Purpose", value: purpose || "-" },
    { icon: <FaCalendarCheck />, label: "Check-in Time", value: formatTime(checkInTime) },
  ];

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/70 backdrop-blur-sm
          flex items-center justify-center z-50 p-4
          transition-all duration-300
          ${visible && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleBackdropClick}
      >
        {/* Modal Container */}
        <div 
          className={`
            ${modalWidth} w-full
            bg-gradient-to-br from-white to-gray-50
            dark:from-gray-800 dark:to-gray-900
            rounded-xl sm:rounded-2xl
            shadow-2xl
            transform transition-all duration-300
            ${visible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            border border-gray-200 dark:border-gray-700
            overflow-hidden
          `}
        >
          {/* Modal Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Warning Icon */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close modal"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>

            {/* Title */}
            <div className="pl-12 sm:pl-16 pr-12">
              <h2 
                className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                style={{ fontSize: getFontSize(20) }}
              >
                Visitor Already Checked In
              </h2>
              <p 
                className="text-sm sm:text-base text-red-600 dark:text-red-400 mt-1 font-medium"
                style={{ fontSize: getFontSize(14) }}
              >
                Duplicate check-in detected
              </p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6">
            {/* Visitor Details Card */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
              <h3 
                className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2"
                style={{ fontSize: getFontSize(16) }}
              >
                <MdWarning className="text-amber-500" />
                Active Visitor Details
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {visitorDetails.map((detail, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {detail.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium"
                        style={{ fontSize: getFontSize(12) }}
                      >
                        {detail.label}
                      </p>
                      <p 
                        className="text-sm sm:text-base text-gray-900 dark:text-white font-medium truncate"
                        style={{ fontSize: getFontSize(14) }}
                        title={detail.value}
                      >
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <MdWarning className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p 
                    className="text-sm sm:text-base text-gray-800 dark:text-amber-100 font-medium mb-1"
                    style={{ fontSize: getFontSize(14) }}
                  >
                    Check-out Required
                  </p>
                  <p 
                    className="text-xs sm:text-sm text-gray-600 dark:text-amber-200"
                    style={{ fontSize: getFontSize(12), lineHeight: "1.5" }}
                  >
                    This visitor is still checked in from a previous visit today. 
                    Please complete the check-out process before creating a new check-in.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`
              flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 sm:gap-4
            `}>
              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className={`
                  flex-1 px-4 py-3 sm:py-4
                  bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-800 dark:text-gray-200
                  rounded-lg font-medium
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-gray-500
                  flex items-center justify-center gap-2
                  ${isMobile ? 'order-2' : ''}
                `}
                style={{ fontSize: getFontSize(14) }}
              >
                <FaTimes />
                Cancel
              </button>

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                className={`
                  flex-1 px-4 py-3 sm:py-4
                  bg-gradient-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700
                  text-white
                  rounded-lg font-medium
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  flex items-center justify-center gap-2
                  shadow-lg hover:shadow-xl
                  ${isMobile ? 'order-1' : ''}
                `}
                style={{ fontSize: getFontSize(14) }}
              >
                <FaSignOutAlt />
                Go to Check Out
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Need help? Contact administrator for assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for better modal animations */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }

        .modal-enter {
          animation: modalIn 0.3s ease-out;
        }

        .modal-exit {
          animation: modalOut 0.2s ease-in;
        }
      `}</style>
    </>
  );
}