<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { EChartsOption, ECharts } from 'echarts';
	import { theme } from '$lib/stores/data';
	import { cn } from '$lib/utils/cn';

	interface Props {
		option: EChartsOption;
		class?: string;
		onclick?: (params: unknown) => void;
	}

	let { option, class: className = '', onclick }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chartInstance: ECharts | null = null;

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
</script>

<div bind:this={chartContainer} class={cn('w-full h-full min-h-[300px]', className)}></div>
