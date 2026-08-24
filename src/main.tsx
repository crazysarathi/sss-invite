import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AdminApp } from "@/admin/AdminApp";
import { applyTheme, resolveInitialPalette, resolveTheme } from "@/themes";

const isAdmin = window.location.pathname.startsWith("/sss-admin");

if (isAdmin) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AdminApp />
    </StrictMode>
  );
} else {
  // Tokens on <html> BEFORE the first React paint: no flash of the fallback
  // colours when the reader arrives with ?palette= or a stored preference.
  applyTheme(resolveTheme(resolveInitialPalette()));

  // Reveal-hiding only applies when animations will actually run.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("gsap-ready");
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
