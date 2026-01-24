<script lang="ts">
	import { theme, projects, selectedProjectId } from '$lib/stores/data';
	import Select from '$lib/components/ui/select.svelte';
	import Button from '$lib/components/ui/button.svelte';

	interface Props {
		onMenuClick?: () => void;
	}

	let { onMenuClick }: Props = $props();

	let projectOptions = $derived(
		$projects.map((p) => ({ value: p.id, label: p.name }))
	);

	function handleProjectChange(value: string) {
		$selectedProjectId = value || null;
	}

	function toggleTheme() {
		const newTheme = $theme === 'dark' ? 'light' : 'dark';
		theme.setTheme(newTheme);
	}
</script>

<header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
	<!-- Mobile menu button -->
	<Button variant="ghost" size="icon" class="lg:hidden" onclick={onMenuClick}>
		{#snippet children()}
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</svg>
		{/snippet}
	</Button>

	<!-- Page title area -->
	<div class="flex-1">
		<h1 class="text-lg font-semibold lg:text-xl">Dashboard</h1>
	</div>

	<!-- Project selector -->
	<div class="hidden md:block w-64">
		<Select
			options={projectOptions}
			value={$selectedProjectId || ''}
			placeholder="All Projects"
			onchange={handleProjectChange}
		/>
	</div>

	<!-- Theme toggle -->
	<Button variant="ghost" size="icon" onclick={toggleTheme}>
		{#snippet children()}
			{#if $theme === 'dark'}
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			{:else}
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			{/if}
		{/snippet}
	</Button>
</header>
