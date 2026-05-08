<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { echarts } from '$lib/utils/echarts';
	import { CanvasRenderer } from 'echarts/renderers';
	import { TitleComponent, TooltipComponent } from 'echarts/components';
	import 'echarts-wordcloud';
	import type { EChartsType } from 'echarts/core';
	import type { WordCloudDataPoint } from '$lib/types';
	import { theme } from '$lib/stores/data';
	import { cn } from '$lib/utils/cn';
	import { CHART_COLORS, FONT_FAMILY, getEChartsTheme, getThemeColors } from '$lib/styles';
	import { getChartRegistry } from './chart-registry';

	// echarts-wordcloud registers its own series; we just need the renderer + components.
	echarts.use([CanvasRenderer, TitleComponent, TooltipComponent]);

	interface Props {
		data: WordCloudDataPoint[];
		title?: string;
		class?: string;
		maxWords?: number;
		onclick?: (word: string) => void;
	}

	let { data, title = '', class: className = '', maxWords = 100, onclick }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chartInstance: EChartsType | null = null;
	let initRaf: number | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
	let updateTimeout: ReturnType<typeof setTimeout> | null = null;
	const chartRegistry = getChartRegistry();

	// Stable color per word — echarts-wordcloud is recomputed on every
	// data/maxWords change, and re-randomising colours each pass made
	// surviving words visibly flicker as the slider was dragged.
	function colorFor(name: string) {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = (hash * 31 + name.charCodeAt(i)) | 0;
		}
		return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
	}

	function getOption() {
		const slicedData = data.slice(0, maxWords);
		const themeColors = getThemeColors($theme === 'dark');

		// Dynamic font size based on word count - fewer words = bigger fonts.
		// Sizes bumped up for readability.
		const minFontSize = maxWords <= 30 ? 18 : maxWords <= 60 ? 15 : 12;
		const maxFontSize = maxWords <= 30 ? 72 : maxWords <= 60 ? 60 : maxWords <= 100 ? 52 : 44;

		// Dynamic grid size — tighter packing so more words fit without gaps.
		const gridSize = maxWords <= 50 ? 3 : maxWords <= 100 ? 2 : 2;

		return {
			title: title
				? {
						text: title,
						left: 'center',
						top: 0,
						textStyle: {
							color: themeColors.foreground
						}
					}
				: undefined,
			tooltip: {
				confine: true,
				show: true,
				// Set the tooltip palette inline. echarts-wordcloud renders
				// its own tooltip path that doesn't merge the global theme's
				// tooltip styles, so we have to spell out backgroundColor /
				// borderColor / textStyle here. Without this the tooltip
				// stays white-on-light even in dark mode.
				backgroundColor: themeColors.chartTooltipBg,
				borderColor: themeColors.chartTooltipBorder,
				borderWidth: 1,
				padding: [8, 12],
				textStyle: {
					color: themeColors.chartText,
					fontFamily: FONT_FAMILY.sans,
					fontSize: 12
				},
				extraCssText: 'border-radius: 8px; box-shadow: 0 10px 30px -10px hsl(0 0% 0% / 0.4);',
				formatter: (params: unknown) => {
					const p = params as { name: string; value: number };
					return `${p.name}: ${p.value}`;
				}
			},
			series: [
				{
					type: 'wordCloud',
					// 'pentagon' fills the rectangle more evenly than the default
					// 'circle', which tends to cluster in the middle and leave
					// the top/bottom of wide containers blank. Inset slightly so
					// rotated edge words stay within the card rather than being
					// clipped by its border.
					shape: 'pentagon',
					left: '2%',
					top: '2%',
					width: '96%',
					height: '96%',
					sizeRange: [minFontSize, maxFontSize],
					rotationRange: [-45, 45],
					rotationStep: 15,
					gridSize: gridSize,
					drawOutOfBound: false,
					shrinkToFit: true,
					textStyle: {
						fontFamily: FONT_FAMILY.sans,
						fontWeight: 'bold'
					},
					emphasis: {
						textStyle: {
							shadowBlur: 10,
							shadowColor: themeColors.foreground
						}
					},
					data: slicedData.map((d) => ({
						name: d.name,
						value: d.value,
						textStyle: {
							color: colorFor(d.name)
						}
					}))
				}
			]
		};
	}

	function applyTheme() {
		if (!chartInstance) return;
		const themeConfig = getEChartsTheme($theme === 'dark');
		// ECharts 6: setTheme() lets us swap the tooltip / text palette
		// without disposing the chart. WordCloud previously skipped this
		// call, so its tooltip stayed light-on-light in dark mode.
		if (typeof chartInstance.setTheme === 'function') {
			chartInstance.setTheme(themeConfig);
		}
	}

	function initChart() {
		if (!chartContainer) return;

		chartInstance = echarts.init(chartContainer);
		applyTheme();
		chartInstance.setOption(getOption());

		if (onclick) {
			chartInstance.on('click', (params) => {
				const p = params as { name: string };
				onclick(p.name);
			});
		}

		if (chartRegistry && !chartRegistry.instance) {
			chartRegistry.instance = chartInstance;
		}

		// Throttle resize callbacks so bursty observer fires don't each
		// trigger a synchronous layout query / render pass.
		resizeObserver = new ResizeObserver(() => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => chartInstance?.resize(), 100);
		});
		resizeObserver.observe(chartContainer);
	}

	function renderNow() {
		if (!chartInstance) return;
		applyTheme();
		// Wipe the canvas before re-laying out. echarts-wordcloud chunks its
		// placement via setTimeout(0); without clear(), a previous chain can
		// keep painting while the new one starts, leaving stale words behind
		// the new layout.
		chartInstance.clear();
		chartInstance.setOption(getOption(), true);
	}

	$effect(() => {
		$theme;
		data;
		maxWords;
		if (!chartInstance) return;
		// Debounce: dragging the range slider fires input events at ~60Hz.
		// Each layout pass does collision detection over every word, so
		// without coalescing, several layouts overlap on the canvas and the
		// words pile on top of each other.
		if (updateTimeout) clearTimeout(updateTimeout);
		updateTimeout = setTimeout(renderNow, 120);
	});

	onMount(() => {
		// Defer init to next frame so the surrounding layout paints first
		// before ECharts queries `offsetWidth` and forces a reflow.
		initRaf = requestAnimationFrame(() => {
			initRaf = null;
			initChart();
		});
	});

	onDestroy(() => {
		if (initRaf !== null) {
			cancelAnimationFrame(initRaf);
			initRaf = null;
		}
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
			resizeTimeout = null;
		}
		if (updateTimeout) {
			clearTimeout(updateTimeout);
			updateTimeout = null;
		}
		resizeObserver?.disconnect();
		resizeObserver = null;
		if (chartRegistry && chartRegistry.instance === chartInstance) {
			chartRegistry.instance = null;
		}
		chartInstance?.dispose();
		chartInstance = null;
	});
</script>

<div bind:this={chartContainer} class={cn('w-full h-full min-h-chart-sm', className)}></div>
