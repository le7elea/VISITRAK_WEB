import React from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYouCard({ illustration, title, subtitle, message }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 p-6   ">
      <img src={illustration} alt="Thank You Illustration" className="w-80 h-60 md:w-40 md:h-50 mx-auto" />
      <h1 className="text-3xl md:text-3xl font-bold text-white">{title}</h1>
      <p className="text-xl md:text-base text-white">{subtitle}</p>
      <p className="text-white text-lg mt-5">{message}</p>
      
    </div>
  );
}
