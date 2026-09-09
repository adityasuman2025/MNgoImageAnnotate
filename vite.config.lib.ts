// vite.config.lib.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        dts({
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.app.json',
            exclude: ['src/**'],
        }),
        cssInjectedByJsPlugin(),
    ],
    build: {
        outDir: 'dist', // Output NPM package files to dist/
        emptyOutDir: true,
        lib: {
            entry: 'library/MNgoImageAnnotate.tsx',
            name: 'MNgoImageAnnotate',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
            },
        },
    },
});