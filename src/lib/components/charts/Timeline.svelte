<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { TimelineDataPoint } from '$lib/types';
	import { cn } from '$lib/utils/cn';
	import { CHART_COLORS } from '$lib/styles';

	interface Props {
		data: TimelineDataPoint[];
		title?: string;
		class?: string;
		onclick?: (year: number) => void;
	}

	let { data, title = '', class: className = '', onclick }: Props = $props();

	let option: EChartsOption = $derived({
		title: title
			? {
					text: title,
					left: 'center',
					top: 0
				}
			: undefined,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			formatter: (params: unknown) => {
				const p = Array.isArray(params) ? params[0] : params;
				const d = p as { name: string; value: number };
				return `${d.name}: ${d.value} items`;
			}
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '15%',
			top: title ? '15%' : '10%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: data.map((d) => d.year.toString()),
			axisLabel: {
				rotate: 45
			}
		},
		yAxis: {
			type: 'value',
			name: 'Count'
		},
		dataZoom: [
			{
				type: 'inside',
				start: 0,
				end: 100
			},
			{
				start: 0,
				end: 100
			}
		],
		series: [
			{
				name: 'Documents',
				type: 'bar',
				data: data.map((d) => d.count),
				itemStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: CHART_COLORS[0] },
							{ offset: 1, color: CHART_COLORS[0] + 'bb' } // Slightly darker
						]
					},
					borderRadius: [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: CHART_COLORS[0] + 'cc'
					}
				}
			}
		]
	});

	function handleClick(params: unknown) {
		const p = params as { name: string };
		if (onclick && p.name) {
			onclick(parseInt(p.name));
		}
	}
</script>

<EChart {option} class={cn(className)} onclick={handleClick} />
