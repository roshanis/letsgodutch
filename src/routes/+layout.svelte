<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// PWA registration (runs only in browser)
	onMount(async () => {
		if (browser && 'serviceWorker' in navigator) {
			try {
				// @ts-ignore - virtual module from vite-plugin-pwa
				const { registerSW } = await import('virtual:pwa-register');
				registerSW({
					immediate: true,
					onRegistered: (r: unknown) => console.log('SW registered:', r),
					onRegisterError: (e: unknown) => console.error('SW error:', e)
				});
			} catch {
				// PWA not available in dev mode
			}
		}
	});
</script>

<div class="min-h-screen bg-surface-900">
	{@render children()}
</div>
