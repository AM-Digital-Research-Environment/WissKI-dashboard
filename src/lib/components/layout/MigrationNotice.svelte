<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Megaphone, X } from '@lucide/svelte';

	interface Props {
		/** Destination visitors (and search engines) should move to. */
		targetUrl: string;
		/** Name of the Atlas, shown in the copy. The new site shares this name,
		 *  so the copy frames the change as a move rather than a new destination. */
		siteName: string;
		/** Offer a dismiss button and remember the choice in `localStorage`. */
		dismissible?: boolean;
		/** `localStorage` key remembering a dismissal. */
		storageKey?: string;
		/** Phase 2: redirect to `targetUrl` instead of showing the banner. */
		redirect?: boolean;
		/** Seconds to wait before the Phase 2 redirect fires (0 = immediate). */
		redirectDelaySeconds?: number;
	}

	let {
		targetUrl,
		siteName,
		dismissible = true,
		storageKey = 'amira-migration-notice-dismissed',
		redirect = false,
		redirectDelaySeconds = 0
	}: Props = $props();

	// Hidden until onMount resolves the dismissal state so visitors who already
	// dismissed never see a flash of the banner. The app is client-rendered
	// (ssr = false), so the first paint happens here anyway.
	let visible = $state(false);
	let redirecting = $state(false);

	onMount(() => {
		if (redirect) {
			// Phase 2 cutover. `replace` keeps the retired URL out of the
			// back-button history. In practice the `<meta http-equiv="refresh">`
			// in app.html fires first (before hydration); this is the JS fallback
			// for clients that ignore the refresh, and the interstitial below is
			// the no-JS-redirect fallback.
			redirecting = true;
			const go = () => window.location.replace(targetUrl);
			if (redirectDelaySeconds > 0) {
				const timer = setTimeout(go, redirectDelaySeconds * 1000);
				return () => clearTimeout(timer);
			}
			go();
			return;
		}
		if (!dismissible) {
			visible = true;
			return;
		}
		// localStorage can throw in privacy modes or sandboxed iframe embeds.
		// Fail open — a deprecation notice that can't read its dismissal flag
		// should still be shown.
		try {
			visible = localStorage.getItem(storageKey) !== '1';
		} catch {
			visible = true;
		}
	});

	function dismiss() {
		visible = false;
		if (!dismissible) return;
		try {
			localStorage.setItem(storageKey, '1');
		} catch {
			// No persistence available — dismissed for this session only.
		}
	}
</script>

{#if redirecting}
	<!-- Phase 2: full-screen "we've moved" interstitial shown while the redirect
	     fires. Covers everything so it reads cleanly regardless of where the
	     component is mounted. The link is the fallback if the redirect is
	     blocked. -->
	<div
		class="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background p-6 text-center"
		style="z-index: var(--z-max)"
		role="status"
		aria-live="polite"
	>
		<p class="text-sm text-muted-foreground">
			The {siteName} has moved. Taking you to the new site…
		</p>
		<a
			href={targetUrl}
			class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm ring-offset-background transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			Continue to the new site
			<ArrowRight class="h-4 w-4" />
		</a>
	</div>
{:else if visible}
	<aside
		class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-primary/25 bg-primary/[0.08] px-4 py-2.5 print:hidden"
		aria-label="Site migration notice"
	>
		<Megaphone class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
		<p class="min-w-[12rem] flex-1 text-sm text-foreground">
			The <strong class="font-semibold">{siteName}</strong> has moved to a new home. This version is no
			longer updated.
		</p>
		<a
			href={targetUrl}
			class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm ring-offset-background transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			Go to the new site
			<ArrowRight class="h-4 w-4" />
		</a>
		{#if dismissible}
			<button
				type="button"
				onclick={dismiss}
				class="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label="Dismiss migration notice"
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</aside>
{/if}
