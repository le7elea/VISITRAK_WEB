import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

export default function Header({ title }) {
  const navigate = useNavigate();
  const [width, setWidth] = useState(window.innerWidth);

  // Listen for resize (web equivalent of useWindowDimensions)
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📱 Responsive scale (same logic as RN)
  const scale = width > 700 ? 1.4 : width > 600 ? 1.2 : 1;

  return (
    <div
      className="flex items-center"
      style={{ marginBottom: 8 * scale }}
    >
      {/* Back Button */}
      {/* <button
        onClick={() => navigate("/")}
        className="bg-white/20 border-2 border-blue-200 rounded-lg
                   flex items-center justify-center shadow-md
                   hover:bg-white/30 active:opacity-90 transition"
        style={{
          width: 44 * scale,
          height: 44 * scale,
          padding: 8 * scale,
          marginLeft: 10 * scale,
        }}
      >
        <IoChevronBack
          color="white"
          size={24 * scale}
        />
      </button> */}

      {/* 🏷️ Title */}
      <h1
        className="flex-1 font-semibold text-white text-center truncate"
        style={{
          fontSize: 28 * scale,
        }}
      >
        {title}
      </h1>

      {/* Spacer (balances back button) */}
      <div style={{ width: 40 * scale }} />
    </div>
  );
}
