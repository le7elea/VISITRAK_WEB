import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

export default function SatisfactionHeader({ title }) {
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center justify-center px-4 pt-5 pb-3 sm:pt-6 sm:pb-4">
      <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-wide text-center">
        {title}
      </h1>

      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="absolute right-4 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-lg border border-white/35 shadow-md hover:bg-white/30 transition"
      >
        <IoChevronForward className="mx-auto text-white w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </header>
  );
}
