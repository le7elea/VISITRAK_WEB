import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisiTrakForm from "../pages/VisiTrakForm";
import SuccessPage from "../pages/SuccessPage";
import FeedbackForm from "../pages/Satisfaction";
import ThankYou from "../pages/ThankYou";
import ExitScreen from "../pages/ExitScreen";
import SuccessModal from "../pages/SuccessModal";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Registration Form Page */}
        <Route path="/" element={<VisiTrakForm />} />

        {/* Success Page */}
        <Route path="/success" element={<SuccessPage />} />

        {/* Feedback Form Page */}
        <Route path="/satisfaction" element={<FeedbackForm />} />

        {/* Thank You Page */}
        <Route path="/thankyou" element={<ThankYou />} />

        <Route path="/exit" element={<ExitScreen />} />

        <Route path="/successmodal" element={<SuccessModal />} />
      </Routes>
    </Router>
  );
}
