import type {
	Project,
	Person,
	Institution,
	Group,
	CollectionItem,
	MongoOid,
	MongoDate,
	MongoNaN,
	EnrichedLocationsData
} from '$lib/types';

/**
 * Check if a value is a MongoDB NaN representation
 */
function isMongoNaN(value: unknown): value is MongoNaN {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$numberDouble' in value &&
		(value as MongoNaN).$numberDouble === 'NaN'
	);
}

/**
 * Check if a value is a MongoDB ObjectId
 */
function isMongoOid(value: unknown): value is MongoOid {
	return typeof value === 'object' && value !== null && '$oid' in value;
}

/**
 * Check if a value is a MongoDB Date
 */
function isMongoDate(value: unknown): value is MongoDate {
	return typeof value === 'object' && value !== null && '$date' in value;
}

/**
 * Recursively transform MongoDB extended JSON to native JS types
 */
export function transformMongoJSON<T>(data: unknown): T {
	if (data === null || data === undefined) {
		return null as T;
	}

	if (isMongoNaN(data)) {
		return null as T;
	}

	if (isMongoOid(data)) {
		return data.$oid as T;
	}

	if (isMongoDate(data)) {
		return new Date(data.$date) as T;
	}

	if (Array.isArray(data)) {
		return data.map((item) => transformMongoJSON(item)) as T;
	}

	if (typeof data === 'object') {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			result[key] = transformMongoJSON(value);
		}
		return result as T;
	}

	return data as T;
}

/**
 * Load and parse a JSON file from the static data directory
 */
export async function loadJSON<T>(path: string): Promise<T> {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Failed to load ${path}: ${response.statusText}`);
	}
	const rawData = await response.json();
	return transformMongoJSON<T>(rawData);
}

/**
 * Load projects data
 */
export async function loadProjects(basePath: string = ''): Promise<Project[]> {
	return loadJSON<Project[]>(`${basePath}/data/dev/dev.projectsData.json`);
}

/**
 * Load persons data
 */
export async function loadPersons(basePath: string = ''): Promise<Person[]> {
	return loadJSON<Person[]>(`${basePath}/data/dev/dev.persons.json`);
}

/**
 * Load institutions data
 */
export async function loadInstitutions(basePath: string = ''): Promise<Institution[]> {
	return loadJSON<Institution[]>(`${basePath}/data/dev/dev.institutions.json`);
}

/**
 * Load groups data
 */
export async function loadGroups(basePath: string = ''): Promise<Group[]> {
	return loadJSON<Group[]>(`${basePath}/data/dev/dev.groups.json`);
}

/**
 * Load UBT ArtWorld collection
 */
export async function loadArtWorldCollection(basePath: string = ''): Promise<CollectionItem[]> {
	return loadJSON<CollectionItem[]>(
		`${basePath}/data/projects_metadata_ubt/projects_metadata_ubt.UBT_ArtWorld2019.json`
	);
}

/**
 * Load UBT CLnCK collection
 */
export async function loadCLnCKCollection(basePath: string = ''): Promise<CollectionItem[]> {
	return loadJSON<CollectionItem[]>(
		`${basePath}/data/projects_metadata_ubt/projects_metadata_ubt.UBT_CLnCK2019.json`
	);
}

/**
 * Load all collection items from all UBT collections
 */
export async function loadAllCollections(basePath: string = ''): Promise<CollectionItem[]> {
	const [artWorld, clnck] = await Promise.all([
		loadArtWorldCollection(basePath),
		loadCLnCKCollection(basePath)
	]);
	return [...artWorld, ...clnck];
}

/**
 * Load all data for the dashboard
 */
export async function loadAllData(basePath: string = '') {
	const [projects, persons, institutions, groups, artWorld, clnck] = await Promise.all([
		loadProjects(basePath),
		loadPersons(basePath),
		loadInstitutions(basePath),
		loadGroups(basePath),
		loadArtWorldCollection(basePath),
		loadCLnCKCollection(basePath)
	]);

	return {
		projects,
		persons,
		institutions,
		groups,
		collections: {
			artWorld,
			clnck,
			all: [...artWorld, ...clnck]
		}
	};
}

/**
 * Load enriched location data (Wikidata reconciliation results)
 */
export async function loadEnrichedLocations(
	basePath: string = ''
): Promise<EnrichedLocationsData | null> {
	try {
		const response = await fetch(`${basePath}/data/enriched/locations_wikidata.json`);
		if (!response.ok) {
			console.warn('Enriched location data not found. Run reconcile_locations.py to generate it.');
			return null;
		}
		return response.json();
	} catch {
		console.warn('Failed to load enriched location data.');
		return null;
	}
}
