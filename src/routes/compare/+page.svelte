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
	import { UNIVERSITY_COLLECTIONS, getUniversities } from '$lib/utils/dataLoader';
	import type { CollectionItem } from '$lib/types';

	// Get all universities
	const allUniversities = getUniversities();

	// Build university options
	const universityOptions = [
		{ value: 'all', label: 'All Universities' },
		...allUniversities.map((uni) => ({
			value: uni.id,
			label: `${uni.code} - ${uni.name}`
		}))
	];

	// Build project options for a given university
	function getProjectOptions(universityId: string) {
		if (universityId === 'all') {
			// Show all projects from all universities
			const allProjects: { value: string; label: string }[] = [
				{ value: 'all', label: 'All Projects' }
			];
			for (const uni of allUniversities) {
				const projects = UNIVERSITY_COLLECTIONS[uni.id] || [];
				for (const proj of projects) {
					allProjects.push({
						value: `${uni.id}:${proj}`,
						label: `${uni.code}: ${proj.replace(uni.code + '_', '').replace(/(\d{4})$/, ' $1')}`
					});
				}
			}
			return allProjects;
		}

		const projects = UNIVERSITY_COLLECTIONS[universityId] || [];
		const uni = allUniversities.find((u) => u.id === universityId);
		const prefix = uni?.code || universityId.toUpperCase();

		return [
			{ value: 'all', label: 'All Projects' },
			...projects.map((proj) => ({
				value: `${universityId}:${proj}`,
				label: proj.replace(prefix + '_', '').replace(/(\d{4})$/, ' $1')
			}))
		];
	}

	// Left side selection
	let leftUniversity = $state('all');
	let leftProject = $state('all');
	let leftProjectOptions = $derived(getProjectOptions(leftUniversity));

	// Right side selection
	let rightUniversity = $state(allUniversities[0]?.id || 'all');
	let rightProject = $state('all');
	let rightProjectOptions = $derived(getProjectOptions(rightUniversity));

	// Track previous values to reset project when university changes
	let prevLeftUniversity = $state('all');
	let prevRightUniversity = $state(allUniversities[0]?.id || 'all');

	$effect(() => {
		if (leftUniversity !== prevLeftUniversity) {
			prevLeftUniversity = leftUniversity;
			leftProject = 'all';
		}
	});

	$effect(() => {
		if (rightUniversity !== prevRightUniversity) {
			prevRightUniversity = rightUniversity;
			rightProject = 'all';
		}
	});

	// Get collections based on selection
	function getCollection(universityId: string, projectId: string): CollectionItem[] {
		let result = $allCollections;

		// Filter by university if not "all"
		if (universityId !== 'all') {
			result = result.filter((item) => item.university === universityId);
		}

		// Filter by project if not "all"
		if (projectId !== 'all') {
			// projectId format: "universityId:projectName"
			const [, projectName] = projectId.split(':');
			if (projectName) {
				result = result.filter(
					(item) =>
						item.project?.name?.includes(projectName.replace(/(\d{4})$/, '')) ||
						item.project?.id?.includes(projectName)
				);
			}
		}

		return result;
	}

	let leftData = $derived(getCollection(leftUniversity, leftProject));
	let rightData = $derived(getCollection(rightUniversity, rightProject));

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

	function getSelectionName(universityId: string, projectId: string): string {
		if (universityId === 'all' && projectId === 'all') {
			return 'All Collections';
		}

		const uni = allUniversities.find((u) => u.id === universityId);
		const uniName = uni?.code || 'All';

		if (projectId === 'all') {
			return `${uniName} (All Projects)`;
		}

		const [, projectName] = projectId.split(':');
		return `${uniName}: ${projectName?.replace(/(\d{4})$/, ' $1') || projectId}`;
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
						<div class="space-y-3">
							<div>
								<label class="text-sm text-muted-foreground mb-1 block">University</label>
								<Select
									options={universityOptions}
									bind:value={leftUniversity}
								/>
							</div>
							<div>
								<label class="text-sm text-muted-foreground mb-1 block">Project</label>
								<Select
									options={leftProjectOptions}
									bind:value={leftProject}
								/>
							</div>
						</div>
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
						<div class="space-y-3">
							<div>
								<label class="text-sm text-muted-foreground mb-1 block">University</label>
								<Select
									options={universityOptions}
									bind:value={rightUniversity}
								/>
							</div>
							<div>
								<label class="text-sm text-muted-foreground mb-1 block">Project</label>
								<Select
									options={rightProjectOptions}
									bind:value={rightProject}
								/>
							</div>
						</div>
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
									<p class="text-xs text-muted-foreground max-w-[120px] truncate">{getSelectionName(leftUniversity, leftProject)}</p>
								</div>
								<span class="text-muted-foreground">vs</span>
								<div>
									<div class="text-2xl font-bold text-green-500">{rightData.length}</div>
									<p class="text-xs text-muted-foreground max-w-[120px] truncate">{getSelectionName(rightUniversity, rightProject)}</p>
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
									<p class="text-xs text-muted-foreground max-w-[120px] truncate">{getSelectionName(leftUniversity, leftProject)}</p>
								</div>
								<span class="text-muted-foreground">vs</span>
								<div>
									<div class="text-2xl font-bold text-green-500">{rightResourceTypes.length}</div>
									<p class="text-xs text-muted-foreground max-w-[120px] truncate">{getSelectionName(rightUniversity, rightProject)}</p>
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
							{#snippet children()}{getSelectionName(leftUniversity, leftProject)} Timeline{/snippet}
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
							{#snippet children()}{getSelectionName(rightUniversity, rightProject)} Timeline{/snippet}
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
							{#snippet children()}{getSelectionName(leftUniversity, leftProject)} Resource Types{/snippet}
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
							{#snippet children()}{getSelectionName(rightUniversity, rightProject)} Resource Types{/snippet}
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
							{#snippet children()}{getSelectionName(leftUniversity, leftProject)} Top Subjects{/snippet}
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
							{#snippet children()}{getSelectionName(rightUniversity, rightProject)} Top Subjects{/snippet}
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
							{#snippet children()}{getSelectionName(leftUniversity, leftProject)} Languages{/snippet}
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
							{#snippet children()}{getSelectionName(rightUniversity, rightProject)} Languages{/snippet}
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
