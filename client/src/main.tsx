import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import * as Sentry from "@sentry/react";
import { initSentry } from "./lib/sentry";

initSentry();

const root = createRoot(document.getElementById("root")!, {
  onUncaughtError: (error, errorInfo) => {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
    console.warn("Uncaught error", error, errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  },
  onRecoverableError: (error, errorInfo) => {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  },
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
