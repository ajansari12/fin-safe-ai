import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor bundles
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js', '@tanstack/react-query'],
          // Enhanced analytics chunks
          analytics: ['@/components/analytics/ExecutiveDashboard', '@/components/analytics/OperationalDashboard'],
          'vendor-feeds': ['@/services/vendor-feed-integration-service'],
          auth: ['@/contexts/EnhancedAuthContext', '@/components/auth'],
          virtualization: ['react-window', 'react-virtualized-auto-sizer'],
        },
      },
    },
    chunkSizeWarningLimit: 400, // Reduced from 600KB
  },
}));
