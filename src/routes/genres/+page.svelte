<script lang="ts">
	import { StatCard, ChartCard, SEO } from '$lib/components/ui';
	import { BarChart, EntityKnowledgeGraph, HeatmapChart } from '$lib/components/charts';
	import { languageName, normalizeLanguageCode } from '$lib/utils/languages';
	import { buildHeatmapData } from '$lib/utils/transforms';
	import { EntityDashboardSection } from '$lib/components/dashboards';
	import {
		EntityCard,
		EntityBrowseGrid,
		EntityToolbar,
		EntityDetailHeader,
		EntityDetailViewShell,
		EntityPageContainer,
		SearchableItemsCard,
		applyEntitySort,
		type EntitySort
	} from '$lib/components/entity-browse';
	import { allCollections } from '$lib/stores/data';
	import { page } from '$app/stores';
	import { createUrlSelection, scrollToTop } from '$lib/utils/urlSelection';
	import { createSearchFilter } from '$lib/utils/search';
	import {
		buildCategoryIndex,
		sortedCategoryList,
		categoryToChartData
	} from '$lib/utils/categoryIndex';
	import type { CollectionItem, CategoryEntry } from '$lib/types';
	import { BookType } from '@lucide/svelte';
	import { createEntityDetailState } from '$lib/utils/loaders';

	const urlSelection = createUrlSelection('genre');

	let searchQuery = $state('');
	let sort = $state<EntitySort>('count-desc');

	// Writable $derived mirrors the URL param. Click handlers can still
	// overwrite it optimistically (`selectedGenre = name`); assignment wins
	// until the derivation dependency changes, which happens when `goto()`
	// updates the URL. Using $derived (not $state + $effect) is what makes
	// browser Back restore the list view — the derivation re-runs when the
	// URL param disappears.
	let selectedGenre = $derived($page.url.searchParams.get('genre') ?? '');

	function getItemGenres(item: CollectionItem): string[] {
		if (!item.genre) return [];
		const entries: string[] = [];
		for (const values of Object.values(item.genre)) {
			if (Array.isArray(values)) entries.push(...values.filter(Boolean));
		}
		return entries;
	}

	let genreMap = $derived(buildCategoryIndex($allCollections, getItemGenres));
	let genres = $derived(sortedCategoryList(genreMap));

	const detail = createEntityDetailState('genre', () => selectedGenre);

	let selectedGenreData = $derived.by((): CategoryEntry | null => {
		if (!selectedGenre) return null;
		const live = genreMap.get(selectedGenre);
		if (live && live.items.length > 0) return live;
		if (detail.data?.meta) {
			return {
				name: detail.data.meta.name ?? selectedGenre,
				count: detail.data.meta.count ?? 0,
				items: detail.items
			};
		}
		return null;
	});

	const searchGenres = createSearchFilter<CategoryEntry>([(g) => g.name]);
	let visibleGenres = $derived(applyEntitySort(searchGenres(genres, searchQuery), sort));

	let barData = $derived(categoryToChartData(genres, 20));

	// Heatmap: top 12 genres (y) × top 8 languages (x), counting distinct items.
	let genreLanguageHeatmap = $derived(
		buildHeatmapData(
			$allCollections,
			(item) => (item.language ?? []).map((c) => languageName(normalizeLanguageCode(c))),
			getItemGenres,
			{ maxX: 8, maxY: 12, dedupePerItem: true }
		)
	);

	function selectGenre(genre: string) {
		urlSelection.pushToUrl(genre);
		scrollToTop();
	}

	function clearSelection() {
		urlSelection.removeFromUrl();
		scrollToTop();
	}
</script>

<SEO title="Genres" description="Browse research items by genre classification" />

<EntityPageContainer
	title="Genres"
	subtitle="Browse research items by genre classification"
	selected={() => selectedGenre}
>
	{#snippet detailView()}
		<EntityDetailViewShell
			backLabel="Back to genres"
			onBack={clearSelection}
			resolved={selectedGenreData}
			loading={detail.loading}
			emptyMessage="No data available for this genre."
		>
			{#snippet body(genre)}
				<EntityDetailHeader
					title={genre.name}
					icon={BookType}
					count={genre.count}
					percentOfTotal={$allCollections.length
						? (genre.count / $allCollections.length) * 100
						: undefined}
					wisskiCategory="genres"
					wisskiKey={genre.name}
				/>
				<SearchableItemsCard items={genre.items} showProject={true} />
				<EntityDashboardSection
					entityType="genre"
					entityId={genre.name}
					items={genre.items}
					data={detail.data}
				/>
				<EntityKnowledgeGraph
					entityType="genre"
					entityId={genre.name}
					title="Genre knowledge graph"
				/>
			{/snippet}
		</EntityDetailViewShell>
	{/snippet}

	{#snippet listView()}
		<div class="grid gap-4 sm:grid-cols-3">
			<StatCard label="Genres" value={genres.length} icon={BookType} />
			<StatCard label="Most Common" value={genres[0]?.name || '—'} icon={BookType} />
			<StatCard label="Total Items" value={$allCollections.length} icon={BookType} />
		</div>

		<ChartCard
			title="Top 20 Genres"
			subtitle="Click a bar to open a genre"
			contentHeight="h-chart-lg"
		>
			{#if barData.length > 0}
				<BarChart data={barData} onclick={(name) => selectGenre(name)} />
			{/if}
		</ChartCard>

		{#if genreLanguageHeatmap.length > 0}
			<ChartCard
				title="Genre × language"
				subtitle="Where each genre concentrates in the language mix"
				contentHeight="h-chart-lg"
			>
				<HeatmapChart data={genreLanguageHeatmap} class="h-full w-full" />
			</ChartCard>
		{/if}

		<EntityToolbar
			{searchQuery}
			onSearchChange={(v) => (searchQuery = v)}
			searchPlaceholder="Search genres..."
			{sort}
			onSortChange={(v) => (sort = v)}
			totalCount={visibleGenres.length}
			totalLabel="genres"
		/>

		<EntityBrowseGrid
			items={visibleGenres}
			getKey={(g) => g.name}
			emptyMessage="No genres match your search"
		>
			{#snippet card(genre)}
				<EntityCard
					name={genre.name}
					description="Genre"
					count={genre.count}
					countLabel="item"
					icon={BookType}
					onclick={() => selectGenre(genre.name)}
				/>
			{/snippet}
		</EntityBrowseGrid>
	{/snippet}
</EntityPageContainer>
