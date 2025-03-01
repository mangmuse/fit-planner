"use client";
import { useEffect } from "react";

const RegisterSW = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.info("Service Worker registered"))
        .catch((err) => console.error("SW registration failed", err));
    }
  }, []);

  return null;
};
export default RegisterSW;
