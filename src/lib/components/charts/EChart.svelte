<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { EChartsOption, ECharts } from 'echarts';
	import { theme } from '$lib/stores/data';
	import { cn } from '$lib/utils/cn';

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

	const darkTheme = {
		backgroundColor: 'transparent',
		textStyle: {
			color: '#e5e7eb'
		},
		title: {
			textStyle: {
				color: '#f3f4f6'
			}
		},
		legend: {
			textStyle: {
				color: '#9ca3af'
			}
		},
		tooltip: {
			backgroundColor: 'rgba(17, 24, 39, 0.95)',
			borderColor: '#374151',
			textStyle: {
				color: '#f3f4f6'
			}
		},
		xAxis: {
			axisLine: {
				lineStyle: { color: '#374151' }
			},
			axisLabel: {
				color: '#9ca3af'
			},
			splitLine: {
				lineStyle: { color: '#1f2937' }
			}
		},
		yAxis: {
			axisLine: {
				lineStyle: { color: '#374151' }
			},
			axisLabel: {
				color: '#9ca3af'
			},
			splitLine: {
				lineStyle: { color: '#1f2937' }
			}
		}
	};

	const lightTheme = {
		backgroundColor: 'transparent',
		textStyle: {
			color: '#1f2937'
		},
		title: {
			textStyle: {
				color: '#111827'
			}
		},
		legend: {
			textStyle: {
				color: '#4b5563'
			}
		},
		tooltip: {
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			textStyle: {
				color: '#1f2937'
			}
		},
		xAxis: {
			axisLine: {
				lineStyle: { color: '#d1d5db' }
			},
			axisLabel: {
				color: '#4b5563'
			},
			splitLine: {
				lineStyle: { color: '#f3f4f6' }
			}
		},
		yAxis: {
			axisLine: {
				lineStyle: { color: '#d1d5db' }
			},
			axisLabel: {
				color: '#4b5563'
			},
			splitLine: {
				lineStyle: { color: '#f3f4f6' }
			}
		}
	};

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

		const themeConfig = $theme === 'dark' ? darkTheme : lightTheme;
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

<div class={cn('relative w-full h-full min-h-[300px]', className)}>
	<div bind:this={chartContainer} class="w-full h-full"></div>

	{#if showZoomControls}
		<div class="absolute top-2 right-2 flex flex-col gap-1 z-10">
			<button
				type="button"
				onclick={zoomIn}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Zoom in"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
					<line x1="11" y1="8" x2="11" y2="14" />
					<line x1="8" y1="11" x2="14" y2="11" />
				</svg>
			</button>
			<button
				type="button"
				onclick={zoomOut}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Zoom out"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
					<line x1="8" y1="11" x2="14" y2="11" />
				</svg>
			</button>
			<button
				type="button"
				onclick={resetZoom}
				class="w-8 h-8 flex items-center justify-center rounded bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors backdrop-blur-sm"
				title="Reset zoom"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
				</svg>
			</button>
		</div>
	{/if}
</div>
