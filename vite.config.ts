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
        manualChunks: (id) => {
          // Core vendor bundles
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-window') || id.includes('react-virtualized')) {
              return 'vendor-virtualization';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-misc';
          }
          
          // Analytics components
          if (id.includes('/components/analytics/')) {
            return 'analytics';
          }
          
          // Auth components
          if (id.includes('/components/auth/') || id.includes('/contexts/') && id.includes('Auth')) {
            return 'auth';
          }
          
          // Performance and services
          if (id.includes('/lib/performance/') || id.includes('/services/')) {
            return 'performance';
          }
          
          // Dashboard components
          if (id.includes('/components/dashboard/') || id.includes('/pages/Dashboard')) {
            return 'dashboard';
          }
          
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 300, // Reduced from 400KB
    target: 'esnext',
    minify: true, // Use default esbuild minifier
  },
}));
