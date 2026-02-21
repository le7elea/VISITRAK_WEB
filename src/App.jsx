import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import VisiTrakForm from "../pages/VisiTrakForm";
import SuccessPage from "../pages/SuccessPage";
import FeedbackForm from "../pages/Satisfaction";
import ThankYou from "../pages/ThankYou";
import ExitScreen from "../pages/ExitScreen";
import SuccessModal from "../pages/SuccessModal";
import AccessGate from "../components/AccessGate";

function HomeRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = new URLSearchParams(location.search).get("redirect");
    if (!redirect) return;

    const normalized = redirect.startsWith("/") ? redirect : `/${redirect}`;
    const allowed = new Set(["/exit"]);

    if (allowed.has(normalized)) {
      navigate(normalized, { replace: true });
    }
  }, [location.search, navigate]);

  return <VisiTrakForm />;
}

export default function App() {
  return (
    <Router>
      <AccessGate>
        <Routes>
          {/* Registration Form Page */}
          <Route path="/" element={<HomeRoute />} />

          {/* Success Page */}
          <Route path="/success" element={<SuccessPage />} />

          {/* Feedback Form Page */}
          <Route path="/satisfaction" element={<FeedbackForm />} />

          {/* Thank You Page */}
          <Route path="/thankyou" element={<ThankYou />} />

          <Route path="/exit" element={<ExitScreen />} />

          <Route path="/successmodal" element={<SuccessModal />} />
        </Routes>
      </AccessGate>
    </Router>
  );
}
