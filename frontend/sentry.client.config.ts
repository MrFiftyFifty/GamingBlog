/**
 * Sentry client-side config.
 * No-op unless NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * To enable: `npm install @sentry/nextjs` in frontend/, then uncomment the
 * Sentry.init() call below and set NEXT_PUBLIC_SENTRY_DSN in .env.local.
 */

// import * as Sentry from "@sentry/nextjs";
//
// if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
//   Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//     tracesSampleRate: 0.1,
//     replaysSessionSampleRate: 0.0,
//     replaysOnErrorSampleRate: 1.0,
//     environment: process.env.NODE_ENV,
//   });
// }

export {};
