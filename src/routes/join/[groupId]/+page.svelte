<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getRoomKeyFromHash, storeRoomKey } from '$lib/sync/invite';
	import { initGroupSync, getDataFromYjs, subscribeToChanges } from '$lib/sync/yjs';
	import { db } from '$lib/db';
	import type { Group } from '$lib/types';
	import Header from '$lib/components/Header.svelte';

	let status = $state<'loading' | 'joining' | 'syncing' | 'success' | 'error'>('loading');
	let errorMessage = $state('');
	let groupName = $state('');
	let memberCount = $state(0);

	const groupId = $derived($page.params.groupId as string);

	onMount(async () => {
		if (!browser) return;

		// Extract room key from URL hash
		const roomKey = getRoomKeyFromHash();
		if (!roomKey) {
			status = 'error';
			errorMessage = 'Invalid invite link. The encryption key is missing.';
			return;
		}

		status = 'joining';

		try {
			// Check if we already have this group
			const existingGroup = await db.groups.get(groupId);
			if (existingGroup) {
				// Already have this group, just enable sync
				storeRoomKey(groupId, roomKey);
				goto(`/group/${groupId}`);
				return;
			}

			// Initialize sync to receive group data
			status = 'syncing';
			const sync = initGroupSync(groupId, roomKey);

			// Wait for initial sync
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Sync timeout - no peers available'));
				}, 30000);

				// Wait for persistence to load
				sync.persistence.once('synced', async () => {
					const data = getDataFromYjs(sync.doc);

					if (data.group) {
						clearTimeout(timeout);

						// Save to local database
						const group: Group = {
							id: groupId,
							name: data.group.name,
							defaultCurrency: data.group.defaultCurrency,
							createdAt: data.group.createdAt,
							updatedAt: Date.now()
						};

						// Create group in local DB
						await db.groups.create({
							name: group.name,
							defaultCurrency: group.defaultCurrency
						}).catch(() => {
							// Group might already exist, that's fine
						});

						// Sync members
						for (const member of data.members) {
							await db.members.create({
								groupId: member.groupId,
								name: member.name,
								homeCurrency: member.homeCurrency
							}).catch(() => {});
						}

						// Sync expenses
						for (const expense of data.expenses) {
							await db.expenses.create({
								groupId: expense.groupId,
								paidBy: expense.paidBy,
								amount: expense.amount,
								currency: expense.currency,
								exchangeRate: expense.exchangeRate,
								description: expense.description,
								category: expense.category,
								date: expense.date,
								splits: expense.splits
							}).catch(() => {});
						}

						groupName = group.name;
						memberCount = data.members.length;
						storeRoomKey(groupId, roomKey);
						status = 'success';
						resolve();
					}
				});

				// Also listen for WebRTC updates
				if (sync.provider) {
					subscribeToChanges(sync.doc, async (data) => {
						if (data.group && status === 'syncing') {
							clearTimeout(timeout);
							groupName = data.group.name;
							memberCount = data.members.length;
							storeRoomKey(groupId, roomKey);
							status = 'success';
							resolve();
						}
					});
				}
			});
		} catch (err) {
			status = 'error';
			errorMessage = err instanceof Error ? err.message : 'Failed to join group';
		}
	});

	function goToGroup() {
		goto(`/group/${groupId}`);
	}
</script>

<svelte:head>
	<title>Join Group - LetsGoDutch</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header title="Join Group" showBack={true} onBack={() => goto('/')} />

	<main class="flex-1 flex items-center justify-center p-4">
		<div class="card p-8 text-center bg-surface-800 max-w-md w-full">
			{#if status === 'loading' || status === 'joining'}
				<div class="text-5xl mb-4">🔗</div>
				<h2 class="text-xl font-semibold mb-2">Joining group...</h2>
				<p class="text-surface-400">Validating invite link</p>
			{:else if status === 'syncing'}
				<div class="text-5xl mb-4 animate-pulse">🔄</div>
				<h2 class="text-xl font-semibold mb-2">Syncing data...</h2>
				<p class="text-surface-400">Connecting to peers</p>
				<p class="text-xs text-surface-500 mt-4">
					Make sure at least one group member is online
				</p>
			{:else if status === 'success'}
				<div class="text-5xl mb-4">✅</div>
				<h2 class="text-xl font-semibold mb-2">Joined "{groupName}"</h2>
				<p class="text-surface-400 mb-6">
					{memberCount} member{memberCount !== 1 ? 's' : ''}
				</p>
				<button class="btn variant-filled-primary" onclick={goToGroup}>
					Open Group
				</button>
			{:else if status === 'error'}
				<div class="text-5xl mb-4">❌</div>
				<h2 class="text-xl font-semibold mb-2">Failed to join</h2>
				<p class="text-red-400 mb-6">{errorMessage}</p>
				<button class="btn variant-ghost-surface" onclick={() => goto('/')}>
					Go Home
				</button>
			{/if}
		</div>
	</main>
</div>
