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

<div class="space-y-8">
	<!-- Page Header -->
	<div class="page-header animate-slide-in-up">
		<h1 class="page-title">Dashboard Overview</h1>
		<p class="page-subtitle">
			Interactive visualization of WissKI research data across collections and projects
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="stat-card animate-slide-in-up delay-75">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Total Projects</p>
					<p class="stat-value mt-2">{$dashboardStats.totalProjects}</p>
					<p class="stat-label">Research projects</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
						<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
					</svg>
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-100">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Total Documents</p>
					<p class="stat-value mt-2">{$dashboardStats.totalDocuments}</p>
					<p class="stat-label">Collection items</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-accent/80 flex items-center justify-center">
					<svg class="h-5 w-5 text-accent-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
					</svg>
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-150">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">ArtWorld 2019</p>
					<p class="stat-value mt-2">{$artWorldCollection.length}</p>
					<p class="stat-label">Items in collection</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
					<svg class="h-5 w-5 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<polygon points="10 8 16 12 10 16 10 8" />
					</svg>
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-200">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">CLnCK 2019</p>
					<p class="stat-value mt-2">{$clnckCollection.length}</p>
					<p class="stat-label">Items in collection</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
					<svg class="h-5 w-5 text-chart-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 18V5l12-2v13" />
						<circle cx="6" cy="18" r="3" />
						<circle cx="18" cy="16" r="3" />
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="animate-slide-in-up delay-300">
		<FilterPanel />
	</div>

	<!-- Charts Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Timeline -->
		<Card class="col-span-full chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Documents Timeline</h3>
				</div>
				<div class="chart-card-content h-[350px]">
					{#if timelineData.length > 0}
						<Timeline data={timelineData} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<svg class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
									<line x1="16" y1="2" x2="16" y2="6" />
									<line x1="8" y1="2" x2="8" y2="6" />
									<line x1="3" y1="10" x2="21" y2="10" />
								</svg>
								<p>No timeline data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>

		<!-- Resource Types Pie Chart -->
		<Card class="chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Resource Types</h3>
				</div>
				<div class="chart-card-content h-[350px]">
					{#if resourceTypesData.length > 0}
						<PieChart data={resourceTypesData} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<svg class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
									<path d="M22 12A10 10 0 0 0 12 2v10z" />
								</svg>
								<p>No data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>

		<!-- Top Subjects Bar Chart -->
		<Card class="chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Top Subjects</h3>
				</div>
				<div class="chart-card-content h-[350px]">
					{#if subjectsData.length > 0}
						<BarChart data={subjectsData} maxItems={8} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<svg class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<line x1="18" y1="20" x2="18" y2="10" />
									<line x1="12" y1="20" x2="12" y2="4" />
									<line x1="6" y1="20" x2="6" y2="14" />
								</svg>
								<p>No data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>

		<!-- Word Cloud -->
		<Card class="col-span-full chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Tags & Subjects</h3>
					<div class="flex items-center gap-4">
						<label for="home-wordcloud-slider" class="text-sm text-muted-foreground whitespace-nowrap">
							Words: <span class="font-medium text-foreground">{wordCloudMaxWords}</span>
						</label>
						<input
							id="home-wordcloud-slider"
							type="range"
							min="20"
							max="200"
							step="10"
							bind:value={wordCloudMaxWords}
							class="w-32 sm:w-48 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
						/>
					</div>
				</div>
				<div class="chart-card-content h-[450px]">
					{#if wordCloudData.length > 0}
						<WordCloud data={wordCloudData} maxWords={wordCloudMaxWords} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<svg class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
								</svg>
								<p>No data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>

		<!-- Research Sections -->
		<Card class="chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Research Sections</h3>
				</div>
				<div class="chart-card-content h-[350px]">
					{#if researchSectionsData.length > 0}
						<BarChart data={researchSectionsData} maxItems={6} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<svg class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
									<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
								</svg>
								<p>No data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>
	</div>
</div>
