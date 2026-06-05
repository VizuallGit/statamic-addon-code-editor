import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/addon.js',
            formats: ['iife'],
            name: 'CodeEditorAddon',
            fileName: () => 'addon.js',
        },
        outDir: 'resources/js',
        emptyOutDir: false,
        rollupOptions: {
            external: [],
        },
        minify: false,
    },
});
