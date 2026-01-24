import { writable, derived, type Readable } from 'svelte/store';
import type {
	Project,
	Person,
	Institution,
	Group,
	CollectionItem,
	DashboardStats
} from '$lib/types';
import { loadAllData } from '$lib/utils/dataLoader';
import { calculateStats } from '$lib/utils/dataTransform';

// Loading state
export const isLoading = writable(true);
export const loadError = writable<string | null>(null);

// Raw data stores
export const projects = writable<Project[]>([]);
export const persons = writable<Person[]>([]);
export const institutions = writable<Institution[]>([]);
export const groups = writable<Group[]>([]);
export const artWorldCollection = writable<CollectionItem[]>([]);
export const clnckCollection = writable<CollectionItem[]>([]);

// Derived store for all collections combined
export const allCollections: Readable<CollectionItem[]> = derived(
	[artWorldCollection, clnckCollection],
	([$artWorld, $clnck]) => [...$artWorld, ...$clnck]
);

// Dashboard stats derived store
export const dashboardStats: Readable<DashboardStats> = derived(
	[projects, persons, institutions, artWorldCollection, clnckCollection],
	([$projects, $persons, $institutions, $artWorld, $clnck]) =>
		calculateStats($projects, $persons, $institutions, { artWorld: $artWorld, clnck: $clnck })
);

// Initialize data from JSON files
export async function initializeData(basePath: string = '') {
	isLoading.set(true);
	loadError.set(null);

	try {
		const data = await loadAllData(basePath);

		projects.set(data.projects);
		persons.set(data.persons);
		institutions.set(data.institutions);
		groups.set(data.groups);
		artWorldCollection.set(data.collections.artWorld);
		clnckCollection.set(data.collections.clnck);

		isLoading.set(false);
	} catch (error) {
		console.error('Failed to load data:', error);
		loadError.set(error instanceof Error ? error.message : 'Failed to load data');
		isLoading.set(false);
	}
}

// Theme store
function createThemeStore() {
	const { subscribe, set, update } = writable<'light' | 'dark'>('dark');

	return {
		subscribe,
		set,
		toggle: () => update((theme) => (theme === 'light' ? 'dark' : 'light')),
		init: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const initial = stored || (prefersDark ? 'dark' : 'light');
				set(initial);
				document.documentElement.classList.toggle('dark', initial === 'dark');
			}
		},
		setTheme: (theme: 'light' | 'dark') => {
			set(theme);
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', theme);
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
		}
	};
}

export const theme = createThemeStore();

// Selected project for filtering
export const selectedProjectId = writable<string | null>(null);

// Derived store for selected project
export const selectedProject: Readable<Project | null> = derived(
	[projects, selectedProjectId],
	([$projects, $selectedId]) => {
		if (!$selectedId) return null;
		return $projects.find((p) => p.id === $selectedId) || null;
	}
);

// Collection for selected project
export const selectedProjectCollection: Readable<CollectionItem[]> = derived(
	[allCollections, selectedProjectId],
	([$collections, $selectedId]) => {
		if (!$selectedId) return $collections;
		return $collections.filter((item) => item.project?.id === $selectedId);
	}
);
