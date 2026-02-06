import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessModal({
  visible,
  onClose,
  visitId,
  visitorName,
}) {
  const navigate = useNavigate();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 sm:px-5">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl sm:rounded-[28px] p-5 sm:p-7 lg:p-8 xl:p-9 flex flex-col items-center shadow-xl animate-fadeIn origin-center lg:scale-[1.02] xl:scale-[1.04] transition-transform">
        
        {/* Icon */}
        <img
          src="../src/assets/modalIcon.png"
          alt="Success"
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-contain mb-2"
        />

        {/* Title */}
        <h2 className="text-indigo-500 font-extrabold text-center text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10">
          Successfully Matched!
        </h2>

        {/* PRIMARY BUTTON */}
        <button
          onClick={() => {
            onClose();
            navigate("/satisfaction", {
              state: { visitId, visitorName },
            });
          }}
          className="w-full h-11 sm:h-12 lg:h-14 mb-5 sm:mb-6 rounded-2xl bg-purple-600 text-white font-bold tracking-wide sm:tracking-widest text-sm sm:text-base lg:text-lg
                     flex items-center justify-center shadow-md
                     active:opacity-90 hover:bg-purple-700 transition"
        >
          CHECK OUT & SURVEY
        </button>

        {/* SECONDARY BUTTON */}
        <button
          onClick={() => {
            onClose();
            navigate("/thankyou");
          }}
          className="w-full h-11 sm:h-12 lg:h-14 rounded-2xl border-[3px] border-blue-900
                     text-blue-900 font-extrabold tracking-wide sm:tracking-widest text-sm sm:text-base lg:text-lg
                     flex items-center justify-center
                     hover:bg-blue-50 transition"
        >
          QUICK CHECK OUT (SKIP SURVEY)
        </button>
      </div>
    </div>
  );
}
