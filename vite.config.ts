import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'picoapp',
      fileName: 'picoapp',
    },
    rollupOptions: {
      external: ['martha', 'evx'],
      output: {
        globals: {
          martha: 'martha',
          evx: 'evx',
        },
      },
    },
  },
})
