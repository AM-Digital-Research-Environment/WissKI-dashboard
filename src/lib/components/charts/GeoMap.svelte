<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface LocationData {
		country: string;
		region: string;
		city: string;
		count: number;
	}

	interface Props {
		data: LocationData[];
		title?: string;
		class?: string;
	}

	let { data, title = '', class: className = '' }: Props = $props();

	// Group by country for display
	let countryData = $derived(() => {
		const countryMap = new Map<string, number>();
		data.forEach((d) => {
			if (d.country) {
				countryMap.set(d.country, (countryMap.get(d.country) || 0) + d.count);
			}
		});
		return Array.from(countryMap.entries())
			.map(([country, count]) => ({ country, count }))
			.sort((a, b) => b.count - a.count);
	});

	// Get max count for scaling
	let maxCount = $derived(Math.max(...countryData().map((d) => d.count), 1));
</script>

<div class={cn('w-full h-full min-h-[300px] flex flex-col', className)}>
	{#if title}
		<h3 class="text-lg font-semibold text-center mb-4">{title}</h3>
	{/if}

	<div class="flex-1 overflow-auto">
		<div class="space-y-2">
			{#each countryData() as item}
				<div class="flex items-center gap-3">
					<div class="w-24 text-sm truncate text-right">{item.country}</div>
					<div class="flex-1 bg-muted rounded-full h-6 overflow-hidden">
						<div
							class="h-full bg-primary rounded-full transition-all duration-500"
							style="width: {(item.count / maxCount) * 100}%"
						></div>
					</div>
					<div class="w-12 text-sm text-muted-foreground">{item.count}</div>
				</div>
			{/each}
		</div>
	</div>

	{#if data.length === 0}
		<div class="flex-1 flex items-center justify-center text-muted-foreground">
			No location data available
		</div>
	{/if}
</div>
