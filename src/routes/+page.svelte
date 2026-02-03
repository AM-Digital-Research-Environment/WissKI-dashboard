<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { StackedTimeline, BarChart, PieChart, WordCloud } from '$lib/components/charts';
	import { FilterPanel } from '$lib/components/layout';
	import {
		dashboardStats,
		projects,
		allCollections,
		universitiesData
	} from '$lib/stores/data';
	import { filteredCollections } from '$lib/stores/filters';
	import {
		groupByYearAndType,
		extractSubjects,
		extractResourceTypes,
		extractTags,
		extractResearchSections,
		extractLanguages
	} from '$lib/utils/dataTransform';
	import { universities } from '$lib/types';
	import { base } from '$app/paths';
	import { FileText, Briefcase, Users, Building2, Calendar, PieChart as PieChartIcon, BarChart3, Edit3, BookOpen } from '@lucide/svelte';

	// Word cloud controls
	let wordCloudMaxWords = $state(50);

	// Derived chart data
	let stackedTimelineData = $derived(groupByYearAndType($filteredCollections));
	let subjectsData = $derived(extractSubjects($filteredCollections));
	let resourceTypesData = $derived(extractResourceTypes($filteredCollections));
	let languagesData = $derived(extractLanguages($filteredCollections));
	let wordCloudData = $derived(extractTags($filteredCollections));
	let researchSectionsData = $derived(extractResearchSections($projects));

	// Calculate unique projects from filtered collections
	let uniqueProjects = $derived(() => {
		const projectIds = new Set<string>();
		$filteredCollections.forEach((item) => {
			if (item.project?.id) projectIds.add(item.project.id);
		});
		return projectIds.size;
	});

	// Calculate unique contributors
	let uniqueContributors = $derived(() => {
		const contributors = new Set<string>();
		$filteredCollections.forEach((item) => {
			// item.name is an array of NameEntry objects
			if (Array.isArray(item.name)) {
				item.name.forEach((entry) => {
					if (entry.name?.label) contributors.add(entry.name.label);
				});
			}
		});
		return contributors.size;
	});
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="page-header animate-slide-in-up">
		<h1 class="page-title">Dashboard Overview</h1>
		<p class="page-subtitle">
			Interactive visualization of WissKI research data across collections and projects
		</p>
	</div>

	<!-- Overall Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="stat-card animate-slide-in-up delay-75">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Total Documents</p>
					<p class="stat-value mt-2">{$filteredCollections.length}</p>
					<p class="stat-label">Collection items</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<FileText class="h-5 w-5 text-primary" />
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-100">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Projects</p>
					<p class="stat-value mt-2">{uniqueProjects()}</p>
					<p class="stat-label">Research projects</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-accent/80 flex items-center justify-center">
					<Briefcase class="h-5 w-5 text-accent-foreground" />
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-150">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Contributors</p>
					<p class="stat-value mt-2">{uniqueContributors()}</p>
					<p class="stat-label">Unique names</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
					<Users class="h-5 w-5 text-chart-1" />
				</div>
			</div>
		</div>

		<div class="stat-card animate-slide-in-up delay-200">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Universities</p>
					<p class="stat-value mt-2">{universities.length}</p>
					<p class="stat-label">Partner institutions</p>
				</div>
				<div class="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
					<Building2 class="h-5 w-5 text-chart-2" />
				</div>
			</div>
		</div>
	</div>

	<!-- University Breakdown Cards -->
	<div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
		{#each $universitiesData as uniData, index}
			<div class="stat-card animate-slide-in-up" style="animation-delay: {250 + index * 50}ms">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium text-muted-foreground">{uniData.university.code}</p>
						<p class="stat-value mt-2">{uniData.count}</p>
						<p class="stat-label truncate" title={uniData.university.name}>{uniData.university.name}</p>
					</div>
					<div class="size-9 sm:size-10 rounded-lg bg-white flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
						<img
							src="{base}/{uniData.university.logo}"
							alt="{uniData.university.name} logo"
							class="h-full w-full object-contain"
						/>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Filters -->
	<div class="animate-slide-in-up delay-300">
		<FilterPanel />
	</div>

	<!-- Charts Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Timeline (Stacked by Resource Type) -->
		<Card class="col-span-full chart-card">
			{#snippet children()}
				<div class="chart-card-header">
					<h3 class="chart-card-title">Documents Timeline by Type</h3>
				</div>
				<div class="chart-card-content h-[400px]">
					{#if stackedTimelineData.length > 0}
						<StackedTimeline data={stackedTimelineData} />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<Calendar class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.5} />
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
								<PieChartIcon class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.5} />
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
								<BarChart3 class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.5} />
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
								<Edit3 class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.5} />
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
								<BookOpen class="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" strokeWidth={1.5} />
								<p>No data available</p>
							</div>
						</div>
					{/if}
				</div>
			{/snippet}
		</Card>
	</div>
</div>
