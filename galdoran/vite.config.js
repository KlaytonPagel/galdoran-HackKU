import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    server: {
        allowedHosts: ["galdoran.org"] 
    },
    plugins: [
        wasm(),
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
    ],
    optimizeDeps: {
        exclude: ['@dimforge/rapier3d'], // Important for WASM
    },
});
