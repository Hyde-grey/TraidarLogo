import { useRef } from "react";

/**
 * Hook to manage loading screen visibility
 * Provides a way to signal when the 3D experience is ready
 */
export function useLoadingScreen() {
  const hasHiddenRef = useRef(false);

  const hideLoadingScreen = () => {
    if (hasHiddenRef.current) return;
    hasHiddenRef.current = true;

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
  };

  const signalExperienceReady = () => {
    // Small delay to ensure everything is properly rendered
    setTimeout(() => {
      hideLoadingScreen();
    }, 300);
  };

  return { signalExperienceReady };
}

/**
 * Global function to hide loading screen (for external use)
 */
export function hideLoadingScreen() {
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
