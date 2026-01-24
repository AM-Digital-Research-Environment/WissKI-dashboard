import type {
	CollectionItem,
	Project,
	Person,
	TimelineDataPoint,
	BarChartDataPoint,
	PieChartDataPoint,
	WordCloudDataPoint,
	NetworkData,
	DashboardStats
} from '$lib/types';

/**
 * Extract year from various date formats
 */
export function extractYear(date: Date | string | null | undefined): number | null {
	if (!date) return null;
	const d = date instanceof Date ? date : new Date(date);
	if (isNaN(d.getTime())) return null;
	return d.getFullYear();
}

/**
 * Group collection items by year for timeline visualization
 */
export function groupByYear(items: CollectionItem[]): TimelineDataPoint[] {
	const yearMap = new Map<number, CollectionItem[]>();

	items.forEach((item) => {
		// Try to get year from dateInfo.issue.start, then dateInfo.creation.start
		let year: number | null = null;

		if (item.dateInfo?.issue?.start) {
			year = extractYear(item.dateInfo.issue.start);
		} else if (item.dateInfo?.creation?.start) {
			year = extractYear(item.dateInfo.creation.start);
		}

		if (year) {
			const existing = yearMap.get(year) || [];
			existing.push(item);
			yearMap.set(year, existing);
		}
	});

	return Array.from(yearMap.entries())
		.map(([year, items]) => ({
			year,
			count: items.length,
			items
		}))
		.sort((a, b) => a.year - b.year);
}

/**
 * Group projects by year for timeline visualization
 */
export function groupProjectsByYear(projects: Project[]): TimelineDataPoint[] {
	const yearMap = new Map<number, number>();

	projects.forEach((project) => {
		const year = extractYear(project.date?.start);
		if (year) {
			yearMap.set(year, (yearMap.get(year) || 0) + 1);
		}
	});

	return Array.from(yearMap.entries())
		.map(([year, count]) => ({ year, count }))
		.sort((a, b) => a.year - b.year);
}

/**
 * Count occurrences for bar chart data
 */
export function countOccurrences<T>(
	items: T[],
	extractor: (item: T) => string | string[] | null | undefined
): BarChartDataPoint[] {
	const countMap = new Map<string, number>();

	items.forEach((item) => {
		const value = extractor(item);
		if (!value) return;

		const values = Array.isArray(value) ? value : [value];
		values.forEach((v) => {
			if (v && v.trim()) {
				countMap.set(v, (countMap.get(v) || 0) + 1);
			}
		});
	});

	return Array.from(countMap.entries())
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);
}

/**
 * Extract subjects from collection items
 */
export function extractSubjects(items: CollectionItem[]): BarChartDataPoint[] {
	return countOccurrences(items, (item) => item.subject?.map((s) => s.authLabel || s.origLabel));
}

/**
 * Extract resource types from collection items
 */
export function extractResourceTypes(items: CollectionItem[]): PieChartDataPoint[] {
	return countOccurrences(items, (item) => item.typeOfResource);
}

/**
 * Extract languages from collection items
 */
export function extractLanguages(items: CollectionItem[]): BarChartDataPoint[] {
	return countOccurrences(items, (item) => item.language);
}

/**
 * Extract tags for word cloud
 */
export function extractTags(items: CollectionItem[]): WordCloudDataPoint[] {
	const tagCounts = countOccurrences(items, (item) => item.tags);
	// Combine with subjects for richer word cloud
	const subjectCounts = countOccurrences(items, (item) =>
		item.subject?.map((s) => s.authLabel || s.origLabel)
	);

	const combined = new Map<string, number>();
	[...tagCounts, ...subjectCounts].forEach(({ name, value }) => {
		combined.set(name, (combined.get(name) || 0) + value);
	});

	return Array.from(combined.entries())
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);
}

/**
 * Extract location origins for geographic data
 */
