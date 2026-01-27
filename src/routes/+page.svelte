<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { Timeline, BarChart, PieChart, WordCloud } from '$lib/components/charts';
	import { FilterPanel } from '$lib/components/layout';
	import {
		dashboardStats,
		projects,
		allCollections,
		artWorldCollection,
		clnckCollection
	} from '$lib/stores/data';
	import { filteredCollections } from '$lib/stores/filters';
	import {
		groupByYear,
		extractSubjects,
		extractResourceTypes,
		extractTags,
		extractResearchSections
	} from '$lib/utils/dataTransform';

	// Word cloud controls
	let wordCloudMaxWords = $state(50);

	// Derived chart data
	let timelineData = $derived(groupByYear($filteredCollections));
	let subjectsData = $derived(extractSubjects($filteredCollections));
	let resourceTypesData = $derived(extractResourceTypes($filteredCollections));
	let wordCloudData = $derived(extractTags($filteredCollections));
	let researchSectionsData = $derived(extractResearchSections($projects));
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">Dashboard Overview</h1>
		<p class="text-muted-foreground mt-1">
			Interactive visualization of WissKI research data
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			{#snippet children()}
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					{#snippet children()}
						<CardTitle class="text-sm font-medium">
							{#snippet children()}Total Projects{/snippet}
						</CardTitle>
						<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
							<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
						</svg>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="text-2xl font-bold">{$dashboardStats.totalProjects}</div>
						<p class="text-xs text-muted-foreground">Research projects</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					{#snippet children()}
						<CardTitle class="text-sm font-medium">
							{#snippet children()}Total Documents{/snippet}
						</CardTitle>
						<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
						</svg>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="text-2xl font-bold">{$dashboardStats.totalDocuments}</div>
						<p class="text-xs text-muted-foreground">Collection items</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					{#snippet children()}
						<CardTitle class="text-sm font-medium">
							{#snippet children()}ArtWorld 2019{/snippet}
						</CardTitle>
						<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<polygon points="10 8 16 12 10 16 10 8" />
						</svg>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="text-2xl font-bold">{$artWorldCollection.length}</div>
						<p class="text-xs text-muted-foreground">Items in collection</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					{#snippet children()}
						<CardTitle class="text-sm font-medium">
							{#snippet children()}CLnCK 2019{/snippet}
						</CardTitle>
						<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M9 18V5l12-2v13" />
							<circle cx="6" cy="18" r="3" />
							<circle cx="18" cy="16" r="3" />
						</svg>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="text-2xl font-bold">{$clnckCollection.length}</div>
						<p class="text-xs text-muted-foreground">Items in collection</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Filters -->
	<FilterPanel />

	<!-- Charts Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Timeline -->
		<Card class="col-span-full">
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Documents Timeline{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
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

		<!-- Resource Types Pie Chart -->
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

		<!-- Top Subjects Bar Chart -->
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Top Subjects{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if subjectsData.length > 0}
							<BarChart data={subjectsData} maxItems={8} />
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
								{#snippet children()}Tags & Subjects{/snippet}
							</CardTitle>
							<div class="flex items-center gap-4">
								<label for="home-wordcloud-slider" class="text-sm text-muted-foreground whitespace-nowrap">
									Words: {wordCloudMaxWords}
								</label>
								<input
									id="home-wordcloud-slider"
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

		<!-- Research Sections -->
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Research Sections{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[350px]">
					{#snippet children()}
						{#if researchSectionsData.length > 0}
							<BarChart data={researchSectionsData} maxItems={6} />
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
</div>
