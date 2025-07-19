
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Defer integration service import to avoid React hooks issues
// import "./services/integration-service";

// Preload critical routes
import { preloadCriticalRoutes } from "./lib/performance/lazy-loading";

// Initialize preloading
preloadCriticalRoutes();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize services after React is ready
setTimeout(() => {
  import("./services/integration-service");
}, 100);
