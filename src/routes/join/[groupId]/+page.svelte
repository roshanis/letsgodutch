<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getRoomKeyFromHash, storeRoomKey } from '$lib/sync/invite';
	import { initGroupSync, getDataFromYjs, subscribeToChanges, type YjsSnapshot } from '$lib/sync/yjs';
	import { applySnapshotToDexie } from '$lib/sync/bridge';
	import { db } from '$lib/db';
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

				let settled = false;

				// Save the received snapshot into the local database with the
				// original ids intact, so member/expense references stay valid
				const trySaveSnapshot = async (data: YjsSnapshot) => {
					if (settled || !data.group) return;
					settled = true;
					clearTimeout(timeout);

					try {
						await applySnapshotToDexie(groupId, data);
						groupName = data.group.name;
						memberCount = data.members.length;
						storeRoomKey(groupId, roomKey);
						status = 'success';
						resolve();
					} catch (err) {
						settled = false;
						reject(err instanceof Error ? err : new Error('Failed to save group data'));
					}
				};

				// Wait for persistence to load (data may exist from a prior visit)
				sync.persistence.once('synced', () => {
					trySaveSnapshot(getDataFromYjs(sync.doc));
				});

				// Also listen for WebRTC updates from peers
				if (sync.provider) {
					subscribeToChanges(sync.doc, trySaveSnapshot);
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
