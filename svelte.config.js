import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$db: './src/lib/db',
			$types: './src/lib/types',
			$utils: './src/lib/utils',
			$sync: './src/lib/sync'
		}
	}
};

export default config;
