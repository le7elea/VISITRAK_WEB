import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

export default function Header({ title }) {
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center justify-center py-6">
      {/* Back Button (top-right) */}
      <button
        onClick={() => navigate("/satisfaction")} // navigate back
        className="absolute right-4 w-11 bg-white/20 rounded-lg p-2 flex justify-center items-center border-2 border-gray-500 shadow-md hover:bg-white/30 transition"
      >
        <IoChevronForward size={24} className="text-white" />
      </button>

      {/* Title */}
      <h1 className="text-white text-3xl font-bold">{title}</h1>
    </header>
  );
} 
