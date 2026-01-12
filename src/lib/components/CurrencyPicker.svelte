<script lang="ts">
	import { CURRENCY_INFO } from '$lib/currency/rates';

	interface Props {
		value: string;
		onChange: (currency: string) => void;
	}

	let { value, onChange }: Props = $props();

	let search = $state('');
	let isOpen = $state(false);

	const currencies = Object.entries(CURRENCY_INFO);
	const filtered = $derived(
		search
			? currencies.filter(
					([code, info]) =>
						code.toLowerCase().includes(search.toLowerCase()) ||
						info.name.toLowerCase().includes(search.toLowerCase())
				)
			: currencies
	);

	const selectedInfo = $derived(CURRENCY_INFO[value]);

	function select(code: string) {
		onChange(code);
		isOpen = false;
		search = '';
	}
</script>

<div class="relative">
	<button
		type="button"
		class="input px-3 py-2 bg-surface-700 flex items-center gap-2 w-full text-left"
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="font-medium">{value}</span>
		{#if selectedInfo}
			<span class="text-surface-400 text-sm">{selectedInfo.symbol} {selectedInfo.name}</span>
		{/if}
		<span class="ml-auto text-surface-400">▼</span>
	</button>

	{#if isOpen}
		<div class="absolute z-20 mt-1 w-full bg-surface-800 rounded-lg shadow-xl border border-surface-700 max-h-64 overflow-hidden">
			<div class="p-2 border-b border-surface-700">
				<input
					type="text"
					class="input px-3 py-1.5 bg-surface-700 w-full text-sm"
					placeholder="Search currencies..."
					bind:value={search}
				/>
			</div>
			<div class="overflow-y-auto max-h-48">
				{#each filtered as [code, info] (code)}
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-surface-700 flex items-center gap-2 {value === code ? 'bg-primary-500/20' : ''}"
						onclick={() => select(code)}
					>
						<span class="font-medium w-12">{code}</span>
						<span class="text-surface-400 text-sm">{info.symbol}</span>
						<span class="text-surface-300 text-sm flex-1">{info.name}</span>
						{#if value === code}
							<span class="text-primary-400">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Close dropdown when clicking outside -->
{#if isOpen}
	<button
		class="fixed inset-0 z-10"
		onclick={() => (isOpen = false)}
		aria-label="Close"
	></button>
{/if}
