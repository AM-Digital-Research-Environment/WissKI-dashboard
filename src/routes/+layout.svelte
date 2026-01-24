<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { Sidebar, Header } from '$lib/components/layout';
	import { initializeData, theme, isLoading, loadError } from '$lib/stores/data';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let sidebarOpen = $state(false);

	onMount(() => {
		// Initialize theme
		theme.init();

		// Load data
		if (browser) {
			initializeData(base);
		}
	});
</script>

<svelte:head>
	<title>WissKI Dashboard</title>
	<meta name="description" content="Interactive visualization dashboard for WissKI/MongoDB research data" />
</svelte:head>

<div class="flex min-h-screen">
	<Sidebar isOpen={sidebarOpen} onClose={() => sidebarOpen = false} />

	<div class="flex-1 flex flex-col lg:ml-0">
		<Header onMenuClick={() => sidebarOpen = !sidebarOpen} />

		<main class="flex-1 p-4 lg:p-6">
			{#if $isLoading}
				<div class="flex items-center justify-center h-64">
					<div class="text-center">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<p class="text-muted-foreground">Loading data...</p>
					</div>
				</div>
			{:else if $loadError}
				<div class="flex items-center justify-center h-64">
					<div class="text-center">
						<svg class="h-12 w-12 text-destructive mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<p class="text-destructive font-medium">Error loading data</p>
						<p class="text-sm text-muted-foreground mt-2">{$loadError}</p>
					</div>
				</div>
			{:else}
				{@render children()}
			{/if}
		</main>
	</div>
</div>
