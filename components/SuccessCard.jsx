import { useNavigate } from "react-router-dom";
import successIcon from "../src/assets/success_icon.png";


export default function SuccessCard({ name, address, checkIn, visiting }) {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white/10 backdrop-blur-md border border-indigo-300 rounded-xl shadow-lg w-full max-w-md mx-auto p-6 mt-20">
      {/* Success Icon Overlay */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2">
        <img src={successIcon} alt="Success" className="w-35 h-35" />
      </div>

      {/* Success Text */}
      <p className="text-center text-green-400 font-semibold mt-10 text-xl">
        Successfully Checked In
      </p>

      <hr className="my-3 border-green-400" />

      {/* User Info */}
      <div className="flex justify-center items-center text-center py-4">
        {/* Visitor Info */}
        <div>
          <h2 className="text-white font-bold text-2xl mt-2 mb-2">{name}</h2>
          <p className="text-white font-normal text-md mb-3">{address}</p>
        </div>
      </div>

      <hr className="my-4 border-gray-400/40" />

      {/* Check-in Info */}
<div className="text-white text-md font-medium space-y-1">
  {/* CHECK IN row */}
  <div className="flex justify-between">
    <span>CHECK IN :</span>
    <span className="font-normal">{checkIn}</span>
  </div>

  {/* VISITING row */}
  <div className="flex justify-between">
    <span>VISITING :</span>{" "}
    <span className="font-normal">{visiting}</span>
  </div>
</div>

      {/* Satisfaction Button */}
      <button 
        onClick={() => navigate("/satisfaction")}
        className="w-full mt-6 py-3 rounded-lg bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition flex justify-center items-center gap-2">
          SATISFACTION FORM →
      </button>

      <p className="text-xs text-gray-300 text-center mt-2">
        Note : Answer the Satisfaction Form after Visiting the office.
      </p>
    </div>
  );
}
