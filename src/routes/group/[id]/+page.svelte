<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { db } from '$lib/db';
	import { calculateBalances, simplifyDebts } from '$lib/calc/balance';
	import { initGroupSync, getConnectionStatus, getPeerCount, destroyGroupSync, type GroupSync } from '$lib/sync/yjs';
	import { getStoredRoomKey } from '$lib/sync/invite';
	import type { Group, Member, Expense, Debt } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import MemberList from '$lib/components/MemberList.svelte';
	import ExpenseCard from '$lib/components/ExpenseCard.svelte';
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import AddMemberModal from '$lib/components/AddMemberModal.svelte';
	import BalanceSummary from '$lib/components/BalanceSummary.svelte';
	import ShareGroupModal from '$lib/components/ShareGroupModal.svelte';
	import SyncStatus from '$lib/components/SyncStatus.svelte';

	let group = $state<Group | null>(null);
	let members = $state<Member[]>([]);
	let expenses = $state<Expense[]>([]);
	let balances = $state<Map<string, number>>(new Map());
	let debts = $state<Debt[]>([]);
	let loading = $state(true);
	let showAddMember = $state(false);
	let showAddExpense = $state(false);
	let showShare = $state(false);
	let activeTab = $state<'expenses' | 'members' | 'balances'>('expenses');

	// Sync state
	let sync = $state<GroupSync | null>(null);
	let syncStatus = $state<'disconnected' | 'connecting' | 'connected'>('disconnected');
	let peerCount = $state(0);

	const groupId = $derived($page.params.id as string);

	onMount(async () => {
		if (!groupId) {
			goto('/');
			return;
		}
		await loadGroup();
		initSync();
	});

	onDestroy(() => {
		if (sync) {
			destroyGroupSync(groupId);
		}
	});

	function initSync() {
		const roomKey = getStoredRoomKey(groupId);
		if (roomKey) {
			sync = initGroupSync(groupId, roomKey);
			updateSyncStatus();
			// Update status periodically
			const interval = setInterval(updateSyncStatus, 2000);
			return () => clearInterval(interval);
		}
	}

	function updateSyncStatus() {
		if (sync) {
			syncStatus = getConnectionStatus(sync);
			peerCount = getPeerCount(sync);
		}
	}

	function handleSyncEnabled(roomKey: string) {
		sync = initGroupSync(groupId, roomKey);
		updateSyncStatus();
	}

	async function loadGroup() {
		if (!groupId) return;
		loading = true;
		try {
			group = (await db.groups.get(groupId)) ?? null;
			if (!group) {
				goto('/');
				return;
			}
			members = await db.members.listByGroup(groupId);
			expenses = await db.expenses.listByGroup(groupId);

			// Calculate balances
			balances = calculateBalances(expenses, members);
			debts = simplifyDebts(balances);
		} catch (err) {
			console.error('Failed to load group:', err);
		} finally {
			loading = false;
		}
	}

	function getMemberById(id: string): Member | undefined {
		return members.find((m) => m.id === id);
	}

	function handleMemberAdded() {
		showAddMember = false;
		loadGroup();
	}

	function handleExpenseSaved() {
		showAddExpense = false;
		loadGroup();
	}
</script>

<svelte:head>
	<title>{group?.name ?? 'Group'} - LetsGoDutch</title>
