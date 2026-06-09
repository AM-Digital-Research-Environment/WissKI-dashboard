/**
 * AMIRA → Africa Multiple Research Data (Omeka S) migration.
 *
 * The dashboard is being retired in favour of the Omeka S site at
 * `data.africamultiple.uni-bayreuth.de/s/amira`. This module is the single
 * source of truth for the migration UX so the cutover is a config edit, not a
 * code change:
 *
 *  - Phase 1 (current): a dismissible banner (see `MigrationNotice.svelte`,
 *    composed in `+layout.svelte`) points visitors at the new site, and
 *    `canonicalToNewSite` consolidates search-engine ranking onto it via the
 *    static `<link rel="canonical">` in `src/app.html`.
 *  - Phase 2 (cutover): set `redirect.enabled = true` to bounce every visitor
 *    to `targetUrl`, AND uncomment the `<meta http-equiv="refresh">` block in
 *    `src/app.html` so non-JS crawlers follow the move at parse time too.
 *
 * Bump `banner.storageKey` whenever the wording changes materially so visitors
 * who dismissed the previous message see the new one.
 */
export interface MigrationConfig {
	/** Master switch — `false` disables the banner, redirect and canonical. */
	enabled: boolean;
	/** Where visitors (and search engines) should go instead. */
	targetUrl: string;
	/**
	 * Brand/title shown in the copy. The new site shares this dashboard's name
	 * ("Africa Multiple Interactive Research Atlas"), so this names the Atlas
	 * itself — the copy frames the change as a move, not a switch to a
	 * differently-named site.
	 */
	siteName: string;
	banner: {
		/** Show the Phase 1 notice. */
		enabled: boolean;
		/** Offer a dismiss button and remember the choice in `localStorage`. */
		dismissible: boolean;
		/** `localStorage` key remembering a dismissal. Bump to re-show. */
		storageKey: string;
	};
	redirect: {
		/** Phase 2: redirect to `targetUrl` instead of showing the banner. */
		enabled: boolean;
		/** Seconds to wait before the redirect fires (0 = immediate). */
		delaySeconds: number;
	};
	/**
	 * Treat the new site as the canonical home for SEO. When `true`, the static
	 * `<link rel="canonical">` in `src/app.html` is the authoritative signal and
	 * `seo.svelte` suppresses its per-page self-canonical so the two never
	 * conflict (two `rel=canonical` tags make Google ignore both). To revert:
	 * set this to `false` AND remove the canonical link in `src/app.html`.
	 */
	canonicalToNewSite: boolean;
}

export const migrationConfig: MigrationConfig = {
	enabled: true,
	targetUrl: 'https://data.africamultiple.uni-bayreuth.de/s/amira',
	siteName: 'Africa Multiple Interactive Research Atlas (AMIRA)',
	banner: {
		enabled: true,
		dismissible: true,
		storageKey: 'amira-migration-notice-dismissed-v1'
	},
	redirect: {
		enabled: false,
		delaySeconds: 0
	},
	canonicalToNewSite: true
};
