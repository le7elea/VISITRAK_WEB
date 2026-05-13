import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import VisiTrakForm from "../pages/VisiTrakForm";
import SuccessPage from "../pages/SuccessPage";
import FeedbackForm from "../pages/Satisfaction";
import ThankYou from "../pages/ThankYou";
import ExitScreen from "../pages/ExitScreen";
import SuccessModal from "../pages/SuccessModal";
import AccessGate from "../components/AccessGate";

const EXIT_CONFIRM_MESSAGE = "Are you sure you want to leave VisiTrak?";

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

function GlobalExitGuard() {
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = EXIT_CONFIRM_MESSAGE;
      return EXIT_CONFIRM_MESSAGE;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    window.history.pushState({ visiTrakExitGuard: true }, "");

    const handlePopState = () => {
      const shouldLeave = window.confirm(EXIT_CONFIRM_MESSAGE);

      if (shouldLeave) {
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
        return;
      }

      window.history.pushState({ visiTrakExitGuard: true }, "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <Router>
      <GlobalExitGuard />
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
