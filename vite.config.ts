import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path';
//@ts-ignore
import { devDependencies, dependencies } from './package.json'

const IS_DEPL = process.env.IS_DEPL;
console.log("IS_DEPL", IS_DEPL)

//ref: https://miyauchi.dev/posts/lib-vite-tailwindcss/
const general = defineConfig({
  plugins: [
    plugin({
      'jsxRuntime': 'classic'
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib', 'index.ts'),
      formats: ['es', 'cjs'],
      fileName: (ext) => `index.${ext}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(devDependencies), ...Object.keys(dependencies)] //by-default vite bundles all dependencies, so passing array of dependencies to exclude
    },
    target: 'esnext',
    sourcemap: false
  },
});

// https://vitejs.dev/config/
const depoyment = defineConfig({
  plugins: [plugin()],
})

export default IS_DEPL ? depoyment : general;