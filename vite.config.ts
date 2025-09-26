import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          'utils': ['zod', 'clsx']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify for production
    minify: 'esbuild',
    // Target modern browsers for better performance
    target: 'es2020'
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"]
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', 'zod', 'clsx']
  }
});
