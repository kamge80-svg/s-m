import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SoundProvider } from './contexts/SoundContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker, checkInstallPrompt } from './utils/pwa';
import { measureWebVitals } from './utils/webVitals';
import App from './App.tsx';
import './index.css';

// Initialize Sentry in production only
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
        return null;
      }
      return event;
    },
  });
}

// Register PWA
registerServiceWorker();
checkInstallPrompt();

// Measure Web Vitals in production
if (import.meta.env.PROD) {
  measureWebVitals();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <SoundProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </SoundProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
