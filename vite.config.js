import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
                bunny('Fraunces', {
                    alias: 'serif',
                    weights: [500, 600, 700],
                    styles: ['normal', 'italic'],
                }),
                bunny('Amiri', {
                    weights: [400, 700],
                    subsets: ['arabic', 'latin'],
                }),
            ],
        }),
        tailwindcss(),
        react(),
        inertia(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
