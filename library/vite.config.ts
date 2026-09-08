import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { resolve } from 'path';
import pkg from './package.json';

const devDependencies = pkg.devDependencies || {};
const dependencies = (pkg as any).dependencies || {};
const peerDependencies = pkg.peerDependencies || {};

export default defineConfig({
    publicDir: false,
    plugins: [
        plugin({
            'jsxRuntime': 'classic'
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src', 'index.ts'),
            formats: ['es', 'cjs'],
            fileName: (ext) => ext === 'es' ? 'index.js' : 'index.cjs.js',
        },
        rollupOptions: {
            external: [
                ...Object.keys(devDependencies),
                ...Object.keys(dependencies),
                ...Object.keys(peerDependencies)
            ],
            output: {
                banner: '"use client";',
                exports: 'named',
            }
        },
        target: 'esnext',
        sourcemap: false
    },
});
