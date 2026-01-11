<script lang="ts">
	interface Props {
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
	}

	let { title = 'LetsGoDutch', showBack = false, onBack }: Props = $props();
</script>

<header class="sticky top-0 z-10 bg-surface-900/95 backdrop-blur border-b border-surface-700">
	<div class="container mx-auto px-4 py-3 flex items-center gap-3">
		{#if showBack}
			<button
				onclick={onBack}
				class="btn btn-sm variant-ghost-surface p-2"
				aria-label="Go back"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
		{/if}
		<h1 class="text-lg font-semibold text-surface-50 flex-1">{title}</h1>
		<slot name="actions" />
	</div>
</header>
