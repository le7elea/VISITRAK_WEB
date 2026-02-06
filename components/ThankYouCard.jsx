import React from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYouCard({ illustration, title, subtitle, message }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 sm:gap-5 p-4 sm:p-6 w-full max-w-xl">
      <img
        src={illustration}
        alt="Thank You Illustration"
        className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] h-auto mx-auto"
      />
      <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
      <p className="text-base sm:text-lg text-white">{subtitle}</p>
      <p className="text-white text-base sm:text-lg mt-2 sm:mt-4">{message}</p>
    </div>
  );
}
