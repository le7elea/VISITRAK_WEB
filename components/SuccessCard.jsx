import { useNavigate } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import successIcon from "../src/assets/success_icon.png";
import qrSample from "../src/assets/qr-sample.png";


export default function SuccessCard({ name, exitKey, checkIn, visiting }) {
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

      {/* QR + User Info */}
      <div className="flex items-center gap-4">
        {/* QR Code Section */}
        {/* QR Code Section */}
<div className="relative">
  {/* Save button positioned top-left */}
  <button
    onClick={() => alert("Save QR functionality here!")}
    className="absolute -top-0 -left-3 flex items-center gap-1 text-xs text-white bg-indigo-900 px-2 py-1 rounded-md shadow hover:bg-indigo-700 ml-2"
  >
    <FaSave size={12} />
    <span className="font-medium">SAVE</span>
  </button>

  {/* QR Image */}
  <img
    src={qrSample}
    alt="QR Code"
    className="w-28 h-28 border border-gray-300 rounded-md ml-17 mt-5"
  />
</div>


        {/* Vertical Separator */}
        <div className="w-0.5 h-30 bg-gray-400/40 mt-5 ml-2 mr-2"></div>

        {/* Visitor Info */}
        <div>
          <h2 className="text-white font-bold text-lg mt-2">{name}</h2>
          <p className="text-white font-semibold mt-1">
            EXIT KEY : <span className="text-white underline font-bold ">{exitKey}</span>
          </p>
        </div>
      </div>

      {/* Notes */}
      <p className="text-xs text-gray-300 mt-3">
        Note : If you exit in this website, Please keep the QR Code or exit key visible during check out.
      </p>

      <hr className="my-4 border-gray-400/40" />

      {/* Check-in Info */}
<div className="text-white text-sm font-medium space-y-1">
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
