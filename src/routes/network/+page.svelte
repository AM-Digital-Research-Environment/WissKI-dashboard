<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Tabs, Select } from '$lib/components/ui';
	import { NetworkGraph } from '$lib/components/charts';
	import { allCollections, persons, projects } from '$lib/stores/data';
	import { buildContributorNetwork, buildPersonInstitutionNetwork, buildInstitutionCollaborationNetwork } from '$lib/utils/dataTransform';
	import { universities } from '$lib/types';
	import type { CollectionItem } from '$lib/types';

	const tabs = [
		{ id: 'contributors', label: 'Contributors' },
		{ id: 'affiliations', label: 'Affiliations' },
		{ id: 'institutions', label: 'Institution Collaborations' }
	];

	let activeTab = $state('contributors');

	// Filters
	let selectedUniversity = $state('all');
	let maxNodes = $state(100);
	let selectedResourceType = $state('all');

	// University options
	const universityOptions = [
		{ value: 'all', label: 'All Universities' },
		...universities.map((uni) => ({ value: uni.id, label: `${uni.code} - ${uni.name}` }))
	];

	// Get unique resource types from all collections
	let resourceTypeOptions = $derived.by(() => {
		const types = new Set<string>();
		$allCollections.forEach((item) => {
			if (item.typeOfResource) types.add(item.typeOfResource);
		});
		return [
			{ value: 'all', label: 'All Resource Types' },
			...Array.from(types).sort().map((t) => ({ value: t, label: t }))
		];
	});

	// Filtered collections based on facets
	let filteredCollections = $derived.by(() => {
		let result: CollectionItem[] = $allCollections;

		if (selectedUniversity !== 'all') {
			result = result.filter((item) => item.university === selectedUniversity);
		}

		if (selectedResourceType !== 'all') {
			result = result.filter((item) => item.typeOfResource === selectedResourceType);
		}

		return result;
	});

	let contributorNetwork = $derived(buildContributorNetwork(filteredCollections, maxNodes));
	let affiliationNetwork = $derived(buildPersonInstitutionNetwork($persons, 50));
	let institutionNetwork = $derived(buildInstitutionCollaborationNetwork($projects, $persons, maxNodes));

	function handleTabChange(tabId: string) {
		activeTab = tabId;
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">Network</h1>
		<p class="text-muted-foreground mt-1">
			Explore relationships between contributors, projects, and institutions
		</p>
	</div>

	<!-- Filters -->
	<Card>
		{#snippet children()}
			<CardContent class="pt-6">
				{#snippet children()}
					<div class="flex flex-wrap items-end gap-4">
						<div class="w-48">
							<span class="text-sm text-muted-foreground mb-1 block">University</span>
							<Select
								options={universityOptions}
								bind:value={selectedUniversity}
								placeholder="Select university"
							/>
						</div>

						<div class="w-48">
							<span class="text-sm text-muted-foreground mb-1 block">Resource Type</span>
							<Select
								options={resourceTypeOptions}
								bind:value={selectedResourceType}
								placeholder="Select type"
							/>
						</div>

						<div class="w-48">
							<span class="text-sm text-muted-foreground mb-1 block">
								Max Nodes: <span class="font-medium">{maxNodes}</span>
							</span>
							<input
								type="range"
								min="20"
								max="200"
								step="10"
								bind:value={maxNodes}
								class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
							/>
						</div>

						<div class="text-sm text-muted-foreground">
							Showing <span class="font-medium text-foreground">{filteredCollections.length}</span> items
						</div>
					</div>
				{/snippet}
			</CardContent>
		{/snippet}
	</Card>

	<!-- Tabs -->
	<Tabs {tabs} {activeTab} onTabChange={handleTabChange}>
		{#snippet children(tab)}
			{#if tab === 'contributors'}
				<!-- Contributor Network -->
				<div class="grid gap-4 md:grid-cols-3 mb-6">
					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{contributorNetwork.nodes.length}</div>
									<p class="text-sm text-muted-foreground">Nodes</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{contributorNetwork.links.length}</div>
									<p class="text-sm text-muted-foreground">Connections</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{contributorNetwork.categories.length}</div>
									<p class="text-sm text-muted-foreground">Categories</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>
				</div>

				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Contributor-Project Network{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[600px]">
							{#snippet children()}
								{#if contributorNetwork.nodes.length > 0}
									<NetworkGraph data={contributorNetwork} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No network data available
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card class="mt-6">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Network Legend{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent>
							{#snippet children()}
								<div class="flex gap-6">
									{#each contributorNetwork.categories as category, i}
										<div class="flex items-center gap-2">
											<div
												class="w-4 h-4 rounded-full"
												style="background-color: {i === 0 ? '#3b82f6' : '#10b981'}"
											></div>
											<span class="text-sm">{category.name}</span>
										</div>
									{/each}
								</div>
								<p class="text-sm text-muted-foreground mt-4">
									Drag nodes to rearrange. Scroll to zoom. Click and drag background to pan.
								</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>
			{:else if tab === 'affiliations'}
				<!-- Affiliation Network -->
				<div class="grid gap-4 md:grid-cols-3 mb-6">
					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{affiliationNetwork.nodes.length}</div>
									<p class="text-sm text-muted-foreground">Nodes</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{affiliationNetwork.links.length}</div>
									<p class="text-sm text-muted-foreground">Connections</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{$persons.length}</div>
									<p class="text-sm text-muted-foreground">Total Persons</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>
				</div>

				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Person-Institution Network{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[600px]">
							{#snippet children()}
								{#if affiliationNetwork.nodes.length > 0}
									<NetworkGraph data={affiliationNetwork} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No affiliation data available. Persons may not have institutional affiliations recorded.
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card class="mt-6">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Network Legend{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent>
							{#snippet children()}
								<div class="flex gap-6">
									{#each affiliationNetwork.categories as category, i}
										<div class="flex items-center gap-2">
											<div
												class="w-4 h-4 rounded-full"
												style="background-color: {i === 0 ? '#3b82f6' : '#10b981'}"
											></div>
											<span class="text-sm">{category.name}</span>
										</div>
									{/each}
								</div>
								<p class="text-sm text-muted-foreground mt-4">
									Drag nodes to rearrange. Scroll to zoom. Click and drag background to pan.
								</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>
			{:else}
				<!-- Institution Collaboration Network -->
				<div class="grid gap-4 md:grid-cols-3 mb-6">
					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{institutionNetwork.nodes.length}</div>
									<p class="text-sm text-muted-foreground">Institutions</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

					<Card>
						{#snippet children()}
							<CardContent class="pt-6">
								{#snippet children()}
									<div class="text-2xl font-bold">{institutionNetwork.links.length}</div>
									<p class="text-sm text-muted-foreground">Collaborations</p>
								{/snippet}
							</CardContent>
						{/snippet}
					</Card>

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
				</div>

				<Card>
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}Institution Collaboration Network{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent class="h-[600px]">
							{#snippet children()}
								{#if institutionNetwork.nodes.length > 0}
									<NetworkGraph data={institutionNetwork} />
								{:else}
									<div class="h-full flex items-center justify-center text-muted-foreground">
										No collaboration data available. Institutions may not have shared projects.
									</div>
								{/if}
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>

				<Card class="mt-6">
					{#snippet children()}
						<CardHeader>
							{#snippet children()}
								<CardTitle>
									{#snippet children()}About this visualization{/snippet}
								</CardTitle>
							{/snippet}
						</CardHeader>
						<CardContent>
							{#snippet children()}
								<p class="text-sm text-muted-foreground">
									This network shows institutions that collaborate through shared research projects.
									Connections are formed when institutions have team members working on the same project.
									Node size reflects the number of collaborations. Thicker lines indicate more shared projects.
								</p>
								<p class="text-sm text-muted-foreground mt-4">
									Drag nodes to rearrange. Scroll to zoom. Click and drag background to pan.
								</p>
							{/snippet}
						</CardContent>
					{/snippet}
				</Card>
			{/if}
		{/snippet}
	</Tabs>
</div>
