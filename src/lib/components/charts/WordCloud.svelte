<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import 'echarts-wordcloud';
	import type { ECharts } from 'echarts';
	import type { WordCloudDataPoint } from '$lib/types';
	import { theme } from '$lib/stores/data';
	import { cn } from '$lib/utils/cn';

	interface Props {
		data: WordCloudDataPoint[];
		title?: string;
		class?: string;
		onclick?: (word: string) => void;
	}

	let { data, title = '', class: className = '', onclick }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chartInstance: ECharts | null = null;

	const colors = [
		'#3b82f6',
		'#10b981',
		'#f59e0b',
		'#ef4444',
		'#8b5cf6',
		'#ec4899',
		'#06b6d4',
		'#84cc16'
	];

	function getOption() {
		const maxValue = Math.max(...data.map((d) => d.value));
		const minValue = Math.min(...data.map((d) => d.value));

		return {
			title: title
				? {
						text: title,
						left: 'center',
						top: 0,
						textStyle: {
							color: $theme === 'dark' ? '#f3f4f6' : '#111827'
						}
					}
				: undefined,
			tooltip: {
				show: true,
				formatter: (params: unknown) => {
					const p = params as { name: string; value: number };
					return `${p.name}: ${p.value}`;
				}
			},
			series: [
				{
					type: 'wordCloud',
					shape: 'circle',
					left: 'center',
					top: title ? '15%' : 'center',
					width: '90%',
					height: '80%',
					sizeRange: [12, 60],
					rotationRange: [-45, 45],
					rotationStep: 15,
					gridSize: 8,
					drawOutOfBound: false,
					textStyle: {
						fontFamily: 'Inter, sans-serif',
						fontWeight: 'bold',
						color: () => colors[Math.floor(Math.random() * colors.length)]
					},
					emphasis: {
						textStyle: {
							shadowBlur: 10,
							shadowColor: '#333'
						}
					},
					data: data.slice(0, 100).map((d) => ({
						name: d.name,
						value: d.value,
						textStyle: {
							color: colors[Math.floor(Math.random() * colors.length)]
						}
					}))
				}
			]
		};
	}

	function initChart() {
		if (!chartContainer) return;

		chartInstance = echarts.init(chartContainer);
		chartInstance.setOption(getOption());

		if (onclick) {
			chartInstance.on('click', (params) => {
				const p = params as { name: string };
				onclick(p.name);
			});
		}

		const resizeObserver = new ResizeObserver(() => {
			chartInstance?.resize();
		});
		resizeObserver.observe(chartContainer);

		return () => {
			resizeObserver.disconnect();
		};
	}

	$effect(() => {
		$theme;
		data;
		if (chartInstance) {
			chartInstance.setOption(getOption(), true);
		}
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