</svelte:head>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="animate-pulse text-surface-400">Loading...</div>
	</div>
{:else if group}
	<div class="min-h-screen flex flex-col">
		<Header
			title={group.name}
			showBack={true}
			onBack={() => goto('/')}
		>
			<div slot="actions" class="flex items-center gap-2">
				<SyncStatus status={syncStatus} {peerCount} />
				<button
					class="btn btn-sm variant-ghost-surface"
					onclick={() => (showShare = true)}
					aria-label="Share group"
				>
					Share
				</button>
			</div>
		</Header>

		{#if showAddExpense}
			<!-- Add Expense Form -->
			<main class="flex-1 container mx-auto px-4 py-6 max-w-2xl">
				<h2 class="text-xl font-semibold mb-6">Add Expense</h2>
				<ExpenseForm
					{groupId}
					{members}
					currency={group.defaultCurrency}
					onSaved={handleExpenseSaved}
					onCancel={() => (showAddExpense = false)}
				/>
			</main>
		{:else}
			<!-- Tab Navigation -->
			<div class="border-b border-surface-700">
				<div class="container mx-auto max-w-2xl flex">
					<button
						class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'expenses'
							? 'border-primary-500 text-primary-500'
							: 'border-transparent text-surface-400 hover:text-surface-200'}"
						onclick={() => (activeTab = 'expenses')}
					>
						Expenses
					</button>
					<button
						class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'balances'
							? 'border-primary-500 text-primary-500'
							: 'border-transparent text-surface-400 hover:text-surface-200'}"
						onclick={() => (activeTab = 'balances')}
					>
						Balances
					</button>
					<button
						class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'members'
							? 'border-primary-500 text-primary-500'
							: 'border-transparent text-surface-400 hover:text-surface-200'}"
						onclick={() => (activeTab = 'members')}
					>
						Members ({members.length})
					</button>
				</div>
			</div>

			<main class="flex-1 container mx-auto px-4 py-6 max-w-2xl">
				{#if activeTab === 'expenses'}
					{#if expenses.length === 0}
						<div class="card p-8 text-center bg-surface-800">
							<div class="text-5xl mb-3">💸</div>
							<h3 class="text-lg font-medium mb-2">No expenses yet</h3>
							<p class="text-surface-400 mb-4">Add your first expense to start tracking</p>
							{#if members.length < 2}
								<p class="text-sm text-warning-400 mb-4">Add at least 2 members first</p>
								<button
									class="btn variant-filled-secondary"
									onclick={() => (showAddMember = true)}
								>
									+ Add Member
								</button>
							{:else}
								<button
									class="btn variant-filled-primary"
									onclick={() => (showAddExpense = true)}
								>
									+ Add Expense
								</button>
							{/if}
						</div>
					{:else}
						<div class="space-y-3">
							{#each expenses as expense (expense.id)}
								<ExpenseCard
									{expense}
									paidByMember={getMemberById(expense.paidBy)}
								/>
							{/each}
						</div>
					{/if}
				{:else if activeTab === 'balances'}
					<BalanceSummary
						{debts}
						{members}
						currency={group.defaultCurrency}
					/>
				{:else if activeTab === 'members'}
					{#if members.length === 0}
						<div class="card p-8 text-center bg-surface-800">
							<div class="text-5xl mb-3">👥</div>
							<h3 class="text-lg font-medium mb-2">No members yet</h3>
							<p class="text-surface-400 mb-4">Add members to split expenses with</p>
							<button
								class="btn variant-filled-primary"
								onclick={() => (showAddMember = true)}
							>
								+ Add Member
							</button>
						</div>
					{:else}
						<MemberList
							{members}
							{balances}
							currency={group.defaultCurrency}
						/>
					{/if}
				{/if}
			</main>

			<!-- FAB for adding expenses -->
			{#if members.length >= 2 && activeTab === 'expenses'}
				<button
					class="fixed bottom-6 right-6 btn-icon variant-filled-primary text-2xl w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
					onclick={() => (showAddExpense = true)}
					aria-label="Add expense"
				>
					+
				</button>
			{/if}
		{/if}

		<!-- Add Member Modal -->
		<AddMemberModal
			open={showAddMember}
			{groupId}
			onClose={() => (showAddMember = false)}
			onAdded={handleMemberAdded}
		/>

		<!-- Share Group Modal -->
		<ShareGroupModal
			open={showShare}
			{groupId}
			groupName={group.name}
			onClose={() => (showShare = false)}
			onEnableSync={handleSyncEnabled}
		/>
	</div>
{/if}
