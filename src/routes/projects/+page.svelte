<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Badge, Input } from '$lib/components/ui';
	import { BarChart, Timeline } from '$lib/components/charts';
	import { projects } from '$lib/stores/data';
	import {
		groupProjectsByYear,
		extractResearchSections,
		extractLocales,
		extractInstitutions
	} from '$lib/utils/dataTransform';

	let searchQuery = $state('');

	let filteredProjects = $derived(
		$projects.filter(
			(p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.locale.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let timelineData = $derived(groupProjectsByYear($projects));
	let researchSectionsData = $derived(extractResearchSections($projects));
	let localesData = $derived(extractLocales($projects));
	let institutionsData = $derived(extractInstitutions($projects));

	function formatDate(date: Date | null): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString();
	}
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
	<div class="grid gap-4 md:grid-cols-4">
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
						<div class="text-2xl font-bold">{localesData.length}</div>
						<p class="text-sm text-muted-foreground">Locales</p>
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

		<Card>
			{#snippet children()}
				<CardHeader>
					{#snippet children()}
						<CardTitle>
							{#snippet children()}By Locale{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if localesData.length > 0}
							<BarChart data={localesData} maxItems={8} />
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
							{#snippet children()}Top Institutions{/snippet}
						</CardTitle>
					{/snippet}
				</CardHeader>
				<CardContent class="h-[300px]">
					{#snippet children()}
						{#if institutionsData.length > 0}
							<BarChart data={institutionsData} maxItems={6} />
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

	<!-- Projects List -->
	<Card>
		{#snippet children()}
			<CardHeader>
				{#snippet children()}
					<div class="flex items-center justify-between">
						<CardTitle>
							{#snippet children()}Projects List{/snippet}
						</CardTitle>
						<div class="w-64">
							<Input
								placeholder="Search projects..."
								bind:value={searchQuery}
							/>
						</div>
					</div>
				{/snippet}
			</CardHeader>
			<CardContent>
				{#snippet children()}
					<div class="space-y-4">
						{#each filteredProjects as project}
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
								No projects found matching "{searchQuery}"
							</div>
						{/if}
					</div>
				{/snippet}
			</CardContent>
		{/snippet}
	</Card>
</div>
