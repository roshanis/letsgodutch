<script lang="ts">
	import { generateRoomKey, generateInviteLink, storeRoomKey, getStoredRoomKey, copyToClipboard } from '$lib/sync/invite';

	interface Props {
		open: boolean;
		groupId: string;
		groupName: string;
		onClose: () => void;
		onEnableSync: (roomKey: string) => void;
	}

	let { open, groupId, groupName, onClose, onEnableSync }: Props = $props();

	let roomKey = $state<string | null>(null);
	let inviteLink = $state('');
	let copied = $state(false);
	let syncEnabled = $state(false);

	$effect(() => {
		if (open) {
			// Check if sync is already enabled for this group
			const existingKey = getStoredRoomKey(groupId);
			if (existingKey) {
				roomKey = existingKey;
				inviteLink = generateInviteLink(groupId, existingKey);
				syncEnabled = true;
			} else {
				roomKey = null;
				inviteLink = '';
				syncEnabled = false;
			}
			copied = false;
		}
	});

	function enableSync() {
		const newKey = generateRoomKey();
		roomKey = newKey;
		inviteLink = generateInviteLink(groupId, newKey);
		storeRoomKey(groupId, newKey);
		syncEnabled = true;
		onEnableSync(newKey);
	}

	async function handleCopy() {
		const success = await copyToClipboard(inviteLink);
		if (success) {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/60"
			onclick={onClose}
			aria-label="Close modal"
		></button>

		<div class="card p-6 w-full max-w-md bg-surface-800 relative z-10">
			<h2 class="text-xl font-semibold mb-2">Share "{groupName}"</h2>
			<p class="text-sm text-surface-400 mb-6">
				Invite others to sync expenses in real-time
			</p>

			{#if !syncEnabled}
				<!-- Sync not enabled yet -->
				<div class="space-y-4">
					<div class="p-4 rounded-lg bg-surface-700">
						<h3 class="font-medium mb-2">How P2P Sync Works</h3>
						<ul class="text-sm text-surface-400 space-y-2">
							<li>• Expenses sync directly between devices</li>
							<li>• No data stored on any server</li>
							<li>• Works when peers are online together</li>
							<li>• Link contains encryption key (keep it private)</li>
						</ul>
					</div>

					<button
						class="btn variant-filled-primary w-full"
						onclick={enableSync}
					>
						Enable P2P Sync
					</button>
				</div>
			{:else}
				<!-- Sync enabled, show invite link -->
				<div class="space-y-4">
					<div>
						<label class="text-sm text-surface-300 mb-2 block">Invite Link</label>
						<div class="flex gap-2">
							<input
								type="text"
								class="input px-3 py-2 bg-surface-700 flex-1 text-sm font-mono"
								value={inviteLink}
								readonly
							/>
							<button
								class="btn variant-filled-secondary px-4"
								onclick={handleCopy}
							>
								{copied ? '✓' : 'Copy'}
							</button>
						</div>
						<p class="text-xs text-surface-500 mt-2">
							Anyone with this link can join and sync expenses
						</p>
					</div>

					<div class="p-3 rounded-lg bg-warning-500/10 border border-warning-500/30">
						<p class="text-sm text-warning-400">
							⚠️ Keep this link private. The encryption key in the link gives full access to the group.
						</p>
					</div>

					<div class="flex gap-3 pt-2">
						<button
							class="btn variant-ghost-surface flex-1"
							onclick={onClose}
						>
							Done
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
