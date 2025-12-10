import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        imagetools({
            defaultDirectives: (url) => {
                if (url.searchParams.has('optimize')) {
                    return new URLSearchParams({
                        format: 'webp',
                        quality: '80',
                        width: '1920'
                    });
                }
                return new URLSearchParams();
            }
        }),
        legacy({
            targets: ['defaults', 'not IE 11']
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'assets/**/*'],
            manifest: {
                name: 'Quiz Cristiano',
                short_name: 'Quiz Cristiano',
                description: 'El mejor juego de preguntas bíblicas',
                theme_color: '#ffd700',
                background_color: '#1e3c8a',
                display: 'standalone',
                icons: [
                    {
                        src: 'assets/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cdnjs-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            }
                        }
                    }
                ]
            }
        })
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['./src/services/GameDataService.js', './src/services/RankingService.js']
                },
                assetFileNames: (assetInfo) => {
                    let extType = assetInfo.name.split('.').at(1);
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = 'images';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js'
            }
        },
        chunkSizeWarningLimit: 1000
    },
    server: {
        port: 3000,
        open: true
    }
});
