
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import integration service to initialize enhanced features
import "./services/integration-service";

// Preload critical routes
import { preloadCriticalRoutes } from "./lib/performance/lazy-loading";

// Initialize preloading
preloadCriticalRoutes();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
