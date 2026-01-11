<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	// PWA registration
	onMount(async () => {
		if ('serviceWorker' in navigator) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(registration) {
					console.log('SW registered:', registration);
				},
				onRegisterError(error) {
					console.error('SW registration error:', error);
				}
			});
		}
	});
</script>

<div class="min-h-screen bg-surface-900">
	{@render children()}
</div>
