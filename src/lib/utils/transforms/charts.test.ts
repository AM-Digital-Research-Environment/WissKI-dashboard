import { describe, it, expect } from 'vitest';
import { buildHeatmapData, buildTopCategoryTimeline } from './charts';
import type { CollectionItem } from '$lib/types';

describe('buildHeatmapData', () => {
	it('counts (x, y) pairs across items in ranked order', () => {
		const items = [
			{ a: 'A', b: 'P' },
			{ a: 'A', b: 'P' },
			{ a: 'A', b: 'P' },
			{ a: 'B', b: 'P' },
			{ a: 'A', b: 'Q' },
			{ a: 'A', b: 'Q' }
		] as unknown as CollectionItem[];

		const result = buildHeatmapData(
			items,
			(i) => (i as unknown as { a: string }).a,
			(i) => (i as unknown as { b: string }).b
		);

		// x ranked A(5) > B(1); y ranked P(4) > Q(2). Zero cells (B×Q) dropped.
		expect(result).toEqual([
			{ x: 'A', y: 'P', value: 3 },
			{ x: 'A', y: 'Q', value: 2 },
			{ x: 'B', y: 'P', value: 1 }
		]);
	});

	it('de-duplicates repeated values within an item when dedupePerItem is set', () => {
		const items = [
			{ langs: ['L1', 'L1'], genres: ['G1'] },
			{ langs: ['L1'], genres: ['G1', 'G1'] }
		] as unknown as CollectionItem[];

		const result = buildHeatmapData(
			items,
			(i) => (i as unknown as { langs: string[] }).langs,
			(i) => (i as unknown as { genres: string[] }).genres,
			{ dedupePerItem: true }
		);

		// Each item contributes the (L1, G1) cell exactly once despite the dupes.
		expect(result).toEqual([{ x: 'L1', y: 'G1', value: 2 }]);
	});

	it('counts with multiplicity when dedupePerItem is off (default)', () => {
		const items = [{ langs: ['L1', 'L1'], genres: ['G1'] }] as unknown as CollectionItem[];

		const result = buildHeatmapData(
			items,
			(i) => (i as unknown as { langs: string[] }).langs,
			(i) => (i as unknown as { genres: string[] }).genres
		);

		expect(result).toEqual([{ x: 'L1', y: 'G1', value: 2 }]);
	});

	it('limits the axes to the top maxX / maxY categories', () => {
		const items = [
			{ a: 'A', b: 'P' },
			{ a: 'A', b: 'P' },
			{ a: 'B', b: 'P' },
			{ a: 'C', b: 'P' }
		] as unknown as CollectionItem[];

		const result = buildHeatmapData(
			items,
			(i) => (i as unknown as { a: string }).a,
			(i) => (i as unknown as { b: string }).b,
			{ maxX: 1 }
		);

		// Only the top x-category (A) survives.
		expect(result).toEqual([{ x: 'A', y: 'P', value: 2 }]);
	});

	it('ignores blank and missing values', () => {
		const items = [
			{ a: '  ', b: 'P' },
			{ a: 'A', b: null },
			{ a: 'A', b: 'P' }
		] as unknown as CollectionItem[];

		const result = buildHeatmapData(
			items,
			(i) => (i as unknown as { a: string }).a,
			(i) => (i as unknown as { b: string | null }).b
		);

		expect(result).toEqual([{ x: 'A', y: 'P', value: 1 }]);
	});

	it('returns an empty array for empty input', () => {
		expect(
			buildHeatmapData(
				[],
				() => 'x',
				() => 'y'
			)
		).toEqual([]);
	});
});

describe('buildTopCategoryTimeline', () => {
	interface Row {
		year: number | null;
		labels: string[];
	}
	const opts = (topNames: string[], otherBucket?: string) => ({
		getYear: (r: Row) => r.year,
		getLabels: (r: Row) => r.labels,
		topNames,
		otherBucket
	});

	it('aggregates top-category counts per year', () => {
		const rows: Row[] = [
			{ year: 2020, labels: ['A', 'B'] },
			{ year: 2020, labels: ['A', 'C'] },
			{ year: 2021, labels: ['B'] }
		];
		expect(buildTopCategoryTimeline(rows, opts(['A', 'B']))).toEqual([
			{ year: 2020, byCategory: { A: 2, B: 1 } },
			{ year: 2021, byCategory: { B: 1 } }
		]);
	});

	it('folds non-top labels into the otherBucket when provided', () => {
		const rows: Row[] = [
			{ year: 2020, labels: ['A', 'B'] },
			{ year: 2020, labels: ['A', 'C'] }
		];
		expect(buildTopCategoryTimeline(rows, opts(['A', 'B'], 'Other'))).toEqual([
			{ year: 2020, byCategory: { A: 2, B: 1, Other: 1 } }
		]);
	});

	it('de-duplicates repeated labels within an item', () => {
		const rows: Row[] = [{ year: 2020, labels: ['A', 'A', 'B'] }];
		expect(buildTopCategoryTimeline(rows, opts(['A', 'B']))).toEqual([
			{ year: 2020, byCategory: { A: 1, B: 1 } }
		]);
	});

	it('skips items with no resolvable year and sorts ascending', () => {
		const rows: Row[] = [
			{ year: 2022, labels: ['A'] },
			{ year: null, labels: ['A'] },
			{ year: 2020, labels: ['A'] }
		];
		expect(buildTopCategoryTimeline(rows, opts(['A']))).toEqual([
			{ year: 2020, byCategory: { A: 1 } },
			{ year: 2022, byCategory: { A: 1 } }
		]);
	});

	it('returns an empty array when no labels are in the top set and no otherBucket', () => {
		const rows: Row[] = [{ year: 2020, labels: ['X', 'Y'] }];
		expect(buildTopCategoryTimeline(rows, opts([]))).toEqual([]);
	});
});
