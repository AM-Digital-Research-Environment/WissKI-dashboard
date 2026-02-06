<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Component } from 'svelte';

	interface Props {
		value: string | number;
		label: string;
		icon?: Component;
		iconBgClass?: string;
		class?: string;
		animationDelay?: string;
	}

	let {
		value,
		label,
		icon,
		iconBgClass = 'bg-primary/10',
		class: className = '',
		animationDelay
	}: Props = $props();
</script>

<div
	class={cn('stat-card animate-slide-in-up', className)}
	style={animationDelay ? `animation-delay: ${animationDelay}` : undefined}
>
	<div class="flex items-start justify-between">
		<div>
			<p class="text-sm font-medium text-muted-foreground">{label}</p>
			<p class="stat-value mt-2">{value}</p>
		</div>
		{#if icon}
			{@const Icon = icon}
			<div class={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconBgClass)}>
				<Icon class="h-5 w-5" />
			</div>
		{/if}
	</div>
</div>
