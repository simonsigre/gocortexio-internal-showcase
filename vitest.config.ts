/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src'),
            '@shared': path.resolve(__dirname, './shared'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        include: ['client/src/**/*.test.{ts,tsx}'],
    },
});
