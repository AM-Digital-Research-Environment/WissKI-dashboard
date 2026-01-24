<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import {
		filters,
		resetFilters,
		toggleResourceType,
		toggleLanguage,
		activeFilterCount
	} from '$lib/stores/filters';
	import { allCollections } from '$lib/stores/data';
	import { getUniqueResourceTypes, getUniqueLanguages } from '$lib/utils/dataTransform';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	let resourceTypes = $derived(getUniqueResourceTypes($allCollections));
	let languages = $derived(getUniqueLanguages($allCollections));

	let isExpanded = $state(false);
</script>

<div class={cn('rounded-lg border bg-card p-4', className)}>
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<h3 class="font-semibold">Filters</h3>
			{#if $activeFilterCount > 0}
				<Badge variant="secondary">{$activeFilterCount}</Badge>
			{/if}
		</div>
		<div class="flex gap-2">
			{#if $activeFilterCount > 0}
				<Button variant="ghost" size="sm" onclick={() => resetFilters()}>
					{#snippet children()}Clear{/snippet}
				</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={() => isExpanded = !isExpanded}>
				{#snippet children()}
					{isExpanded ? 'Collapse' : 'Expand'}
				{/snippet}
			</Button>
		</div>
	</div>

	{#if isExpanded}
		<div class="space-y-4">
			<!-- Resource Types -->
			<div>
				<h4 class="text-sm font-medium mb-2 text-muted-foreground">Resource Type</h4>
				<div class="flex flex-wrap gap-2">
					{#each resourceTypes as type}
						<button
							type="button"
							onclick={() => toggleResourceType(type)}
							class={cn(
								'px-2 py-1 rounded-md text-xs transition-colors',
								$filters.resourceTypes.includes(type)
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
							)}
						>
							{type}
						</button>
					{/each}
				</div>
			</div>

			<!-- Languages -->
			<div>
				<h4 class="text-sm font-medium mb-2 text-muted-foreground">Language</h4>
				<div class="flex flex-wrap gap-2">
					{#each languages as lang}
						<button
							type="button"
							onclick={() => toggleLanguage(lang)}
							class={cn(
								'px-2 py-1 rounded-md text-xs transition-colors',
								$filters.languages.includes(lang)
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
							)}
						>
							{lang}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<!-- Quick filter summary -->
		<div class="flex flex-wrap gap-2">
			{#each $filters.resourceTypes as type}
				<Badge variant="outline">
					{type}
					<button
						type="button"
						class="ml-1 hover:text-destructive"
						onclick={() => toggleResourceType(type)}
					>
						×
					</button>
				</Badge>
			{/each}
			{#each $filters.languages as lang}
				<Badge variant="outline">
					{lang}
					<button
						type="button"
						class="ml-1 hover:text-destructive"
						onclick={() => toggleLanguage(lang)}
					>
						×
					</button>
				</Badge>
			{/each}
			{#if $activeFilterCount === 0}
				<span class="text-sm text-muted-foreground">No filters applied</span>
			{/if}
		</div>
	{/if}
</div>
