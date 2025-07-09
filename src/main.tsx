import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Loading screen management
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  const root = document.getElementById("root");

  if (loadingScreen && root) {
    // Add loaded class to root for fade-in effect
    root.classList.add("loaded");

    // Hide loading screen with fade-out effect
    loadingScreen.classList.add("hidden");

    // Remove loading screen from DOM after transition
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
}

// Initialize the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Note: Loading screen is now managed by the useLoadingScreen hook in App.tsx
// This ensures it hides when the 3D experience is actually ready, not just after a fixed delay
