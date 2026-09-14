// src/vite-env.d.ts
declare module '../dist/index.es.js' {
    import type { ComponentType } from 'react';
    const MNgoImageAnnotate: ComponentType<any>;
    export default MNgoImageAnnotate;
}