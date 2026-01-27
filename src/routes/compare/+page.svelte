<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Select, Badge } from '$lib/components/ui';
	import { Timeline, BarChart, PieChart } from '$lib/components/charts';
	import { allCollections } from '$lib/stores/data';
	import {
		groupByYear,
		extractSubjects,
		extractResourceTypes,
		extractLanguages
	} from '$lib/utils/dataTransform';
	import { getUBTCollectionNames } from '$lib/utils/dataLoader';
	import type { CollectionItem } from '$lib/types';

	// Build collection options dynamically from UBT collection names
	const ubtNames = getUBTCollectionNames();
	const collectionOptions = [
		{ value: 'all', label: 'All Collections' },
		...ubtNames.map(name => ({
			value: name,
			label: name.replace('UBT_', '').replace(/(\d{4})$/, ' $1')
		}))
	];

	let leftCollection = $state('all');
	let rightCollection = $state(ubtNames[0] || 'all');

	// Get collections based on selection - filter from allCollections
	function getCollection(id: string): CollectionItem[] {
		if (id === 'all') return $allCollections;
		// Filter by project name containing the collection identifier
		const searchTerm = id.replace('UBT_', '');
		return $allCollections.filter(item =>
			item.project?.name?.includes(searchTerm) ||
			item.project?.id?.includes(id)
		);
	}

	let leftData = $derived(getCollection(leftCollection));
	let rightData = $derived(getCollection(rightCollection));

	// Derived chart data for left
	let leftTimeline = $derived(groupByYear(leftData));
	let leftSubjects = $derived(extractSubjects(leftData));
	let leftResourceTypes = $derived(extractResourceTypes(leftData));
	let leftLanguages = $derived(extractLanguages(leftData));

	// Derived chart data for right
	let rightTimeline = $derived(groupByYear(rightData));
	let rightSubjects = $derived(extractSubjects(rightData));
	let rightResourceTypes = $derived(extractResourceTypes(rightData));
	let rightLanguages = $derived(extractLanguages(rightData));

	// Calculate subject overlap
	let subjectOverlap = $derived(() => {
		const leftSet = new Set(leftSubjects.map((s) => s.name));
		const rightSet = new Set(rightSubjects.map((s) => s.name));
		const intersection = new Set([...leftSet].filter((x) => rightSet.has(x)));
		const union = new Set([...leftSet, ...rightSet]);
		return {
			overlap: intersection.size,
			total: union.size,
			percentage: union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0,
			shared: Array.from(intersection).slice(0, 10)
		};
	});

	function getCollectionName(id: string): string {
		return collectionOptions.find((o) => o.value === id)?.label || id;
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">Compare Collections</h1>
		<p class="text-muted-foreground mt-1">
			Side-by-side comparison of different collections
		</p>
	</div>

	<!-- Collection Selectors -->
	<div class="grid gap-4 md:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader class="pb-3">
					{#snippet children()}
						<CardTitle class="text-lg">
							{#snippet children()}Left Collection{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<Select
							options={collectionOptions}
							bind:value={leftCollection}
						/>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader class="pb-3">
					{#snippet children()}
						<CardTitle class="text-lg">
							{#snippet children()}Right Collection{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<Select
							options={collectionOptions}
							bind:value={rightCollection}
						/>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Stats Comparison -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-2">Total Items</p>
							<div class="flex items-center justify-center gap-4">
								<div>
									<div class="text-2xl font-bold text-blue-500">{leftData.length}</div>
									<p class="text-xs text-muted-foreground">{getCollectionName(leftCollection)}</p>
								</div>
								<span class="text-muted-foreground">vs</span>
								<div>
									<div class="text-2xl font-bold text-green-500">{rightData.length}</div>
									<p class="text-xs text-muted-foreground">{getCollectionName(rightCollection)}</p>
								</div>
							</div>
						</div>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-2">Resource Types</p>
							<div class="flex items-center justify-center gap-4">
								<div>
									<div class="text-2xl font-bold text-blue-500">{leftResourceTypes.length}</div>
									<p class="text-xs text-muted-foreground">{getCollectionName(leftCollection)}</p>
								</div>
								<span class="text-muted-foreground">vs</span>
								<div>
									<div class="text-2xl font-bold text-green-500">{rightResourceTypes.length}</div>
									<p class="text-xs text-muted-foreground">{getCollectionName(rightCollection)}</p>
								</div>
							</div>
						</div>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-2">Subject Overlap</p>
							<div class="text-3xl font-bold text-primary">{subjectOverlap().percentage}%</div>
							<p class="text-xs text-muted-foreground">
								{subjectOverlap().overlap} shared of {subjectOverlap().total} total
							</p>
						</div>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Shared Subjects -->
	{#if subjectOverlap().shared.length > 0}
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Shared Subjects{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="flex flex-wrap gap-2">
							{#each subjectOverlap().shared as subject}
								<Badge variant="secondary">{subject}</Badge>
							{/each}
						</div>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	{/if}

	<!-- Timeline Comparison -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(leftCollection)} Timeline{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if leftTimeline.length > 0}
							<Timeline data={leftTimeline} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No timeline data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(rightCollection)} Timeline{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if rightTimeline.length > 0}
							<Timeline data={rightTimeline} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No timeline data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Resource Types Comparison -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(leftCollection)} Resource Types{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if leftResourceTypes.length > 0}
							<PieChart data={leftResourceTypes} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(rightCollection)} Resource Types{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if rightResourceTypes.length > 0}
							<PieChart data={rightResourceTypes} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Top Subjects Comparison -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(leftCollection)} Top Subjects{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if leftSubjects.length > 0}
							<BarChart data={leftSubjects} maxItems={8} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(rightCollection)} Top Subjects{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if rightSubjects.length > 0}
							<BarChart data={rightSubjects} maxItems={8} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Languages Comparison -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(leftCollection)} Languages{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if leftLanguages.length > 0}
							<BarChart data={leftLanguages} maxItems={6} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}{getCollectionName(rightCollection)} Languages{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if rightLanguages.length > 0}
							<BarChart data={rightLanguages} maxItems={6} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>
</div>
