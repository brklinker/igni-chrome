import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        }
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
        background: './src/background-scripts/background.tsx',
        content: './src/content-scripts/content-main.tsx',
        googleLensContent: './src/content-scripts/google-lens.tsx'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Remove the content-scripts/ prefix and .tsx extension
          const name = chunkInfo.name.replace('content-scripts/', '').replace('.tsx', '');
          return `${name}.js`;
        },
      }
    },
  },
});