<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { EChartsOption, ECharts } from 'echarts';
	import { theme } from '$lib/stores/data';
	import { cn } from '$lib/utils/cn';
	import { getEChartsTheme } from '$lib/styles';
	import { ZoomIn, ZoomOut, RotateCcw } from '@lucide/svelte';

	interface Props {
		option: EChartsOption;
		class?: string;
		showZoomControls?: boolean;
		onclick?: (params: unknown) => void;
	}

	let { option, class: className = '', showZoomControls = true, onclick }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chartInstance: ECharts | null = null;
	let zoomLevel = $state(1);

	function initChart() {
		if (!chartContainer) return;

		chartInstance = echarts.init(chartContainer);
		updateChart();

		if (onclick) {
			chartInstance.on('click', onclick);
		}

		// Handle resize
		const resizeObserver = new ResizeObserver(() => {
			chartInstance?.resize();
		});
		resizeObserver.observe(chartContainer);

		return () => {
			resizeObserver.disconnect();
		};
	}

	function updateChart() {
		if (!chartInstance) return;

		const themeConfig = getEChartsTheme($theme === 'dark');
		const mergedOption = echarts.util.merge(
			echarts.util.clone(themeConfig),
			option,
			true
		);

		chartInstance.setOption(mergedOption, true);
	}

	// React to theme changes
	$effect(() => {
		$theme; // subscribe to theme
		updateChart();
	});

	// React to option changes
	$effect(() => {
		option; // subscribe to option
		updateChart();
	});

	onMount(() => {
		const cleanup = initChart();
		return cleanup;
	});

	onDestroy(() => {
		chartInstance?.dispose();
	});

	function zoomIn() {
		if (!chartInstance) return;
		zoomLevel = Math.min(zoomLevel * 1.2, 5);
		applyZoom();
	}

	function zoomOut() {
		if (!chartInstance) return;
		zoomLevel = Math.max(zoomLevel / 1.2, 0.5);
		applyZoom();
	}

	function resetZoom() {
		if (!chartInstance) return;
		zoomLevel = 1;
		applyZoom();
		// Also reset dataZoom if present
		chartInstance.dispatchAction({
			type: 'dataZoom',
			start: 0,
			end: 100
		});
	}

	function applyZoom() {
		if (!chartInstance) return;
		// Apply zoom using ECharts graphic transform
		const currentOption = chartInstance.getOption();
		const seriesType = (currentOption?.series as { type: string }[])?.[0]?.type;

		// For graph, sankey, sunburst - use roam zoom
		if (['graph', 'sankey', 'sunburst', 'tree', 'treemap'].includes(seriesType)) {
			chartInstance.setOption({
				series: [{
					zoom: zoomLevel,
					center: ['50%', '50%']
				}]
			});
		} else {
			// For other charts, use dataZoom
			const zoomStart = Math.max(0, 50 - (50 / zoomLevel));
			const zoomEnd = Math.min(100, 50 + (50 / zoomLevel));
			chartInstance.dispatchAction({
				type: 'dataZoom',
				start: zoomStart,
				end: zoomEnd
			});
		}
	}
</script>

<div class={cn('relative w-full h-full', className)}>
	<div bind:this={chartContainer} class="w-full h-full"></div>

	{#if showZoomControls}
		<div class="absolute top-2 right-2 flex flex-col gap-1 z-10">
			<button
				type="button"
				onclick={zoomIn}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Zoom in"
			>
				<ZoomIn class="w-4 h-4" />
			</button>
			<button
				type="button"
				onclick={zoomOut}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Zoom out"
			>
				<ZoomOut class="w-4 h-4" />
			</button>
			<button
				type="button"
				onclick={resetZoom}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Reset zoom"
			>
				<RotateCcw class="w-4 h-4" />
			</button>
		</div>
	{/if}
</div>
