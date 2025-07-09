import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Initialize the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Note: Loading screen is now managed by the useLoadingScreen hook in App.tsx
// This ensures it hides when the 3D experience is actually ready, not just after a fixed delay
