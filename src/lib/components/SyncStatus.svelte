<script lang="ts">
	interface Props {
		status: 'disconnected' | 'connecting' | 'connected';
		peerCount: number;
	}

	let { status, peerCount }: Props = $props();

	const statusConfig = {
		disconnected: {
			color: 'bg-surface-500',
			text: 'Offline',
			icon: '○'
		},
		connecting: {
			color: 'bg-warning-500 animate-pulse',
			text: 'Connecting...',
			icon: '◐'
		},
		connected: {
			color: 'bg-green-500',
			text: peerCount > 0 ? `${peerCount} peer${peerCount > 1 ? 's' : ''}` : 'Online',
			icon: '●'
		}
	};

	const config = $derived(statusConfig[status]);
</script>

<div class="flex items-center gap-2 text-xs text-surface-400">
	<span class="w-2 h-2 rounded-full {config.color}"></span>
	<span>{config.text}</span>
</div>
