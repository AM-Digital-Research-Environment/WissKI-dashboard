<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from '$lib/components/ui';
	import { Timeline, BarChart, PieChart, WordCloud, GeoMap } from '$lib/components/charts';
	import { artWorldCollection, clnckCollection } from '$lib/stores/data';
	import {
		groupByYear,
		extractSubjects,
		extractResourceTypes,
		extractTags,
		extractLocations,
		extractLanguages,
		countOccurrences
	} from '$lib/utils/dataTransform';
	import type { CollectionItem } from '$lib/types';

	const tabs = [
		{ id: 'all', label: 'All Collections' },
		{ id: 'artworld', label: 'ArtWorld 2019' },
		{ id: 'clnck', label: 'CLnCK 2019' }
	];

	let activeTab = $state('all');

	// Get current collection based on active tab
	let currentCollection = $derived<CollectionItem[]>(
		activeTab === 'artworld'
			? $artWorldCollection
			: activeTab === 'clnck'
				? $clnckCollection
				: [...$artWorldCollection, ...$clnckCollection]
	);

	// Derived chart data
	let timelineData = $derived(groupByYear(currentCollection));
	let subjectsData = $derived(extractSubjects(currentCollection));
	let resourceTypesData = $derived(extractResourceTypes(currentCollection));
	let wordCloudData = $derived(extractTags(currentCollection));
	let locationsData = $derived(extractLocations(currentCollection));
	let languagesData = $derived(extractLanguages(currentCollection));

	// Extract contributors
	let contributorsData = $derived(
		countOccurrences(currentCollection, (item) =>
			item.name?.map((n) => n.name?.label).filter(Boolean)
		)
	);

	function handleTabChange(tabId: string) {
		activeTab = tabId;
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">Collections</h1>
		<p class="text-muted-foreground mt-1">
			Browse UBT collection metadata and visualizations
		</p>
	</div>

	<!-- Collection Tabs -->
	<Tabs {tabs} {activeTab} onTabChange={handleTabChange}>
		{#snippet children(tab)}
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
						<CardContent class="h-[300px]">
							{#snippet children()}
								{#if timelineData.length > 0}
									<Timeline data={timelineData} />
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
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Subject Word Cloud{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[350px]">
							{#snippet children()}
								{#if wordCloudData.length > 0}
									<WordCloud data={wordCloudData} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<!-- Geographic Origins -->
				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Geographic Origins{/snippet}
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
		{/snippet}
	</Tabs>
</div>
