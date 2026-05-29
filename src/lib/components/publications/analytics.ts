/**
 * Aggregate analytics over the publications dataset — the relational and
 * ranking views that complement the per-year / per-language / keyword charts
 * already on the page.
 *
 * All builders are pure: they read only their `publications` argument and
 * return plain data structures ready for a chart component, so they can be
 * unit-tested in isolation and called from a Svelte `$derived`.
 */

import type {
	Publication,
	PublicationContributor,
	NetworkData,
	BarChartDataPoint,
	ChordData
} from '$lib/types';

/** Normalised identity key for a contributor (BibTeX-normalised name). */
function contributorKey(c: PublicationContributor): string {
	return (c.normalized || c.raw || '').trim();
}

export interface CoauthorNetworkOptions {
	/** Cap the graph to the top N authors by collaboration degree. Default 120. */
	maxNodes?: number;
	/** Minimum number of co-authored works for an edge to count. Default 1. */
	minSharedWorks?: number;
}

/**
 * Build a co-authorship network from the publications' `authors` arrays: nodes
 * are authors (sized by publication count), edges connect authors who appear
 * together on at least `minSharedWorks` works (weighted by how many).
 *
 * Authors are split into two categories — those matched to a cluster person
 * profile (`person_id`) and external collaborators — so the graph reads as
 * "who in the cluster co-publishes, and with which outside co-authors". Authors
 * with no qualifying co-author edge are dropped (they'd be unconnected dots).
 *
 * Node `id`/`name` is the navigable display name (`person_name` when matched,
 * else the normalised name), matching the link target used elsewhere
 * (`/people?name=<name>`), so a click on a category-0 node can deep-link to the
 * person page.
 */
export function buildPublicationCoauthorNetwork(
	publications: Publication[],
	options: CoauthorNetworkOptions = {}
): NetworkData {
	const { maxNodes = 120, minSharedWorks = 1 } = options;

	// Pass 1: resolve a stable display/navigation name + "linked" flag per
	// author, keyed by the normalised form so spelling variants collapse onto
	// one identity. A matched `person_name` wins as the display name.
	const navByNorm = new Map<string, string>();
	const linkedByNorm = new Map<string, boolean>();
	for (const pub of publications) {
		for (const c of pub.authors ?? []) {
			const norm = contributorKey(c);
			if (!norm) continue;
			if (!navByNorm.has(norm)) navByNorm.set(norm, c.normalized || norm);
			if (c.person_id) {
				linkedByNorm.set(norm, true);
				if (c.person_name) navByNorm.set(norm, c.person_name);
			}
		}
	}

	// Pass 2: aggregate by the resolved nav name so two normalised variants that
	// resolve to the same matched person merge into one node.
	const pubCount = new Map<string, number>();
	const linked = new Map<string, boolean>();
	const pairCount = new Map<string, number>();

	for (const pub of publications) {
		const names: string[] = [];
		const seen = new Set<string>();
		for (const c of pub.authors ?? []) {
			const norm = contributorKey(c);
			if (!norm) continue;
			const nav = navByNorm.get(norm) ?? norm;
			if (seen.has(nav)) continue;
			seen.add(nav);
			names.push(nav);
			if (linkedByNorm.get(norm)) linked.set(nav, true);
			else if (!linked.has(nav)) linked.set(nav, false);
		}
		for (const nav of names) pubCount.set(nav, (pubCount.get(nav) ?? 0) + 1);
		for (let i = 0; i < names.length; i++) {
			for (let j = i + 1; j < names.length; j++) {
				const [a, b] = [names[i], names[j]].sort();
				const key = `${a}|||${b}`;
				pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
			}
		}
	}

	// Collaboration degree = summed weight of an author's qualifying edges.
	const degree = new Map<string, number>();
	for (const [key, count] of pairCount) {
		if (count < minSharedWorks) continue;
		const [a, b] = key.split('|||');
		degree.set(a, (degree.get(a) ?? 0) + count);
		degree.set(b, (degree.get(b) ?? 0) + count);
	}

	const kept = new Set(
		[...degree.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, maxNodes)
			.map(([name]) => name)
	);

	const maxPub = Math.max(1, ...[...kept].map((name) => pubCount.get(name) ?? 0));
	// Square-root sizing so a 30-paper author isn't 30× the area of a 1-paper one.
	const sizeFor = (n: number) => 12 + Math.sqrt(n / maxPub) * 26;

	const nodes: NetworkData['nodes'] = [];
	for (const name of kept) {
		nodes.push({
			id: name,
			name,
			category: linked.get(name) ? 0 : 1,
			symbolSize: sizeFor(pubCount.get(name) ?? 1)
		});
	}

	const links: NetworkData['links'] = [];
	for (const [key, count] of pairCount) {
		if (count < minSharedWorks) continue;
		const [a, b] = key.split('|||');
		if (!kept.has(a) || !kept.has(b)) continue;
		links.push({
			source: a,
			target: b,
			value: count,
			label: `${count} co-authored work${count === 1 ? '' : 's'}`,
			relation: 'direct'
		});
	}

	return {
		nodes,
		links,
		categories: [{ name: 'Cluster member' }, { name: 'External co-author' }]
	};
}

