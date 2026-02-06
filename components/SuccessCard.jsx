import { useNavigate } from "react-router-dom";
import successIcon from "../src/assets/success_icon.png";


export default function SuccessCard({ name, address, checkIn, visiting }) {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white/10 backdrop-blur-md border border-indigo-300 rounded-xl shadow-lg w-full max-w-md mx-auto p-5 sm:p-6 mt-16 sm:mt-20">
      {/* Success Icon Overlay */}
      <div className="absolute -top-14 sm:-top-16 md:-top-20 left-1/2 -translate-x-1/2">
        <img
          src={successIcon}
          alt="Success"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
        />
      </div>

      {/* Success Text */}
      <p className="text-center text-green-400 font-semibold mt-10 text-lg sm:text-xl">
        Successfully Checked In
      </p>

      <hr className="my-3 border-green-400" />

      {/* User Info */}
      <div className="flex justify-center items-center text-center py-4">
        {/* Visitor Info */}
        <div>
          <h2 className="text-white font-bold text-xl sm:text-2xl mt-2 mb-2">
            {name}
          </h2>
          <p className="text-white font-normal text-sm sm:text-base mb-3">
            {address}
          </p>
        </div>
      </div>

      <hr className="my-4 border-gray-400/40" />

      {/* Check-in Info */}
      <div className="text-white text-sm sm:text-base font-medium space-y-2">
        {/* CHECK IN row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
          <span className="text-white/80">CHECK IN :</span>
          <span className="font-normal break-words sm:text-right">
            {checkIn}
          </span>
        </div>

        {/* VISITING row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
          <span className="text-white/80">VISITING :</span>
          <span className="font-normal break-words sm:text-right">
            {visiting}
          </span>
        </div>
      </div>

      {/* Satisfaction Button */}
      {/* <button 
        onClick={() => navigate("/exit")}
        className="w-full mt-6 py-2.5 sm:py-3 rounded-lg bg-indigo-900 text-white font-bold text-sm sm:text-base hover:bg-indigo-800 transition flex justify-center items-center gap-2">
          CHECK OUT →
      </button> */}

    </div>
  );
}


