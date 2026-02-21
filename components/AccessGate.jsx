import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ACCESS_PARAM = import.meta.env.VITE_QR_ACCESS_PARAM || "k";
const ACCESS_KEY = (import.meta.env.VITE_QR_ACCESS_KEY || "").trim();
const SESSION_FLAG_KEY = "visitrak.qrAccessGranted";

const buildCleanUrl = (location, params) => {
  const nextSearch = params.toString();
  const query = nextSearch ? `?${nextSearch}` : "";
  return `${location.pathname}${query}${location.hash || ""}`;
};

const AccessDeniedScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#381366] via-[#4A2279] to-[#573483] px-5">
    <div className="max-w-md w-full bg-white/95 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/60">
      <h1 className="text-xl sm:text-2xl font-bold text-[#2f2450]">
        Access Restricted
      </h1>
      <p className="mt-3 text-sm sm:text-base text-[#4b3a6a] leading-relaxed">
        This page can only be opened using your official VisiTrak QR code.
        Please scan the QR code to continue.
      </p>
    </div>
  </div>
);

export default function AccessGate({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!ACCESS_KEY) {
      setAllowed(true);
      setChecked(true);
      return;
    }

    const params = new URLSearchParams(location.search);
    const incomingKey = params.get(ACCESS_PARAM);

    if (incomingKey && incomingKey === ACCESS_KEY) {
      sessionStorage.setItem(SESSION_FLAG_KEY, "1");

      params.delete(ACCESS_PARAM);
      const currentUrl = `${location.pathname}${location.search}${location.hash || ""}`;
      const cleanUrl = buildCleanUrl(location, params);
      if (cleanUrl !== currentUrl) {
        navigate(cleanUrl, { replace: true });
      }

      setAllowed(true);
      setChecked(true);
      return;
    }

    const hasSessionAccess =
      sessionStorage.getItem(SESSION_FLAG_KEY) === "1";
    setAllowed(hasSessionAccess);
    setChecked(true);
  }, [location, navigate]);

  if (!checked) {
    return null;
  }

  if (!allowed) {
    return <AccessDeniedScreen />;
  }

  return children;
}
