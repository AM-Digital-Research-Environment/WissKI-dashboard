<script lang="ts">
	import { StatCard, ChartCard, SEO } from '$lib/components/ui';
	import { PieChart, BarChart, StackedAreaChart, HeatmapChart } from '$lib/components/charts';
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
	import { extractItemYear } from '$lib/utils/transforms/dates';
	import { buildTopCategoryTimeline, buildHeatmapData } from '$lib/utils/transforms';
	import { languageName, normalizeLanguageCode } from '$lib/utils/languages';
	import type { CategoryEntry } from '$lib/types';
	import { FileText, Layers } from '@lucide/svelte';
	import { createEntityDetailState } from '$lib/utils/loaders';

	const urlSelection = createUrlSelection('type');

	let searchQuery = $state('');
	let sort = $state<EntitySort>('count-desc');

	let selectedType = $derived($page.url.searchParams.get('type') ?? '');

	let typeMap = $derived(
		buildCategoryIndex($allCollections, (item) => [item.typeOfResource || 'Unknown'])
	);
	let types = $derived(sortedCategoryList(typeMap));

	const detail = createEntityDetailState('resource-type', () => selectedType);

	let selectedTypeData = $derived.by((): CategoryEntry | null => {
		if (!selectedType) return null;
		const live = typeMap.get(selectedType);
		if (live && live.items.length > 0) return live;
		if (detail.data?.meta) {
			return {
				name: detail.data.meta.name ?? selectedType,
				count: detail.data.meta.count ?? 0,
				items: detail.items
			};
		}
		return null;
	});

	const searchTypes = createSearchFilter<CategoryEntry>([(t) => t.name]);
	let visibleTypes = $derived(applyEntitySort(searchTypes(types, searchQuery), sort));

	let pieData = $derived(categoryToChartData(types));
	let barData = $derived(categoryToChartData(types));

	// Top-N resource types over time, stacked. Smaller types fold into "Other".
	const TOP_TYPE_SERIES = 8;
	let topTypeNames = $derived(types.slice(0, TOP_TYPE_SERIES).map((t) => t.name));

	let typeTimelineData = $derived(
		buildTopCategoryTimeline($allCollections, {
			getYear: extractItemYear,
			getLabels: (item) => [item.typeOfResource || 'Unknown'],
			topNames: topTypeNames,
			otherBucket: 'Other'
		})
	);

	// Heatmap: type (y) × language (x). Top 10 of each, counting distinct items.
	let typeLanguageHeatmap = $derived(
		buildHeatmapData(
			$allCollections,
			(item) => (item.language ?? []).map((c) => languageName(normalizeLanguageCode(c))),
			(item) => item.typeOfResource || 'Unknown',
			{ maxX: 10, maxY: 10, dedupePerItem: true }
		)
	);

	function selectType(type: string) {
		urlSelection.pushToUrl(type);
		scrollToTop();
	}

	function clearSelection() {
		urlSelection.removeFromUrl();
		scrollToTop();
	}
</script>

<SEO title="Resource Types" description="Browse research items organized by resource type" />

<EntityPageContainer
	title="Resource Types"
	subtitle="Browse research items by their resource type classification"
	selected={() => selectedType}
>
	{#snippet detailView()}
		<EntityDetailViewShell
			backLabel="Back to resource types"
			onBack={clearSelection}
			resolved={selectedTypeData}
			loading={detail.loading}
			emptyMessage="No data available for this type."
		>
			{#snippet body(type)}
				<EntityDetailHeader
					title={type.name}
					icon={FileText}
					count={type.count}
					percentOfTotal={$allCollections.length
						? (type.count / $allCollections.length) * 100
						: undefined}
					wisskiCategory="resourceTypes"
					wisskiKey={type.name}
				/>
				<SearchableItemsCard items={type.items} showType={false} showProject={true} />
				<EntityDashboardSection
					entityType="resource-type"
					entityId={type.name}
					items={type.items}
					data={detail.data}
				/>
			{/snippet}
		</EntityDetailViewShell>
	{/snippet}

	{#snippet listView()}
		<div class="grid gap-4 sm:grid-cols-3">
			<StatCard label="Resource Types" value={types.length} icon={Layers} />
			<StatCard label="Total Items" value={$allCollections.length} icon={FileText} />
			<StatCard label="Most Common" value={types[0]?.name || '—'} icon={FileText} />
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<ChartCard title="Distribution" subtitle="Click a segment to open" contentHeight="h-chart-md">
				{#if pieData.length > 0}
					<PieChart data={pieData} onclick={(name) => selectType(name)} />
				{/if}
			</ChartCard>
			<ChartCard title="Item counts" subtitle="Click a bar to open" contentHeight="h-chart-md">
				{#if barData.length > 0}
					<BarChart data={barData} onclick={(name) => selectType(name)} />
				{/if}
			</ChartCard>
		</div>

		{#if typeTimelineData.length > 0}
			<ChartCard
				title="Resource types over time"
				subtitle="Top {TOP_TYPE_SERIES} types by item count, with smaller types folded into 'Other'"
				contentHeight="h-chart-lg"
			>
				<StackedAreaChart data={typeTimelineData} class="h-full w-full" />
			</ChartCard>
		{/if}

		{#if typeLanguageHeatmap.length > 0}
			<ChartCard
				title="Resource type × language"
				subtitle="How types and languages overlap across the archive"
				contentHeight="h-chart-lg"
			>
				<HeatmapChart data={typeLanguageHeatmap} class="h-full w-full" />
			</ChartCard>
		{/if}

		<EntityToolbar
			{searchQuery}
			onSearchChange={(v) => (searchQuery = v)}
			searchPlaceholder="Search resource types..."
			{sort}
			onSortChange={(v) => (sort = v)}
			totalCount={visibleTypes.length}
			totalLabel="types"
		/>

		<EntityBrowseGrid
			items={visibleTypes}
			getKey={(t) => t.name}
			emptyMessage="No resource types match your search"
		>
			{#snippet card(type)}
				<EntityCard
					name={type.name}
					description="Resource type"
					count={type.count}
					countLabel="item"
					icon={FileText}
					onclick={() => selectType(type.name)}
				/>
			{/snippet}
		</EntityBrowseGrid>
	{/snippet}
</EntityPageContainer>
