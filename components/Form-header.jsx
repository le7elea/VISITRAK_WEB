import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

import BG1 from "../src/assets/backG004.png";
import BG2 from "../src/assets/backG009.png";
import BG3 from "../src/assets/backG010.png";

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
      className="relative w-full h-52 sm:h-60 md:h-64 bg-cover bg-center px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col text-white transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${images[currentIndex]})` }}
    >
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center">VisiTrak</h1>

      {/* Subtitles */}
      <p className="font-bold text-2xl sm:text-3xl mt-3 sm:mt-5 tracking-wide">
        Your Visit Matters
      </p>
      <p className="text-sm sm:text-base md:text-lg mt-1">
        Thank you for being part of our vibrant community!
      </p>

      {/* Floating Circle Avatar */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center border-2 border-blue-500 shadow-md">
          <FaUser className="text-indigo-700 text-2xl sm:text-3xl" />
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
              i === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
