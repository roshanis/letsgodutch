<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { dexieDb } from '$lib/db';
	import { exportAllData, serializeExport, importData, type ImportCounts } from '$lib/export/json';
	import { expensesToCsv } from '$lib/export/csv';
	import { destroyAllSyncs } from '$lib/sync/yjs';
	import Header from '$lib/components/Header.svelte';

	let groupCount = $state(0);
	let expenseCount = $state(0);
	let importResult = $state<ImportCounts | null>(null);
	let importError = $state('');
	let showDeleteConfirm = $state(false);
	let deleteConfirmText = $state('');
	let fileInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		await loadCounts();
	});

	async function loadCounts() {
		groupCount = await dexieDb.groups.count();
		expenseCount = await dexieDb.expenses.count();
	}

	function download(filename: string, content: string, type: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function dateStamp(): string {
		return new Date().toISOString().slice(0, 10);
	}

	async function handleExportJson() {
		const data = await exportAllData();
		download(`letsgodutch-backup-${dateStamp()}.json`, serializeExport(data), 'application/json');
	}

	async function handleExportCsv() {
		const data = await exportAllData();
		const csv = expensesToCsv(data.groups, data.members, data.expenses);
		download(`letsgodutch-expenses-${dateStamp()}.csv`, csv, 'text/csv');
	}

	async function handleImportFile(event: Event) {
		importError = '';
		importResult = null;
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			importResult = await importData(text);
			await loadCounts();
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Import failed';
		} finally {
			input.value = '';
		}
	}

	async function handleDeleteAll() {
		if (deleteConfirmText !== 'DELETE') return;

		destroyAllSyncs();
		await dexieDb.transaction(
			'rw',
			[dexieDb.groups, dexieDb.members, dexieDb.expenses, dexieDb.settlements],
			async () => {
				await dexieDb.settlements.clear();
				await dexieDb.expenses.clear();
				await dexieDb.members.clear();
				await dexieDb.groups.clear();
			}
		);
		localStorage.removeItem('letsgodutch-room-keys');

		showDeleteConfirm = false;
		deleteConfirmText = '';
		await loadCounts();
	}
</script>

<svelte:head>
	<title>Settings - LetsGoDutch</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header title="Settings" showBack={true} onBack={() => goto('/')} />

	<main class="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-6">
		<!-- Data overview -->
		<section class="card p-5 bg-surface-800">
			<h2 class="text-lg font-semibold mb-1">Your data</h2>
			<p class="text-sm text-surface-400">
				{groupCount} group{groupCount !== 1 ? 's' : ''} · {expenseCount} expense{expenseCount !== 1
					? 's'
					: ''} — stored only in this browser
			</p>
		</section>

		<!-- Export -->
		<section class="card p-5 bg-surface-800 space-y-3">
			<h2 class="text-lg font-semibold">Export</h2>
			<p class="text-sm text-surface-400">
				Download a backup of everything, or a spreadsheet of your expenses.
			</p>
			<div class="flex flex-wrap gap-3">
				<button class="btn variant-filled-primary" onclick={handleExportJson}>
					Export backup (JSON)
				</button>
				<button class="btn variant-ghost-surface" onclick={handleExportCsv}>
					Export expenses (CSV)
				</button>
			</div>
		</section>

		<!-- Import -->
		<section class="card p-5 bg-surface-800 space-y-3">
			<h2 class="text-lg font-semibold">Import</h2>
			<p class="text-sm text-surface-400">
				Restore a JSON backup. Existing entries with the same id are overwritten; nothing else is
				removed.
			</p>
			<input
				type="file"
				accept="application/json,.json"
				class="hidden"
				bind:this={fileInput}
				onchange={handleImportFile}
			/>
			<button class="btn variant-ghost-surface" onclick={() => fileInput?.click()}>
				Choose backup file…
			</button>
			{#if importResult}
				<p class="text-sm text-green-400">
					Imported {importResult.groups} groups, {importResult.members} members,
					{importResult.expenses} expenses, {importResult.settlements} settlements.
				</p>
			{/if}
			{#if importError}
				<p class="text-sm text-red-400">{importError}</p>
			{/if}
		</section>

		<!-- Danger zone -->
		<section class="card p-5 bg-surface-800 border border-red-900/50 space-y-3">
			<h2 class="text-lg font-semibold text-red-400">Danger zone</h2>
			{#if !showDeleteConfirm}
				<button class="btn variant-ghost-error" onclick={() => (showDeleteConfirm = true)}>
					Delete all data
				</button>
			{:else}
				<p class="text-sm text-surface-300">
					This permanently removes every group, expense, and settlement from this device. Type
					<span class="font-mono font-semibold">DELETE</span> to confirm.
				</p>
				<input
					type="text"
					class="input"
					placeholder="DELETE"
					bind:value={deleteConfirmText}
				/>
				<div class="flex gap-3">
					<button
						class="btn variant-filled-error"
						disabled={deleteConfirmText !== 'DELETE'}
						onclick={handleDeleteAll}
					>
						Permanently delete
					</button>
					<button
						class="btn variant-ghost-surface"
						onclick={() => {
							showDeleteConfirm = false;
							deleteConfirmText = '';
						}}
					>
						Cancel
					</button>
				</div>
			{/if}
		</section>
	</main>
</div>