export function extractLocations(
	items: CollectionItem[]
): { country: string; region: string; city: string; count: number }[] {
	const locationMap = new Map<string, { country: string; region: string; city: string; count: number }>();

	items.forEach((item) => {
		item.location?.origin?.forEach((origin) => {
			if (origin.l1) {
				const key = `${origin.l1}|${origin.l2 || ''}|${origin.l3 || ''}`;
				const existing = locationMap.get(key);
				if (existing) {
					existing.count++;
				} else {
					locationMap.set(key, {
						country: origin.l1,
						region: origin.l2 || '',
						city: origin.l3 || '',
						count: 1
					});
				}
			}
		});
	});

	return Array.from(locationMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Extract research sections from projects
 */
export function extractResearchSections(projects: Project[]): BarChartDataPoint[] {
	return countOccurrences(projects, (project) => project.researchSection);
}

/**
 * Extract institutions from projects
 */
export function extractInstitutions(projects: Project[]): BarChartDataPoint[] {
	return countOccurrences(projects, (project) => project.institutions);
}

/**
 * Extract locales from projects
 */
export function extractLocales(projects: Project[]): BarChartDataPoint[] {
	return countOccurrences(projects, (project) => project.locale);
}

/**
 * Build network data for person-institution relationships
 */
export function buildPersonInstitutionNetwork(
	persons: Person[],
	maxNodes: number = 100
): NetworkData {
	const nodes: NetworkData['nodes'] = [];
	const links: NetworkData['links'] = [];
	const institutionSet = new Set<string>();

	// Limit persons for performance
	const limitedPersons = persons.slice(0, maxNodes);

	limitedPersons.forEach((person) => {
		nodes.push({
			id: person._id,
			name: person.name,
			category: 0, // Person category
			symbolSize: 10
		});

		person.affiliation?.forEach((inst) => {
			if (!institutionSet.has(inst)) {
				institutionSet.add(inst);
				nodes.push({
					id: `inst_${inst}`,
					name: inst,
					category: 1, // Institution category
					symbolSize: 20
				});
			}
			links.push({
				source: person._id,
				target: `inst_${inst}`
			});
		});
	});

	return {
		nodes,
		links,
		categories: [{ name: 'Person' }, { name: 'Institution' }]
	};
}

/**
 * Build network data for contributors in collections
 */
export function buildContributorNetwork(items: CollectionItem[], maxNodes: number = 100): NetworkData {
	const nodes: NetworkData['nodes'] = [];
	const links: NetworkData['links'] = [];
	const personSet = new Set<string>();
	const projectSet = new Set<string>();
	const linkSet = new Set<string>();

	items.slice(0, maxNodes * 2).forEach((item) => {
		const projectId = item.project?.id;
		if (!projectId) return;

		if (!projectSet.has(projectId)) {
			projectSet.add(projectId);
			nodes.push({
				id: projectId,
				name: item.project.name || projectId,
				category: 0,
				symbolSize: 30
			});
		}

		item.name?.forEach((entry) => {
			const personName = entry.name?.label;
			if (!personName) return;

			if (!personSet.has(personName)) {
				personSet.add(personName);
				nodes.push({
					id: personName,
					name: personName,
					category: 1,
					symbolSize: 15
				});
			}

			const linkKey = `${personName}-${projectId}`;
			if (!linkSet.has(linkKey)) {
				linkSet.add(linkKey);
				links.push({
					source: personName,
					target: projectId
				});
			}
		});
	});

	return {
		nodes: nodes.slice(0, maxNodes),
		links,
		categories: [{ name: 'Project' }, { name: 'Contributor' }]
	};
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(
	projects: Project[],
	persons: Person[],
	institutions: { _id: string; name: string }[],
	collections: { artWorld: CollectionItem[]; clnck: CollectionItem[] }
): DashboardStats {
	return {
		totalProjects: projects.length,
		totalPersons: persons.length,
		totalDocuments: collections.artWorld.length + collections.clnck.length,
		totalInstitutions: institutions.length,
		collectionCounts: {
			artWorld: collections.artWorld.length,
			clnck: collections.clnck.length
		}
	};
}

/**
 * Filter collection items by date range
 */
export function filterByDateRange(
	items: CollectionItem[],
	startYear: number | null,
	endYear: number | null
): CollectionItem[] {
	if (!startYear && !endYear) return items;

	return items.filter((item) => {
		const year = extractYear(item.dateInfo?.issue?.start) || extractYear(item.dateInfo?.creation?.start);
		if (!year) return true; // Include items without dates

		if (startYear && year < startYear) return false;
		if (endYear && year > endYear) return false;
		return true;
	});
}

/**
 * Filter collection items by resource type
 */
export function filterByResourceType(items: CollectionItem[], types: string[]): CollectionItem[] {
	if (!types.length) return items;
	return items.filter((item) => types.includes(item.typeOfResource));
}

/**
 * Filter collection items by language
 */
export function filterByLanguage(items: CollectionItem[], languages: string[]): CollectionItem[] {
	if (!languages.length) return items;
	return items.filter((item) => item.language?.some((lang) => languages.includes(lang)));
}

/**
 * Get unique values from collection items
 */
export function getUniqueResourceTypes(items: CollectionItem[]): string[] {
	const types = new Set<string>();
	items.forEach((item) => {
		if (item.typeOfResource) types.add(item.typeOfResource);
	});
	return Array.from(types).sort();
}

export function getUniqueLanguages(items: CollectionItem[]): string[] {
	const languages = new Set<string>();
	items.forEach((item) => {
		item.language?.forEach((lang) => languages.add(lang));
	});
	return Array.from(languages).sort();
}

export function getUniqueSubjects(items: CollectionItem[]): string[] {
	const subjects = new Set<string>();
	items.forEach((item) => {
		item.subject?.forEach((s) => {
			const label = s.authLabel || s.origLabel;
			if (label) subjects.add(label);
		});
	});
	return Array.from(subjects).sort();
}
