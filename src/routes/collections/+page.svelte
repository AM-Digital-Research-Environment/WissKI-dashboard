<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { Card, CardHeader, CardTitle, CardContent, Badge, Select } from '$lib/components/ui';
	import { StackedTimeline, BarChart, PieChart, WordCloud, GeoMap, LocationMap, SankeyChart, SunburstChart } from '$lib/components/charts';
	import { allCollections } from '$lib/stores/data';
	import {
		groupByYearAndType,
		extractSubjects,
		extractResourceTypes,
		extractTags,
		extractLocations,
		extractLanguages,
		countOccurrences,
		buildSankeyData,
		buildSunburstData
	} from '$lib/utils/dataTransform';
	import { loadEnrichedLocations, UNIVERSITY_COLLECTIONS } from '$lib/utils/dataLoader';
	import { universities } from '$lib/types';
	import type { CollectionItem, EnrichedLocationsData } from '$lib/types';

	// Enriched location data for the map
	let enrichedLocations = $state<EnrichedLocationsData | null>(null);

	onMount(async () => {
		console.log('Collections: Loading enriched locations...');
		enrichedLocations = await loadEnrichedLocations(base);
		console.log('Collections: Enriched locations loaded:', enrichedLocations ? 'yes' : 'no');
		if (enrichedLocations) {
			console.log('Collections: Countries:', Object.keys(enrichedLocations.countries).length);
			console.log('Collections: Cities:', Object.keys(enrichedLocations.cities).length);
		}
	});

	// Build a map of project IDs to full project names from the data
	let projectNameMap = $derived(
		$allCollections.reduce((acc, item) => {
			if (item.project?.id && item.project?.name) {
				acc[item.project.id] = item.project.name;
			}
			return acc;
		}, {} as Record<string, string>)
	);

	// Format collection ID to readable label (e.g., "UBT_ArtWorld2019" -> "ArtWorld 2019")
	function formatCollectionLabel(name: string): string {
		return name
			.replace(/^(UBT|ULG|UJKZ|UFB)_/, '') // Remove university prefix
			.replace(/(\d{4})$/, ' $1'); // Add space before year
	}

	// Build grouped and sorted collection options
	let collectionGroups = $derived(
		universities.map(uni => ({
			label: uni.name,
			options: (UNIVERSITY_COLLECTIONS[uni.id] || [])
				.map(name => ({
					value: name,
					label: formatCollectionLabel(name),
					title: projectNameMap[name] || name
				}))
				.sort((a, b) => a.label.localeCompare(b.label))
		})).filter(group => group.options.length > 0)
	);

	let selectedCollection = $state('all');
	let wordCloudMaxWords = $state(50);

	// Get current collection based on selection
	function getFilteredCollection(id: string): CollectionItem[] {
		if (id === 'all') return $allCollections;
		return $allCollections.filter(item => item.project?.id === id);
	}

	let currentCollection = $derived<CollectionItem[]>(getFilteredCollection(selectedCollection));

	// Derived chart data
	let timelineData = $derived(groupByYearAndType(currentCollection));
	let subjectsData = $derived(extractSubjects(currentCollection));
	let resourceTypesData = $derived(extractResourceTypes(currentCollection));
	let wordCloudData = $derived(extractTags(currentCollection));
	let locationsData = $derived(extractLocations(currentCollection));
	let languagesData = $derived(extractLanguages(currentCollection));

	// Extract contributors (handle cases where name might not be an array)
	let contributorsData = $derived(
		countOccurrences(currentCollection, (item) => {
			if (!item.name || !Array.isArray(item.name)) return null;
			return item.name.map((n) => n.name?.label).filter(Boolean);
		})
	);

	// Sankey and Sunburst data
	let sankeyData = $derived(buildSankeyData(currentCollection));
	let sunburstData = $derived(buildSunburstData(currentCollection));

</script>

