import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Expose to network
    port: 5173,
  },
  build: {
    // Optimize bundle size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'sentry-vendor': ['@sentry/react'],
          // Feature chunks
          'courses': [
            './src/components/CreateCourse.tsx',
            './src/components/CourseViewer.tsx',
            './src/components/CoursePlayer.tsx',
            './src/components/QuizComponent.tsx',
            './src/components/CertificateGenerator.tsx',
          ],
          'payments': [
            './src/components/PaymentModal.tsx',
            './src/components/StripeCardForm.tsx',
            './src/services/stripeService.ts',
          ],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
  },
});
