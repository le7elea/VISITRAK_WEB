import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

export default function Header({ title }) {
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center justify-center py-5 sm:py-6 px-4">
      {/* Back Button (top-right) */}
      <button
        onClick={() => navigate("/exit")} // navigate back
        className="absolute right-4 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-lg p-2 flex justify-center items-center border-2 border-gray-500 shadow-md hover:bg-white/30 transition"
      >
        <IoChevronForward className="text-white w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Title */}
      <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight px-12">
        {title}
      </h1>
    </header>
  );
} 
