import { useLocation } from "react-router-dom";
import Header from "../components/Success-header";
import SuccessCard from "../components/SuccessCard";
import Footer from "../components/Footer";

export default function SuccessPage() {
  const { state } = useLocation();
  const name = state?.name ?? state?.fullName;
  const address = state?.address ?? state?.homeAddress;
  const office = state?.office;
  const checkInTime = state?.checkInTime;

  const formatCheckIn = (value) => {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toLocaleTimeString();
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleTimeString();
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] flex flex-col">
      <Header title="VisiTrak" />
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6">
        <SuccessCard
          name={name || "Guest Visitor"}
          address={address || "N/A"}
          checkIn={formatCheckIn(checkInTime)}
          visiting={office || "N/A"}
        />
        <div className="mt-6 sm:mt-7 text-center px-4">
          <p className="text-white text-lg sm:text-2xl font-semibold">
            Have a great visit!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
 
