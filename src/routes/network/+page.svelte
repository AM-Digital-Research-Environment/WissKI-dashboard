<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, Tabs } from '$lib/components/ui';
	import { NetworkGraph } from '$lib/components/charts';
	import { allCollections, persons } from '$lib/stores/data';
	import { buildContributorNetwork, buildPersonInstitutionNetwork } from '$lib/utils/dataTransform';

	const tabs = [
		{ id: 'contributors', label: 'Contributors' },
		{ id: 'affiliations', label: 'Affiliations' }
	];

	let activeTab = $state('contributors');

	let contributorNetwork = $derived(buildContributorNetwork($allCollections, 80));
	let affiliationNetwork = $derived(buildPersonInstitutionNetwork($persons, 50));

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
			{:else}
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
			{/if}
		{/snippet}
	</Tabs>
</div>
