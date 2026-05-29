import type {
	CollectionItem,
	Project,
	HeatmapDataPoint,
	BeeswarmDataPoint,
	GanttDataPoint,
	StackedAreaDataPoint
} from '$lib/types';
import { extractYear } from './dates';
import { buildProjectMetaMap, countByProjectId } from './indexing';

/** Options for {@link buildHeatmapData}. */
export interface HeatmapBuildOptions {
	/** Maximum number of x-axis categories (top N by count). Default 15. */
	maxX?: number;
	/** Maximum number of y-axis categories (top N by count). Default 10. */
	maxY?: number;
	/**
	 * Count each (x, y) pair at most once per item, de-duplicating repeated
	 * values within an item's multi-valued fields. With this on, axis rankings
	 * reflect the number of *distinct items* in each category rather than raw
	 * pair multiplicity — which is what "how many items have both X and Y"
	 * almost always means. Default false (legacy multiplicity counting).
	 */
	dedupePerItem?: boolean;
}

/**
 * Build a heatmap matrix crossing two categorical dimensions from collection
 * items. Data points are emitted in ranked order (top x × top y), so the
 * chart's category axes — which are derived from data-point order when no
 * explicit labels are supplied — read most-frequent-first.
 *
 * @param items - Collection items to process
 * @param xExtractor - Extracts x-axis categories from an item
 * @param yExtractor - Extracts y-axis categories from an item
 * @param options - Limits and counting mode (see {@link HeatmapBuildOptions})
 */
export function buildHeatmapData(
	items: CollectionItem[],
	xExtractor: (item: CollectionItem) => string | string[] | null | undefined,
	yExtractor: (item: CollectionItem) => string | string[] | null | undefined,
	options: HeatmapBuildOptions = {}
): HeatmapDataPoint[] {
	const { maxX = 15, maxY = 10, dedupePerItem = false } = options;

	const xCounts = new Map<string, number>();
	const yCounts = new Map<string, number>();
	const matrix = new Map<string, number>();

	const toList = (raw: string | string[] | null | undefined): string[] => {
		if (!raw) return [];
		const arr = Array.isArray(raw) ? raw : [raw];
		const cleaned = arr.filter((v): v is string => !!v && v.trim().length > 0);
		return dedupePerItem ? [...new Set(cleaned)] : cleaned;
	};

	for (const item of items) {
		const xs = toList(xExtractor(item));
		const ys = toList(yExtractor(item));
		if (xs.length === 0 || ys.length === 0) continue;

		if (dedupePerItem) {
			// One increment per distinct value per item, independent of the
			// other axis's cardinality.
			for (const x of xs) xCounts.set(x, (xCounts.get(x) ?? 0) + 1);
			for (const y of ys) yCounts.set(y, (yCounts.get(y) ?? 0) + 1);
		}

		for (const x of xs) {
			for (const y of ys) {
				if (!dedupePerItem) {
					xCounts.set(x, (xCounts.get(x) ?? 0) + 1);
					yCounts.set(y, (yCounts.get(y) ?? 0) + 1);
				}
				const key = `${x}||${y}`;
				matrix.set(key, (matrix.get(key) ?? 0) + 1);
			}
		}
	}

	const topX = [...xCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxX)
		.map(([name]) => name);
	const topY = [...yCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxY)
		.map(([name]) => name);

	const result: HeatmapDataPoint[] = [];
	for (const x of topX) {
		for (const y of topY) {
			const value = matrix.get(`${x}||${y}`);
			if (value) result.push({ x, y, value });
		}
	}

	return result;
}

/** Options for {@link buildTopCategoryTimeline}. */
export interface TopCategoryTimelineOptions<T> {
	/** Year for an item, or null/undefined to skip it. */
	getYear: (item: T) => number | null | undefined;
	/** Category labels carried by an item (multi-valued; de-duped per item). */
	getLabels: (item: T) => string[];
	/** Pre-ranked category names that each get their own series. */
	topNames: string[];
	/**
	 * When set, labels outside `topNames` fold into this bucket (e.g. "Other").
	 * When omitted, non-top labels are dropped entirely.
	 */
	otherBucket?: string;
}

/**
 * Build a stacked-area-over-time series: per year, the item count for each of
 * the top categories. Each item contributes at most once per (year, bucket)
 * so multi-valued fields never double-count. Extracted from the near-identical
 * inline builders on the subjects, languages, and resource-types pages.
 */
export function buildTopCategoryTimeline<T>(
	items: T[],
	options: TopCategoryTimelineOptions<T>
): StackedAreaDataPoint[] {
	const { getYear, getLabels, topNames, otherBucket } = options;
	const top = new Set(topNames);
	const byYear = new Map<number, Record<string, number>>();

	for (const item of items) {
		const year = getYear(item);
		if (year == null) continue;
		const labels = getLabels(item);
		if (labels.length === 0) continue;

		const seen = new Set<string>();
		for (const label of labels) {
			if (!label) continue;
			const bucket = top.has(label) ? label : (otherBucket ?? null);
			if (bucket == null || seen.has(bucket)) continue;
			seen.add(bucket);
			let row = byYear.get(year);
			if (!row) {
				row = {};
				byYear.set(year, row);
			}
			row[bucket] = (row[bucket] ?? 0) + 1;
		}
	}

	return Array.from(byYear.entries())
		.sort(([a], [b]) => a - b)
		.map(([year, byCategory]) => ({ year, byCategory }));
}

