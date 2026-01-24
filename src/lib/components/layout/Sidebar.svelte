<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = true, onClose }: Props = $props();

	const navItems = [
		{ href: `${base}/`, label: 'Overview', icon: 'home' },
		{ href: `${base}/collections`, label: 'Collections', icon: 'folder' },
		{ href: `${base}/compare`, label: 'Compare', icon: 'bar-chart' },
		{ href: `${base}/projects`, label: 'Projects', icon: 'briefcase' },
		{ href: `${base}/network`, label: 'Network', icon: 'share-2' }
	];

	function isActive(href: string) {
		const path = $page.url.pathname;
		if (href === `${base}/`) {
			return path === `${base}/` || path === base;
		}
		return path.startsWith(href);
	}
</script>

<!-- Mobile overlay -->
{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		onclick={onClose}
		aria-label="Close sidebar"
	></button>
{/if}

<!-- Sidebar -->
<aside
	class={cn(
		'fixed top-0 left-0 z-50 h-full w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0',
		isOpen ? 'translate-x-0' : '-translate-x-full'
	)}
>
	<div class="flex h-full flex-col">
		<!-- Logo -->
		<div class="flex h-16 items-center border-b px-6">
			<a href="{base}/" class="flex items-center gap-2">
				<svg class="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
				<span class="text-xl font-bold">WissKI</span>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 p-4">
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
						isActive(item.href)
							? 'bg-primary/10 text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					)}
					onclick={onClose}
				>
					{#if item.icon === 'home'}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					{:else if item.icon === 'folder'}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
						</svg>
					{:else if item.icon === 'bar-chart'}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="20" x2="18" y2="10" />
							<line x1="12" y1="20" x2="12" y2="4" />
							<line x1="6" y1="20" x2="6" y2="14" />
						</svg>
					{:else if item.icon === 'briefcase'}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
							<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
						</svg>
					{:else if item.icon === 'share-2'}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
							<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
						</svg>
					{/if}
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t p-4">
			<p class="text-xs text-muted-foreground text-center">
				WissKI Dashboard v0.1
			</p>
		</div>
	</div>
</aside>
