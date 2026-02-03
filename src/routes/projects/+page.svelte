<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Badge, Input } from '$lib/components/ui';
	import { BarChart, Timeline } from '$lib/components/charts';
	import { projects } from '$lib/stores/data';
	import {
		groupProjectsByYear,
		extractResearchSections,
		extractInstitutions
	} from '$lib/utils/dataTransform';
	import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';

	let searchQuery = $state('');

	// Facet filters
	let selectedResearchSections = $state<string[]>([]);
	let selectedInstitutions = $state<string[]>([]);

	// Pagination
	let currentPage = $state(0);
	const itemsPerPage = 10;

	// Get unique values for facets
	let allResearchSections = $derived(() => {
		const sections = new Set<string>();
		$projects.forEach((p) => p.researchSection?.forEach((s) => sections.add(s)));
		return Array.from(sections).sort();
	});

	let allInstitutions = $derived(() => {
		const institutions = new Set<string>();
		$projects.forEach((p) => p.institutions?.forEach((i) => institutions.add(i)));
		return Array.from(institutions).sort();
	});

	let filteredProjects = $derived(
		$projects.filter((p) => {
			// Text search
			const matchesSearch =
				searchQuery === '' ||
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.locale.toLowerCase().includes(searchQuery.toLowerCase());

			// Research section filter
			const matchesSection =
				selectedResearchSections.length === 0 ||
				p.researchSection?.some((s) => selectedResearchSections.includes(s));

			// Institution filter
			const matchesInstitution =
				selectedInstitutions.length === 0 ||
				p.institutions?.some((i) => selectedInstitutions.includes(i));

			return matchesSearch && matchesSection && matchesInstitution;
		})
	);

	// Paginated projects
	let totalPages = $derived(Math.ceil(filteredProjects.length / itemsPerPage));
	let paginatedProjects = $derived(
		filteredProjects.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
	);

	// Reset page when filters change
	$effect(() => {
		searchQuery;
		selectedResearchSections;
		selectedInstitutions;
		currentPage = 0;
	});

	let timelineData = $derived(groupProjectsByYear($projects));
	let researchSectionsData = $derived(extractResearchSections($projects));
	let institutionsData = $derived(extractInstitutions($projects));

	function formatDate(date: Date | null): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString();
	}

	function toggleResearchSection(section: string) {
		if (selectedResearchSections.includes(section)) {
			selectedResearchSections = selectedResearchSections.filter((s) => s !== section);
		} else {
			selectedResearchSections = [...selectedResearchSections, section];
		}
	}

	function toggleInstitution(institution: string) {
		if (selectedInstitutions.includes(institution)) {
			selectedInstitutions = selectedInstitutions.filter((i) => i !== institution);
		} else {
			selectedInstitutions = [...selectedInstitutions, institution];
		}
	}

	function clearAllFilters() {
		searchQuery = '';
		selectedResearchSections = [];
		selectedInstitutions = [];
	}

	let hasActiveFilters = $derived(
		searchQuery !== '' || selectedResearchSections.length > 0 || selectedInstitutions.length > 0
	);
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">Projects</h1>
		<p class="text-muted-foreground mt-1">
			Browse and explore research projects
		</p>
	</div>

	<!-- Stats -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-2xl font-bold">{$projects.length}</div>
						<p class="text-sm text-muted-foreground">Total Projects</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-2xl font-bold">{researchSectionsData.length}</div>
						<p class="text-sm text-muted-foreground">Research Sections</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<Card>
			{#snippet children()}
				<CardContent class="pt-6">
					{#snippet children()}
						<div class="text-2xl font-bold">{institutionsData.length}</div>
						<p class="text-sm text-muted-foreground">Institutions</p>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>

	<!-- Charts -->
	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Projects by Year{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if timelineData.length > 0}
							<Timeline data={timelineData} />
						{:else}
							<div class="h-full flex items-center justify-center text-muted-foreground">
								No data available
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
							{#snippet children()}Research Sections{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
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

		<Card class="lg:col-span-2">
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}Top Institutions{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if institutionsData.length > 0}
							<BarChart data={institutionsData} maxItems={10} />
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

	<!-- Projects List with Facets -->
	<div class="grid gap-6 lg:grid-cols-4">
		<!-- Facets Sidebar -->
		<Card class="lg:col-span-1">
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<div class="flex items-center justify-between">
							<CardTitle>
								{#snippet children()}Filters{/snippet}
							</CardTitle>
							{#if hasActiveFilters}
								<button
									onclick={clearAllFilters}
									class="text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									Clear all
								</button>
							{/if}
						</div>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<div class="space-y-6">
							<!-- Search -->
							<div>
								<label class="text-sm font-medium mb-2 block">Search</label>
								<Input placeholder="Search projects..." bind:value={searchQuery} />
							</div>

							<!-- Research Section Facet -->
							<div>
								<label class="text-sm font-medium mb-2 block">Research Section</label>
								<div class="space-y-1 max-h-48 overflow-y-auto">
									{#each allResearchSections() as section}
									{@const isSelected = selectedResearchSections.includes(section)}
										<button
											onclick={() => toggleResearchSection(section)}
											class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between gap-2 {isSelected ? 'bg-primary/10 text-primary' : ''}"
										>
											<span class="truncate">{section}</span>
											{#if isSelected}
												<X class="h-3 w-3 flex-shrink-0" />
											{/if}
										</button>
									{/each}
								</div>
							</div>

							<!-- Institution Facet -->
							<div>
								<label class="text-sm font-medium mb-2 block">Institution</label>
								<div class="space-y-1 max-h-48 overflow-y-auto">
									{#each allInstitutions() as institution}
									{@const isSelected = selectedInstitutions.includes(institution)}
										<button
											onclick={() => toggleInstitution(institution)}
											class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between gap-2 {isSelected ? 'bg-primary/10 text-primary' : ''}"
										>
											<span class="truncate">{institution}</span>
											{#if isSelected}
												<X class="h-3 w-3 flex-shrink-0" />
											{/if}
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>

		<!-- Projects List -->
		<Card class="lg:col-span-3">
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<div class="flex items-center justify-between">
							<CardTitle>
								{#snippet children()}
									Projects
									<span class="text-muted-foreground font-normal text-base ml-2">
										({filteredProjects.length} results)
									</span>
								{/snippet}
							</CardTitle>
						</div>
					{/snippet}
				</CardHeader>
				<CardContent>
					{#snippet children()}
						<!-- Active filters display -->
						{#if hasActiveFilters}
							<div class="flex flex-wrap gap-2 mb-4">
								{#each selectedResearchSections as section}
									<Badge variant="secondary" class="gap-1">
										{section}
										<button onclick={() => toggleResearchSection(section)} class="hover:text-destructive">
											<X class="h-3 w-3" />
										</button>
									</Badge>
								{/each}
								{#each selectedInstitutions as institution}
									<Badge variant="outline" class="gap-1">
										{institution}
										<button onclick={() => toggleInstitution(institution)} class="hover:text-destructive">
											<X class="h-3 w-3" />
										</button>
									</Badge>
								{/each}
							</div>
						{/if}

						<div class="space-y-4">
							{#each paginatedProjects as project}
								<div class="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium">{project.name}</h4>
											<p class="text-sm text-muted-foreground mt-1">
												{project.id} • {project.locale}
											</p>
											<div class="flex flex-wrap gap-2 mt-2">
												{#each project.researchSection || [] as section}
													<Badge variant="secondary">{section}</Badge>
												{/each}
											</div>
											{#if project.pi && project.pi.length > 0}
												<p class="text-sm text-muted-foreground mt-2">
													PI: {project.pi.join(', ')}
												</p>
											{/if}
										</div>
										<div class="text-right text-sm text-muted-foreground">
											<p>{formatDate(project.date?.start)} - {formatDate(project.date?.end)}</p>
										</div>
									</div>
								</div>
							{/each}
							{#if filteredProjects.length === 0}
								<div class="text-center py-8 text-muted-foreground">
									No projects found matching your filters
								</div>
							{/if}
						</div>

						<!-- Pagination -->
						{#if totalPages > 1}
							<div class="flex items-center justify-between mt-6 pt-4 border-t">
								<p class="text-sm text-muted-foreground">
									Showing {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, filteredProjects.length)} of {filteredProjects.length}
								</p>
								<div class="flex items-center gap-2">
									<button
										onclick={() => currentPage--}
										disabled={currentPage === 0}
										class="p-2 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
										aria-label="Previous page"
									>
										<ChevronLeft class="h-4 w-4" />
									</button>

									<span class="text-sm text-muted-foreground min-w-[80px] text-center">
										{currentPage + 1} / {totalPages}
									</span>

									<button
										onclick={() => currentPage++}
										disabled={currentPage === totalPages - 1}
										class="p-2 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
										aria-label="Next page"
									>
										<ChevronRight class="h-4 w-4" />
									</button>
								</div>
							</div>
						{/if}
					{/snippet}
				</CardContent>
			{/snippet}
		</Card>
	</div>
</div>
