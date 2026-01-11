<script lang="ts">
	import { db } from '$lib/db';

	interface Props {
		open: boolean;
		onClose: () => void;
		onCreated: (groupId: string) => void;
	}

	let { open, onClose, onCreated }: Props = $props();

	let name = $state('');
	let currency = $state('USD');
	let loading = $state(false);
	let error = $state('');

	const currencies = [
		{ code: 'USD', name: 'US Dollar' },
		{ code: 'EUR', name: 'Euro' },
		{ code: 'GBP', name: 'British Pound' },
		{ code: 'JPY', name: 'Japanese Yen' },
		{ code: 'AUD', name: 'Australian Dollar' },
		{ code: 'CAD', name: 'Canadian Dollar' },
		{ code: 'CHF', name: 'Swiss Franc' },
		{ code: 'INR', name: 'Indian Rupee' },
		{ code: 'CNY', name: 'Chinese Yuan' },
		{ code: 'SGD', name: 'Singapore Dollar' }
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim()) {
			error = 'Please enter a group name';
			return;
		}

		loading = true;
		error = '';

		try {
			const group = await db.groups.create({
				name: name.trim(),
				defaultCurrency: currency
			});
			name = '';
			currency = 'USD';
			onCreated(group.id);
		} catch (err) {
			error = 'Failed to create group';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleClose() {
		name = '';
		currency = 'USD';
		error = '';
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60"
			onclick={handleClose}
			aria-label="Close modal"
		></button>

		<!-- Modal -->
		<div class="card p-6 w-full max-w-md bg-surface-800 relative z-10">
			<h2 class="text-xl font-semibold mb-4">Create Group</h2>

			<form onsubmit={handleSubmit} class="space-y-4">
				<label class="label">
					<span class="text-sm text-surface-300">Group Name</span>
					<input
						type="text"
						class="input px-4 py-2 bg-surface-700"
						placeholder="e.g., Trip to Berlin"
						bind:value={name}
						disabled={loading}
					/>
				</label>

				<label class="label">
					<span class="text-sm text-surface-300">Default Currency</span>
					<select class="select px-4 py-2 bg-surface-700" bind:value={currency} disabled={loading}>
						{#each currencies as curr}
							<option value={curr.code}>{curr.code} - {curr.name}</option>
						{/each}
					</select>
				</label>

				{#if error}
					<p class="text-red-400 text-sm">{error}</p>
				{/if}

				<div class="flex gap-3 pt-2">
					<button
						type="button"
						class="btn variant-ghost-surface flex-1"
						onclick={handleClose}
						disabled={loading}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn variant-filled-primary flex-1"
						disabled={loading}
					>
						{loading ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
