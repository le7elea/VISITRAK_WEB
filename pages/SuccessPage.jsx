import { useLocation } from "react-router-dom";
import Header from "../components/Success-header";
import SuccessCard from "../components/SuccessCard";
import Footer from "../components/Footer";

export default function SuccessPage() {
  const { state } = useLocation();
  const { fullName, exitKey, checkInTime, office } = state || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-700 to-indigo-500 flex flex-col">
      <Header title="VisiTrak" />
      <SuccessCard
        name={fullName || "Guest Visitor"}
        exitKey={exitKey || "N/A"}
        checkIn={checkInTime || "N/A"}
        visiting={office || "N/A"}
      />
      <div className="mt-7 text-center">
        <p className="text-white text-2xl font-semibold">Have a great visit!</p>
      </div>
      <Footer />
    </div>
  );
}
 