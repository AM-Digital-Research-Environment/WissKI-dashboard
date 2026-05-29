import { describe, it, expect } from 'vitest';
import {
	buildPublicationCoauthorNetwork,
	buildTopAuthors,
	buildTopVenues,
	buildKeywordCoOccurrence
} from './analytics';
import type { Publication } from '$lib/types';

/** Minimal publication factory — only the fields the analytics read. */
function pub(partial: Partial<Publication>): Publication {
	return partial as unknown as Publication;
}

describe('buildPublicationCoauthorNetwork', () => {
	const pubs = [
		pub({
			authors: [
				{ raw: 'A', normalized: 'A', person_id: 'pa', person_name: 'A' },
				{ raw: 'B', normalized: 'B', person_id: 'pb', person_name: 'B' }
			]
		}),
		pub({
			authors: [
				{ raw: 'A', normalized: 'A', person_id: 'pa', person_name: 'A' },
				{ raw: 'C', normalized: 'C' }
			]
		}),
		pub({ authors: [{ raw: 'A', normalized: 'A', person_id: 'pa', person_name: 'A' }] }),
		pub({ authors: [{ raw: 'D', normalized: 'D' }] })
	];

	it('connects co-authors and drops authors with no co-author edge', () => {
		const net = buildPublicationCoauthorNetwork(pubs);
		const ids = net.nodes.map((n) => n.id).sort();
		// D only ever appears solo, so it is excluded.
		expect(ids).toEqual(['A', 'B', 'C']);
		expect(net.links).toHaveLength(2);
		const edge = net.links.find((l) => l.source === 'A' && l.target === 'C');
		expect(edge?.value).toBe(1);
	});

	it('categorises matched authors (0) vs external co-authors (1)', () => {
		const net = buildPublicationCoauthorNetwork(pubs);
		expect(net.nodes.find((n) => n.id === 'A')?.category).toBe(0);
		expect(net.nodes.find((n) => n.id === 'C')?.category).toBe(1);
		expect(net.categories).toEqual([{ name: 'Cluster member' }, { name: 'External co-author' }]);
	});

	it('sizes nodes by publication count', () => {
		const net = buildPublicationCoauthorNetwork(pubs);
		const a = net.nodes.find((n) => n.id === 'A')!; // 3 papers
		const b = net.nodes.find((n) => n.id === 'B')!; // 1 paper
		expect(a.symbolSize).toBeGreaterThan(b.symbolSize);
	});

	it('merges normalised variants that resolve to the same matched person', () => {
		const merged = [
			pub({
				authors: [
					{ raw: 'Doe, J', normalized: 'Doe, J', person_id: 'x', person_name: 'Jane Doe' },
					{ raw: 'Roe, R', normalized: 'Roe, R' }
				]
			}),
			pub({
				authors: [
					{ raw: 'Doe, J', normalized: 'Doe, J' },
					{ raw: 'Roe, R', normalized: 'Roe, R' }
				]
			})
		];
		const net = buildPublicationCoauthorNetwork(merged);
		const jane = net.nodes.find((n) => n.id === 'Jane Doe');
		expect(jane).toBeDefined();
		expect(jane?.category).toBe(0);
		expect(net.nodes).toHaveLength(2);
		expect(net.links[0]?.value).toBe(2);
	});

	it('honours the minSharedWorks threshold', () => {
		const net = buildPublicationCoauthorNetwork(pubs, { minSharedWorks: 2 });
		// Every pair here shares only one work, so nothing qualifies.
		expect(net.nodes).toHaveLength(0);
		expect(net.links).toHaveLength(0);
	});
});

describe('buildTopAuthors', () => {
	it('ranks authors by distinct publication count', () => {
		const pubs = [
			pub({
				authors: [
					{ raw: 'A', normalized: 'A' },
					{ raw: 'B', normalized: 'B' }
				]
			}),
			pub({ authors: [{ raw: 'A', normalized: 'A' }] }),
			pub({
				authors: [
					{ raw: 'A', normalized: 'A' },
					{ raw: 'B', normalized: 'B' },
					{ raw: 'C', normalized: 'C' }
				]
			})
		];
		expect(buildTopAuthors(pubs, 2)).toEqual([
			{ name: 'A', value: 3 },
			{ name: 'B', value: 2 }
		]);
	});

	it('counts an author once per publication even if listed twice', () => {
		const pubs = [
			pub({
				authors: [
					{ raw: 'A', normalized: 'A' },
					{ raw: 'A', normalized: 'A' }
				]
			})
		];
		expect(buildTopAuthors(pubs)).toEqual([{ name: 'A', value: 1 }]);
	});
});

describe('buildTopVenues', () => {
	it('ranks journals and skips records without one', () => {
		const pubs = [pub({ journal: 'J1' }), pub({ journal: 'J1' }), pub({ journal: 'J2' }), pub({})];
		expect(buildTopVenues(pubs)).toEqual([
			{ name: 'J1', value: 2 },
			{ name: 'J2', value: 1 }
		]);
	});
});

describe('buildKeywordCoOccurrence', () => {
	it('builds a symmetric co-occurrence matrix over the top keywords', () => {
		const pubs = [
			pub({ keywords: ['Islam', 'Mali'] }),
			pub({ keywords: ['Islam', 'Mali'] }),
			pub({ keywords: ['Islam', 'Niger'] })
		];
		const chord = buildKeywordCoOccurrence(pubs, { minOccurrences: 2 });
		// Niger appears once → excluded by minOccurrences.
		expect(chord.names).toEqual(['Islam', 'Mali']);
		expect(chord.matrix).toEqual([
			[0, 2],
			[2, 0]
		]);
	});

	it('merges case variants and keeps first-seen display casing', () => {
		const pubs = [pub({ keywords: ['African Studies'] }), pub({ keywords: ['african studies'] })];
		const chord = buildKeywordCoOccurrence(pubs, { minOccurrences: 2 });
		expect(chord.names).toEqual(['African Studies']);
	});

	it('returns empty data when nothing clears the threshold', () => {
		const chord = buildKeywordCoOccurrence([pub({ keywords: ['solo'] })], { minOccurrences: 2 });
		expect(chord).toEqual({ names: [], matrix: [] });
	});
});
