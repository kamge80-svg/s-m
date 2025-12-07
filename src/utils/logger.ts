/**
 * Logger utility for development and production
 * Automatically disabled in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  // For tracking important events (can be sent to analytics)
  track: (event: string, data?: any) => {
    if (isDev) {
      console.log(`[TRACK] ${event}`, data);
    }
    // TODO: Send to analytics service (GA4, Mixpanel, etc.)
  },
};

// Export individual functions for convenience
export const { log, error, warn, info, debug, track } = logger;
