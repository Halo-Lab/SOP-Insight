import * as Sentry from "@sentry/react";

const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN ||
  "https://023324c2edc19a51558e82f1749c7355@o4509317510922240.ingest.de.sentry.io/4509317513871440";

export function initSentry() {
  if (!SENTRY_DSN || SENTRY_DSN.includes("examplePublicKey")) {
    console.warn(
      "Sentry DSN not found or using example value. Sentry will not be initialized."
    );
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
    tracePropagationTargets: [/^\//, /^https:\/\/halo-yp\.sentry\.io\/api/],

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    sendDefaultPii: true,

    environment: import.meta.env.MODE || "development",
  });
}

export const reactErrorHandler = Sentry.reactErrorHandler;