/**
 * Build a research-section × university heatmap from projects and collection items.
 *
 * External items (university='external') are routed onto a partner university
 * axis when their project's institution matches one — BayGlo2025 lists
 * 'University of Bayreuth', so its items count under UBT. External items whose
 * project has no partner-institution match stay under "External".
 */
export function buildResearchSectionUniversityHeatmap(
	projects: Project[],
	items: CollectionItem[]
): HeatmapDataPoint[] {
	const { sections: projectSections, institutions: projectInstitutions } =
		buildProjectMetaMap(projects);

	// Full institution names on the axis (more readable than UBT/UNILAG/...).
	// `rhodes` is a synthetic axis for ILAM (housed at Rhodes University) so
	// those items show up under their actual home institution instead of an
	// opaque "External" bucket.
	const uniLabelMap: Record<string, string> = {
		ubt: 'University of Bayreuth',
		unilag: 'University of Lagos',
		ujkz: 'Université Joseph Ki-Zerbo',
		ufba: 'Federal University of Bahia',
		rhodes: 'Rhodes University',
		external: 'External'
	};

	// Institutions listed on projects that, when matched, reclassify the
	// axis bucket for external-tagged items. BayGlo lists "University of
	// Bayreuth" and routes back to UBT; ILAM lists "Rhodes University" and
	// now gets its own axis instead of falling through to "External".
	const partnerInstitutionToUniId: Record<string, string> = {
		'University of Bayreuth': 'ubt',
		'University of Lagos African Cluster Centre (LACC)': 'unilag',
		'University Joseph Ki-Zerbo': 'ujkz',
		'Universidade Federal da Bahia': 'ufba',
		'CEAO Centro de Estudos Afro-Orientais': 'ufba',
		'Rhodes University': 'rhodes'
	};

	const matrix = new Map<string, number>();

	for (const item of items) {
		const projectId = item.project?.id;
		const uni = item.university;
		if (!projectId || !uni) continue;

		const sections = projectSections.get(projectId);
		if (!sections?.length) continue;

		// Resolve the axis bucket. External items route to a partner axis
		// when their project's institutions name one; otherwise fall back to
		// the generic "External" bucket.
		let axisKey = uni;
		if (uni === 'external') {
			const insts = projectInstitutions.get(projectId) ?? [];
			const matchedUni = insts
				.map((i) => partnerInstitutionToUniId[i])
				.find((v): v is string => !!v);
			if (matchedUni) axisKey = matchedUni;
		}
		const uniLabel = uniLabelMap[axisKey] || axisKey;

		for (const section of sections) {
			const key = `${uniLabel}||${section}`;
			matrix.set(key, (matrix.get(key) || 0) + 1);
		}
	}

	const result: HeatmapDataPoint[] = [];
	for (const [key, value] of matrix) {
		const [x, y] = key.split('||');
		result.push({ x, y, value });
	}

	return result;
}

/**
 * Build beeswarm data from projects, plotting them by start year and grouped by research section.
 */
export function buildProjectBeeswarm(
	projects: Project[],
	items: CollectionItem[]
): BeeswarmDataPoint[] {
	const itemCountByProject = countByProjectId(items);

	const result: BeeswarmDataPoint[] = [];

	for (const project of projects) {
		const startYear = extractYear(project.date?.start);
		if (!startYear) continue;

		// A project can be in multiple sections — use the first one for grouping
		const section = project.researchSection?.[0] || 'Unassigned';
		const itemCount = itemCountByProject.get(project.id) ?? 0;

		result.push({
			category: section,
			value: startYear,
			label: project.name,
			size: Math.max(itemCount, 1)
		});
	}

	return result;
}

/**
 * Build Gantt chart data from projects, using start/end dates.
 * Groups by first research section for color coding.
 */
export function buildProjectGantt(projects: Project[]): GanttDataPoint[] {
	const result: GanttDataPoint[] = [];

	for (const project of projects) {
		const startYear = extractYear(project.date?.start);
		const endYear = extractYear(project.date?.end);
		if (!startYear) continue;

		// If no end date, assume ongoing (current year) or 1 year
		const effectiveEnd = endYear || Math.max(startYear + 1, new Date().getFullYear());

		// Truncate long names for the y-axis
		const shortName =
			project.name.length > 50 ? project.name.substring(0, 47) + '...' : project.name;

		const section = project.researchSection?.[0] || 'Unassigned';

		result.push({
			name: shortName,
			start: startYear,
			end: effectiveEnd,
			category: section,
			tooltip: project.id
		});
	}

	return result;
}