<div class="space-y-6">
	<!-- Page Header with Collection Selector -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div class="flex-1 min-w-0">
			<h1 class="text-3xl font-bold">Collections</h1>
			{#if selectedCollection !== 'all' && projectNameMap[selectedCollection]}
				<p class="text-muted-foreground mt-1 line-clamp-2">
					{projectNameMap[selectedCollection]}
				</p>
			{:else}
				<p class="text-muted-foreground mt-1">
					Browse collection metadata and visualizations
				</p>
			{/if}
		</div>
		<div class="w-full sm:w-64 flex-shrink-0">
			<Select
				options={[{ value: 'all', label: 'All Collections' }]}
				groups={collectionGroups}
				bind:value={selectedCollection}
				placeholder="Select collection..."
			/>
		</div>
	</div>

	<!-- Stats Cards -->
			<div class="grid gap-4 md:grid-cols-4 mb-6">
				<Card>
					{#snippet children()}
						<CardContent class="pt-6">
							{#snippet children()}
								<div class="text-2xl font-bold">{currentCollection.length}</div>
								<p class="text-sm text-muted-foreground">Total Items</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card>
					{#snippet children()}
						<CardContent class="pt-6">
							{#snippet children()}
								<div class="text-2xl font-bold">{resourceTypesData.length}</div>
								<p class="text-sm text-muted-foreground">Resource Types</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card>
					{#snippet children()}
						<CardContent class="pt-6">
							{#snippet children()}
								<div class="text-2xl font-bold">{contributorsData.length}</div>
								<p class="text-sm text-muted-foreground">Contributors</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card>
					{#snippet children()}
						<CardContent class="pt-6">
							{#snippet children()}
								<div class="text-2xl font-bold">{locationsData.length}</div>
								<p class="text-sm text-muted-foreground">Locations</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>
			</div>

			<!-- Charts Grid -->
			<div class="grid gap-6 lg:grid-cols-2">
				<!-- Timeline -->
				<Card class="col-span-full">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Items by Year{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[420px]">
							{#snippet children()}
								{#if timelineData.length > 0}
									<StackedTimeline data={timelineData} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No timeline data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Resource Types -->
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Resource Types{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[350px]">
							{#snippet children()}
								{#if resourceTypesData.length > 0}
									<PieChart data={resourceTypesData} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Word Cloud -->
				<Card class="col-span-full">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<CardTitle>
										{#snippet children()}Subject Word Cloud{/snippet}
									</CardTitle>
									<div class="flex items-center gap-4">
										<label for="wordcloud-slider" class="text-sm text-muted-foreground whitespace-nowrap">
											Words: {wordCloudMaxWords}
										</label>
										<input
											id="wordcloud-slider"
											type="range"
											min="20"
											max="200"
											step="10"
											bind:value={wordCloudMaxWords}
											class="w-32 sm:w-48 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
										/>
									</div>
								</div>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[450px]">
							{#snippet children()}
								{#if wordCloudData.length > 0}
									<WordCloud data={wordCloudData} maxWords={wordCloudMaxWords} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Geographic Origins Map -->
				<Card class="col-span-full overflow-visible">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Geographic Origins (Map){/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[500px] overflow-visible">
							{#snippet children()}
								<LocationMap data={locationsData} items={currentCollection} {enrichedLocations} />
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Geographic Origins Bar Chart -->
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Geographic Origins (Chart){/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[350px]">
							{#snippet children()}
								<GeoMap data={locationsData} />
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Languages -->
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Languages{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[350px]">
							{#snippet children()}
								{#if languagesData.length > 0}
									<BarChart data={languagesData} maxItems={10} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Top Contributors -->
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Top Contributors{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[350px]">
							{#snippet children()}
								{#if contributorsData.length > 0}
									<BarChart data={contributorsData} maxItems={10} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Top Subjects -->
				<Card class="col-span-full">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Top Subjects{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[300px]">
							{#snippet children()}
								{#if subjectsData.length > 0}
									<BarChart data={subjectsData} maxItems={15} horizontal={false} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Sankey Diagram -->
				<Card class="col-span-full">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Contributor → Project → Resource Type Flow{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[450px]">
							{#snippet children()}
								{#if sankeyData.links.length > 0}
									<SankeyChart nodes={sankeyData.nodes} links={sankeyData.links} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No flow data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Sunburst Chart -->
				<Card class="col-span-full">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Resource Type → Language → Subject Hierarchy{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[500px]">
							{#snippet children()}
								{#if sunburstData.length > 0}
									<SunburstChart data={sunburstData} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No hierarchy data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>
			</div>

			<!-- Recent Items -->
			<Card class="mt-6">
				{#snippet children()}
					<CardHeader>
						{#snippet children()}
							<CardTitle>
								{#snippet children()}Recent Items{/snippet}
							</CardTitle>
						{/snippet}
					</CardHeader>
					<CardContent>
						{#snippet children()}
							<div class="space-y-4">
								{#each currentCollection.slice(0, 10) as item}
									<div class="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium truncate">
												{item.titleInfo?.[0]?.title || 'Untitled'}
											</h4>
											<p class="text-sm text-muted-foreground truncate">
												{item.project?.name || 'No project'}
											</p>
											<div class="flex flex-wrap gap-1 mt-2">
												<Badge variant="secondary">{item.typeOfResource || 'Unknown'}</Badge>
												{#each item.language?.slice(0, 2) || [] as lang}
													<Badge variant="outline">{lang}</Badge>
												{/each}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/snippet}
					</CardContent>
				{/snippet}
			</Card>
</div>
