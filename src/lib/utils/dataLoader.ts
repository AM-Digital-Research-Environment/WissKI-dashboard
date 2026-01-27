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
 * Try to load a JSON file, return empty array if not found
 */
async function tryLoadJSON<T>(path: string): Promise<T[]> {
	try {
		return await loadJSON<T[]>(path);
	} catch {
		console.warn(`Could not load ${path}`);
		return [];
	}
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
 * Load dev collections data
 */
export async function loadDevCollections(basePath: string = ''): Promise<CollectionItem[]> {
	return tryLoadJSON<CollectionItem>(`${basePath}/data/dev/dev.collections.json`);
}

/**
 * All UBT collection file names
 */
const UBT_COLLECTIONS = [
	'UBT_ArtWorld2019',
	'UBT_CLnCK2019',
	'UBT_Covid192021',
	'UBT_DigiRet2021',
	'UBT_HDMC2019',
	'UBT_Humanitar2019',
	'UBT_Karakul2019',
	'UBT_LearnClass2019',
	'UBT_MaL2019',
	'UBT_MiConIturi2019',
	'UBT_MoCapIE2021',
	'UBT_MuDAIMa-PRJ2019',
	'UBT_MuDAIMa2019',
	'UBT_MultiALS2021',
	'UBT_OilMov2019',
	'UBT_PEMESWA2021',
	'UBT_Plura2021',
	'UBT_TaiSha2021',
	'UBT_TravKnowl2019',
	'UBT_preDeath2021'
];

/**
 * Load a specific UBT collection by name
 */
export async function loadUBTCollection(
	collectionName: string,
	basePath: string = ''
): Promise<CollectionItem[]> {
	return tryLoadJSON<CollectionItem>(
		`${basePath}/data/projects_metadata_ubt/projects_metadata_ubt.${collectionName}.json`
	);
}

/**
 * Load UBT ArtWorld collection (legacy)
 */
export async function loadArtWorldCollection(basePath: string = ''): Promise<CollectionItem[]> {
	return loadUBTCollection('UBT_ArtWorld2019', basePath);
}

/**
 * Load UBT CLnCK collection (legacy)
 */
export async function loadCLnCKCollection(basePath: string = ''): Promise<CollectionItem[]> {
	return loadUBTCollection('UBT_CLnCK2019', basePath);
}

/**
 * Load all UBT collections
 */
export async function loadAllUBTCollections(basePath: string = ''): Promise<CollectionItem[]> {
	const results = await Promise.all(
		UBT_COLLECTIONS.map((name) => loadUBTCollection(name, basePath))
	);
	return results.flat();
}

/**
 * Load all collection items from all sources (UBT + dev)
 */
export async function loadAllCollections(basePath: string = ''): Promise<CollectionItem[]> {
	const [ubtCollections, devCollections] = await Promise.all([
		loadAllUBTCollections(basePath),
		loadDevCollections(basePath)
	]);
	return [...ubtCollections, ...devCollections];
}

/**
 * Get list of available UBT collection names
 */
export function getUBTCollectionNames(): string[] {
	return [...UBT_COLLECTIONS];
}

/**
 * Load all data for the dashboard
 */
export async function loadAllData(basePath: string = '') {
	const [projects, persons, institutions, groups, allCollections] = await Promise.all([
		loadProjects(basePath),
		loadPersons(basePath),
		loadInstitutions(basePath),
		loadGroups(basePath),
		loadAllCollections(basePath)
	]);

	return {
		projects,
		persons,
		institutions,
		groups,
		collections: {
			all: allCollections
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
