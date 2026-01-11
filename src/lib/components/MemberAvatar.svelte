<script lang="ts">
	interface Props {
		name: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { name, size = 'md' }: Props = $props();

	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	// Generate consistent color from name
	const colors = [
		'bg-primary-500',
		'bg-secondary-500',
		'bg-tertiary-500',
		'bg-success-500',
		'bg-warning-500',
		'bg-error-500'
	];
	const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
	const bgColor = colors[colorIndex];

	const sizeClasses = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base'
	};
</script>

<div
	class="rounded-full {bgColor} {sizeClasses[size]} flex items-center justify-center font-medium text-white"
	title={name}
>
	{initials}
</div>
