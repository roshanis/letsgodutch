<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db';
	import type { Group } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import GroupCard from '$lib/components/GroupCard.svelte';
	import CreateGroupModal from '$lib/components/CreateGroupModal.svelte';

	let groups = $state<Group[]>([]);
	let memberCounts = $state<Map<string, number>>(new Map());
	let loading = $state(true);
	let showCreateModal = $state(false);

	onMount(async () => {
		await loadGroups();
	});

	async function loadGroups() {
		loading = true;
		try {
			groups = await db.groups.list();
			// Load member counts for each group
			const counts = new Map<string, number>();
			for (const group of groups) {
				const members = await db.members.listByGroup(group.id);
				counts.set(group.id, members.length);
			}
			memberCounts = counts;
		} catch (err) {
			console.error('Failed to load groups:', err);
		} finally {
			loading = false;
		}
	}

	function handleGroupCreated(groupId: string) {
		showCreateModal = false;
		goto(`/group/${groupId}`);
	}
</script>

<svelte:head>
	<title>LetsGoDutch - Split Expenses</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header title="LetsGoDutch">
		<div slot="actions">
			<a
				href="/settings"
				class="btn btn-sm variant-ghost-surface p-2"
				aria-label="Settings"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</a>
		</div>
	</Header>

	<main class="flex-1 container mx-auto px-4 py-6 max-w-2xl">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-pulse text-surface-400">Loading...</div>
			</div>
		{:else if groups.length === 0}
			<!-- Empty state -->
			<div class="card p-8 text-center bg-surface-800 mt-8">
				<div class="text-6xl mb-4">🧾</div>
				<h2 class="text-xl font-semibold mb-2">No groups yet</h2>
				<p class="text-surface-400 mb-6">Create a group to start splitting expenses with friends</p>
				<button
					class="btn variant-filled-primary"
					onclick={() => (showCreateModal = true)}
				>
					+ Create Group
				</button>
			</div>
		{:else}
			<!-- Groups list -->
			<div class="space-y-3">
				{#each groups as group (group.id)}
					<GroupCard
						{group}
						memberCount={memberCounts.get(group.id) ?? 0}
					/>
				{/each}
			</div>
		{/if}

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-surface-500">
			<p>Your data stays on your device</p>
			<p class="mt-1">P2P sync · No cloud · Open source</p>
		</footer>
	</main>

	<!-- FAB -->
	{#if groups.length > 0}
		<button
			class="fixed bottom-6 right-6 btn-icon variant-filled-primary text-2xl w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
			onclick={() => (showCreateModal = true)}
			aria-label="Create new group"
		>
			+
		</button>
	{/if}

	<!-- Create Group Modal -->
	<CreateGroupModal
		open={showCreateModal}
		onClose={() => (showCreateModal = false)}
		onCreated={handleGroupCreated}
	/>
</div>
