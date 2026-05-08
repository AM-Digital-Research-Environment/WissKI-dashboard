<script lang="ts">
	import { base } from '$app/paths';
	import { theme } from '$lib/stores/data';
	import Button from '$lib/components/ui/button.svelte';
	import { Menu, Sun, Moon, Maximize, Minimize } from '@lucide/svelte';
	import { onMount } from 'svelte';

	interface Props {
		onMenuClick?: () => void;
		isSidebarCollapsed?: boolean;
	}

	let { onMenuClick }: Props = $props();

	function toggleTheme() {
		const newTheme = $theme === 'dark' ? 'light' : 'dark';
		theme.setTheme(newTheme);
	}

	// Fullscreen toggle. Useful when the dashboard is embedded as an iframe --
	// the browser Fullscreen API promotes the document to the entire viewport
	// (the parent page's iframe attribute `allow="fullscreen"` is required for
	// this to work cross-document).
	let isFullscreen = $state(false);

	function syncFullscreen() {
		isFullscreen = !!document.fullscreenElement;
	}

	async function toggleFullscreen() {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch {
			// Some browsers/iframe contexts block the request. Fall back silently.
		}
	}

	onMount(() => {
		syncFullscreen();
		document.addEventListener('fullscreenchange', syncFullscreen);
		return () => document.removeEventListener('fullscreenchange', syncFullscreen);
	});
</script>

<header class="header gap-2 lg:gap-4">
	<!-- Mobile menu button -->
	<Button
		variant="ghost"
		size="icon"
		class="lg:hidden flex-shrink-0"
		onclick={onMenuClick}
		aria-label="Open navigation menu"
	>
		{#snippet children()}
			<Menu class="h-5 w-5" />
		{/snippet}
	</Button>

	<!-- Page title area: cluster wordmark + product name -->
	<div class="flex-1 flex items-center gap-3 min-w-0">
		<a
			href="https://www.africamultiple.uni-bayreuth.de/"
			target="_blank"
			rel="noopener noreferrer"
			class="header-brand flex-shrink-0"
			aria-label="Africa Multiple Cluster of Excellence"
		>
			<img src="{base}/logos/africamultiple.webp" alt="Africa Multiple Cluster of Excellence" />
		</a>
		<span aria-hidden="true" class="header-divider hidden lg:block"></span>
		<h1 class="hidden lg:block header-title truncate">
			Africa Multiple Interactive Research Atlas
		</h1>
		<!-- Mobile: AMIRA (the app's short name, set in app.html and manifest.json).
		     Avoids truncating the long product name on narrow screens. -->
		<h1 class="lg:hidden font-display font-bold tracking-tight text-foreground flex-1">AMIRA</h1>
	</div>

	<!-- Right-side toggles grouped so the theme + fullscreen buttons sit close
	     together instead of inheriting the header's wide `gap-4`. -->
	<div class="flex items-center gap-0.5 flex-shrink-0">
		<!-- Theme toggle -->
		<Button
			variant="ghost"
			size="icon"
			onclick={toggleTheme}
			aria-label={$theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
		>
			{#snippet children()}
				<div class="relative w-5 h-5">
					{#if $theme === 'dark'}
						<Sun class="h-5 w-5 transition-transform duration-normal ease-out" />
					{:else}
						<Moon class="h-5 w-5 transition-transform duration-normal ease-out" />
					{/if}
				</div>
			{/snippet}
		</Button>

		<!-- Fullscreen toggle (useful when the dashboard is embedded in an iframe) -->
		<Button
			variant="ghost"
			size="icon"
			onclick={toggleFullscreen}
			aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
		>
			{#snippet children()}
				<div class="relative w-5 h-5">
					{#if isFullscreen}
						<Minimize class="h-5 w-5" />
					{:else}
						<Maximize class="h-5 w-5" />
					{/if}
				</div>
			{/snippet}
		</Button>
	</div>
</header>

<style>
	/* Africa Multiple wordmark plaque — gives the dark-grey "multiple" letters
	   a consistent reading surface in both light and dark themes. The plaque
	   is white-with-warmth so it sits gracefully on the cream light-mode
	   background without a hard edge. */
	.header-brand {
		display: inline-flex;
		align-items: center;
		padding: 4px 8px;
		border-radius: var(--radius-md);
		background: #fff;
		box-shadow: 0 0 0 1px hsl(var(--color-neutral-200) / 0.4);
		opacity: 0.95;
		transition:
			opacity 160ms ease,
			box-shadow 160ms ease;
	}
	.header-brand:hover {
		opacity: 1;
		/* Warm Braun ring on hover — the brand's earth accent says "this is
		   the institutional link" without competing with the green primary
		   that signals app state elsewhere. */
		box-shadow:
			0 0 0 1px hsl(var(--color-accent-500) / 0.55),
			var(--shadow-glow-accent);
	}
	.header-brand img {
		display: block;
		height: 24px;
		width: auto;
	}
	@media (min-width: 1024px) {
		.header-brand img {
			height: 28px;
		}
	}

	/* Vertical separator between the cluster brand and the product title */
	.header-divider {
		width: 1px;
		height: 24px;
		background: linear-gradient(
			180deg,
			transparent 0%,
			hsl(var(--border)) 30%,
			hsl(var(--border)) 70%,
			transparent 100%
		);
	}
</style>
