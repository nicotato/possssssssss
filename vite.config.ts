import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const isAnalyze = mode === 'analyze';
  const isDev = command === 'serve';
  const buildTime = new Date().toISOString();
  
  return {
    // GitHub Pages deployment configuration
    base: process.env.NODE_ENV === 'production' ? '/possssssssss/' : '/',
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          // Cache busting para archivos de producción
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks: (id) => {
            if (id.includes('chevrotain')) return 'chevrotain';
            if (id.includes('rxdb')) return 'rxdb';
            return undefined;
          }
        }
      }
    },
    resolve: {
      alias: {
        '@domain': path.resolve(__dirname, 'src/domain'),
        '@application': path.resolve(__dirname, 'src/application'),
        '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
        '@ui': path.resolve(__dirname, 'src/ui'),
        '@workers': path.resolve(__dirname, 'src/workers')
      }
    },
    define: {
      __BUILD_TIME__: JSON.stringify(buildTime),
      __DEV__: JSON.stringify(isDev)
    },
    esbuild: {
      target: 'es2022'
    },
    optimizeDeps: {
      include: ['chevrotain', 'dexie', 'rxdb']
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: false,
      // Configuraciones específicas para desarrollo
      headers: {
        // Prevenir caché excesivo en desarrollo
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Force reload en cambios de archivos importantes
      watch: {
        usePolling: process.platform === 'win32',
        interval: 1000
      }
    },
    preview: {
      port: 5180,
      headers: {
        // Headers más permisivos para preview
        'Cache-Control': 'max-age=300'  // 5 minutos
      }
    },
    // (Opcional) Análisis simple
    plugins: [
      react({
        jsxRuntime: 'automatic',
        include: [/\.tsx?$/, /\.jsx?$/],
        babel: {
          plugins: []
        }
      }),
      {
        name: 'log-chunks',
        generateBundle(_, bundle) {
          if (isAnalyze) {
            // Listado simple de tamaños
            for (const f of Object.values(bundle)) {
              if (f.type === 'chunk') {
                // eslint-disable-next-line no-console
                console.log('[chunk]', f.fileName, (f.code.length/1024).toFixed(2)+'kb');
              }
            }
          }
        }
      }
    ]
  };
});