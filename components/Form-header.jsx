import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

import BG1 from "../src/assets/BG1.png";
import BG2 from "../src/assets/BG2.png";
import BG3 from "../src/assets/BG3.png";

const images = [BG1, BG2, BG3];

export default function Header() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5s
  useEffect(() => { 
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full h-64 bg-cover bg-center px-6 pt-8 flex flex-col text-white transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${images[currentIndex]})` }}
    >
      {/* Title */}
      <h1 className="text-3xl font-bold text-center">VisiTrak</h1>

      {/* Subtitles */}
      <p className="font-bold text-3xl mt-5 tracking-wide">
        Your Visit Matters
      </p>
      <p className="text-lg mt-1">
        Thank you for being part of our vibrant community!
      </p>

      {/* Floating Circle Avatar */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-blue-500 shadow-md">
          <FaUser className="text-indigo-700 text-3xl" />
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
