<script lang="ts">
	/**
	 * Loading placeholder. Size and shape it with utility classes via `class`
	 * (e.g. `h-4 w-32`, or `h-10 w-10 rounded-full`). Defaults to a pulsing
	 * muted block; pass `variant="shimmer"` for the sweeping gradient. Marked
	 * `aria-hidden` so screen readers skip the decorative placeholder — pair it
	 * with an `aria-live`/`aria-busy` region for status announcements.
	 */
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		variant?: 'pulse' | 'shimmer';
	}

	let { class: className = '', variant = 'pulse' }: Props = $props();
</script>

<div
	class={cn(
		'rounded-md',
		variant === 'shimmer' ? 'animate-shimmer' : 'animate-pulse bg-muted',
		className
	)}
	aria-hidden="true"
></div>
