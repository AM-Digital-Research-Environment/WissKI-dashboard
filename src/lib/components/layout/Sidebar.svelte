<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	interface Props {
		isOpen?: boolean;
		isCollapsed?: boolean;
		onClose?: () => void;
		onToggleCollapse?: () => void;
	}

	let {
		isOpen = false,
		isCollapsed = false,
		onClose,
		onToggleCollapse
	}: Props = $props();

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

	function handleNavClick() {
		// Close mobile sidebar on navigation
		if (window.innerWidth < 1024) {
			onClose?.();
		}
	}
</script>

<!-- Mobile overlay -->
<button
	type="button"
	class="sidebar-overlay lg:hidden"
	data-visible={isOpen}
	onclick={onClose}
	aria-label="Close sidebar"
></button>

<!-- Sidebar wrapper for layout spacing -->
<div
	class="sidebar-wrapper hidden lg:block"
	data-collapsed={isCollapsed}
>
	<!-- This div takes up space in the layout -->
</div>

<!-- Sidebar -->
<aside
	class="sidebar"
	data-collapsed={isCollapsed}
	data-open={isOpen}
>
	<!-- Header -->
	<div class="sidebar-header">
		<a href="{base}/" class="sidebar-logo">
			<div class="sidebar-logo-icon">
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
			</div>
			<span class="sidebar-logo-text">WissKI</span>
		</a>

		<!-- Desktop collapse toggle -->
		<button
			type="button"
			class="sidebar-toggle ml-auto hidden lg:flex"
			onclick={onToggleCollapse}
			aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<svg class="sidebar-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M11 17l-5-5 5-5" />
				<path d="M18 17l-5-5 5-5" />
			</svg>
		</button>

		<!-- Mobile close button -->
		<button
			type="button"
			class="sidebar-toggle ml-auto lg:hidden"
			onclick={onClose}
			aria-label="Close sidebar"
		>
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M18 6L6 18" />
				<path d="M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Content -->
	<div class="sidebar-content">
		<div class="sidebar-group">
			<div class="sidebar-group-label">Navigation</div>
			<nav>
				{#each navItems as item}
					<a
						href={item.href}
						class={cn('sidebar-nav-item', isActive(item.href) && 'active')}
						onclick={handleNavClick}
						title={isCollapsed ? item.label : undefined}
					>
						<span class="sidebar-nav-icon">
							{#if item.icon === 'home'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
									<polyline points="9 22 9 12 15 12 15 22" />
								</svg>
							{:else if item.icon === 'folder'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
								</svg>
							{:else if item.icon === 'bar-chart'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="20" x2="18" y2="10" />
									<line x1="12" y1="20" x2="12" y2="4" />
									<line x1="6" y1="20" x2="6" y2="14" />
								</svg>
							{:else if item.icon === 'briefcase'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
									<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
								</svg>
							{:else if item.icon === 'share-2'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="18" cy="5" r="3" />
									<circle cx="6" cy="12" r="3" />
									<circle cx="18" cy="19" r="3" />
									<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
									<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
								</svg>
							{/if}
						</span>
						<span class="sidebar-nav-label">{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</div>

	<!-- Footer -->
	<div class="sidebar-footer">
		<div class="sidebar-footer-card">
			<p class="text-xs font-medium" style="color: hsl(var(--sidebar-foreground))">
				Research Dashboard
			</p>
			<p class="text-2xs mt-1" style="color: hsl(var(--sidebar-muted-foreground))">
				v0.1.0
			</p>
		</div>
	</div>

	<!-- Rail for resize/toggle (desktop only) -->
	<button
		type="button"
		class="sidebar-rail hidden lg:flex"
		onclick={onToggleCollapse}
		aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
	></button>
</aside>
