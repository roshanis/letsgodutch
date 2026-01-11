import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.png', 'apple-touch-icon.png'],
			manifest: {
				name: 'LetsGoDutch',
				short_name: 'Dutch',
				description: 'Privacy-first, P2P expense sharing',
				theme_color: '#0f172a',
				background_color: '#0f172a',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\.frankfurter\.app\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'exchange-rates',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours
							}
						}
					}
				]
			}
		})
	]
});
