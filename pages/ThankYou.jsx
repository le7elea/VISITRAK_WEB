import React from "react";
import ThankYouCard from "../components/ThankYouCard";
import thankYouBg from "../src/assets/thankYou_bg1.png"; // Background
import thankYouIllustration from "../src/assets/TY1.png"; // Illustration

export default function ThankYou() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${thankYouBg})` }}
    >
      <ThankYouCard
        illustration={thankYouIllustration}
        title="THANK YOU!"
        subtitle="VISIT COMPLETE"
        message="We hope to see you again soon!"
      />
    </div>
  );
}
