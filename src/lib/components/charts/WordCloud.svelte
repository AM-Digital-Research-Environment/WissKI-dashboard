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
		maxWords?: number;
		onclick?: (word: string) => void;
	}

	let { data, title = '', class: className = '', maxWords = 100, onclick }: Props = $props();

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
		const slicedData = data.slice(0, maxWords);

		// Dynamic font size based on word count - fewer words = bigger fonts
		const minFontSize = maxWords <= 30 ? 14 : maxWords <= 60 ? 12 : 10;
		const maxFontSize = maxWords <= 30 ? 64 : maxWords <= 60 ? 52 : maxWords <= 100 ? 44 : 36;

		// Dynamic grid size - more words need tighter packing
		const gridSize = maxWords <= 50 ? 4 : maxWords <= 100 ? 3 : 2;

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
					top: 'center',
					width: '100%',
					height: '100%',
					sizeRange: [minFontSize, maxFontSize],
					rotationRange: [-45, 45],
					rotationStep: 15,
					gridSize: gridSize,
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
					data: slicedData.map((d) => ({
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
		maxWords;
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
