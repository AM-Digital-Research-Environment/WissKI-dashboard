import { writable, derived, type Readable } from 'svelte/store';
import type { FilterState, CollectionItem } from '$lib/types';
import { allCollections } from './data';
import {
	filterByDateRange,
	filterByResourceType,
	filterByLanguage,
	extractYear
} from '$lib/utils/dataTransform';

// Filter state store
export const filters = writable<FilterState>({
	dateRange: {
		start: null,
		end: null
	},
	resourceTypes: [],
	locations: [],
	languages: [],
	subjects: [],
	projects: []
});

// Reset filters
export function resetFilters() {
	filters.set({
		dateRange: { start: null, end: null },
		resourceTypes: [],
		locations: [],
		languages: [],
		subjects: [],
		projects: []
	});
}

// Update specific filter
export function setDateRange(start: Date | null, end: Date | null) {
	filters.update((f) => ({
		...f,
		dateRange: { start, end }
	}));
}

export function setResourceTypes(types: string[]) {
	filters.update((f) => ({ ...f, resourceTypes: types }));
}

export function setLanguages(languages: string[]) {
	filters.update((f) => ({ ...f, languages }));
}

export function setSubjects(subjects: string[]) {
	filters.update((f) => ({ ...f, subjects }));
}

export function setProjects(projects: string[]) {
	filters.update((f) => ({ ...f, projects }));
}

export function toggleResourceType(type: string) {
	filters.update((f) => {
		const types = f.resourceTypes.includes(type)
			? f.resourceTypes.filter((t) => t !== type)
			: [...f.resourceTypes, type];
		return { ...f, resourceTypes: types };
	});
}

export function toggleLanguage(lang: string) {
	filters.update((f) => {
		const languages = f.languages.includes(lang)
			? f.languages.filter((l) => l !== lang)
			: [...f.languages, lang];
		return { ...f, languages };
	});
}

// Filtered collections derived store
export const filteredCollections: Readable<CollectionItem[]> = derived(
	[allCollections, filters],
	([$collections, $filters]) => {
		let result = $collections;

		// Apply date range filter
		if ($filters.dateRange.start || $filters.dateRange.end) {
			const startYear = $filters.dateRange.start
				? extractYear($filters.dateRange.start)
				: null;
			const endYear = $filters.dateRange.end ? extractYear($filters.dateRange.end) : null;
			result = filterByDateRange(result, startYear, endYear);
		}

		// Apply resource type filter
		if ($filters.resourceTypes.length > 0) {
			result = filterByResourceType(result, $filters.resourceTypes);
		}

		// Apply language filter
		if ($filters.languages.length > 0) {
			result = filterByLanguage(result, $filters.languages);
		}

		// Apply subject filter
		if ($filters.subjects.length > 0) {
			result = result.filter((item) =>
				item.subject?.some((s) => {
					const label = s.authLabel || s.origLabel;
					return label && $filters.subjects.includes(label);
				})
			);
		}

		// Apply project filter
		if ($filters.projects.length > 0) {
			result = result.filter((item) => item.project && $filters.projects.includes(item.project.id));
		}

		return result;
	}
);

// Active filter count
export const activeFilterCount: Readable<number> = derived(filters, ($filters) => {
	let count = 0;
	if ($filters.dateRange.start || $filters.dateRange.end) count++;
	if ($filters.resourceTypes.length > 0) count++;
	if ($filters.languages.length > 0) count++;
	if ($filters.subjects.length > 0) count++;
	if ($filters.projects.length > 0) count++;
	return count;
});
