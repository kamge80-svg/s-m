import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SoundProvider } from './contexts/SoundContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
// import { registerServiceWorker, checkInstallPrompt } from './utils/pwa';
import App from './App.tsx';
import './index.css';

// Register PWA - Désactivé temporairement pour Vercel
// registerServiceWorker();
// checkInstallPrompt();

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
