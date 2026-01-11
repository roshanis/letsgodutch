<script lang="ts">
	// Groups will be loaded from IndexedDB
	let groups: { id: string; name: string; memberCount: number }[] = $state([]);
</script>

<svelte:head>
	<title>LetsGoDutch - Split Expenses</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-2xl">
	<!-- Header -->
	<header class="text-center mb-8">
		<h1 class="text-3xl font-bold text-primary-500 mb-2">LetsGoDutch</h1>
		<p class="text-surface-300">Privacy-first expense sharing</p>
	</header>

	<!-- Empty state -->
	{#if groups.length === 0}
		<div class="card p-8 text-center bg-surface-800">
			<div class="text-6xl mb-4">🧾</div>
			<h2 class="text-xl font-semibold mb-2">No groups yet</h2>
			<p class="text-surface-400 mb-6">Create a group to start splitting expenses with friends</p>
			<button class="btn variant-filled-primary">
				+ Create Group
			</button>
		</div>
	{:else}
		<!-- Groups list -->
		<div class="space-y-4">
			{#each groups as group (group.id)}
				<a href="/group/{group.id}" class="card p-4 block hover:bg-surface-700 bg-surface-800">
					<h3 class="font-semibold">{group.name}</h3>
					<p class="text-sm text-surface-400">{group.memberCount} members</p>
				</a>
			{/each}
		</div>

		<!-- FAB -->
		<button
			class="fixed bottom-6 right-6 btn-icon variant-filled-primary text-2xl w-14 h-14 rounded-full shadow-lg"
		>
			+
		</button>
	{/if}

	<!-- Footer -->
	<footer class="mt-12 text-center text-sm text-surface-500">
		<p>Your data stays on your device</p>
		<p class="mt-1">P2P sync &bull; No cloud &bull; Open source</p>
	</footer>
</main>
