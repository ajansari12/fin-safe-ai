
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Environment validation
import { validateEnvironment, logEnvironmentStatus } from "./utils/env-validation";

// Integration service will be initialized in protected routes only

// Preload critical routes
import { preloadCriticalRoutes } from "./lib/performance/lazy-loading";

// Validate environment variables at startup
try {
  validateEnvironment();
  logEnvironmentStatus();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  // In production, you might want to show a user-friendly error page
  // For now, we'll continue but log the error
}

// Initialize preloading
preloadCriticalRoutes();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
