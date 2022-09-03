import path from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: false,
    lib: {
      entry: path.join(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => '[name].mjs',
    },
    rollupOptions: {
      external: [
        'vite',
        ...builtinModules
          .filter(m => !m.startsWith('_'))
          .map(m => [m, `node:${m}`])
          .flat(),
      ],
    },
  },
})