/**
 * Most prolific authors by distinct publication count. Labels use the
 * BibTeX-normalised "Last, First" form so a click can drive the page's free-text
 * search (which matches contributor `normalized`).
 */
export function buildTopAuthors(publications: Publication[], limit = 15): BarChartDataPoint[] {
	const counts = new Map<string, number>();
	for (const pub of publications) {
		const seen = new Set<string>();
		for (const c of pub.authors ?? []) {
			const norm = contributorKey(c);
			if (!norm || seen.has(norm)) continue;
			seen.add(norm);
			counts.set(norm, (counts.get(norm) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([name, value]) => ({ name, value }));
}

/**
 * Most frequent journals/venues by article count. Uses the `journal` field
 * (articles); records without one (books, chapters, working papers) are
 * skipped. Labels match `journal` so a click can drive the page search.
 */
export function buildTopVenues(publications: Publication[], limit = 15): BarChartDataPoint[] {
	const counts = new Map<string, number>();
	for (const pub of publications) {
		const venue = (pub.journal || '').trim();
		if (!venue) continue;
		counts.set(venue, (counts.get(venue) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([name, value]) => ({ name, value }));
}

export interface KeywordCoOccurrenceOptions {
	/** A keyword must appear on at least this many publications. Default 2. */
	minOccurrences?: number;
	/** Cap the chord to the top N keywords by frequency. Default 25. */
	maxKeywords?: number;
}

/**
 * Keyword co-occurrence matrix for a chord diagram: which keywords appear
 * together on the same publication. Keywords are lower-cased to merge case
 * variants (display casing is recovered from first sighting), de-duplicated per
 * publication, and restricted to the most frequent terms for legibility.
 */
export function buildKeywordCoOccurrence(
	publications: Publication[],
	options: KeywordCoOccurrenceOptions = {}
): ChordData {
	const { minOccurrences = 2, maxKeywords = 25 } = options;

	const counts = new Map<string, number>();
	const display = new Map<string, string>();
	for (const pub of publications) {
		const seen = new Set<string>();
		for (const kw of pub.keywords ?? []) {
			const key = kw.trim().toLowerCase();
			if (!key || seen.has(key)) continue;
			seen.add(key);
			counts.set(key, (counts.get(key) ?? 0) + 1);
			if (!display.has(key)) display.set(key, kw.trim());
		}
	}

	const top = [...counts.entries()]
		.filter(([, count]) => count >= minOccurrences)
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxKeywords)
		.map(([key]) => key);

	if (top.length === 0) return { names: [], matrix: [] };

	const index = new Map(top.map((key, i) => [key, i]));
	const n = top.length;
	const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

	for (const pub of publications) {
		const present = [
			...new Set(
				(pub.keywords ?? []).map((kw) => kw.trim().toLowerCase()).filter((key) => index.has(key))
			)
		];
		for (let i = 0; i < present.length; i++) {
			for (let j = i + 1; j < present.length; j++) {
				const a = index.get(present[i])!;
				const b = index.get(present[j])!;
				matrix[a][b]++;
				matrix[b][a]++;
			}
		}
	}

	return { names: top.map((key) => display.get(key) ?? key), matrix };
}
