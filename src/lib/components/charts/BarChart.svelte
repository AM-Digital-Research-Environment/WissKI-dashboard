<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { BarChartDataPoint } from '$lib/types';
	import { cn } from '$lib/utils/cn';

	interface Props {
		data: BarChartDataPoint[];
		title?: string;
		maxItems?: number;
		horizontal?: boolean;
		class?: string;
		onclick?: (name: string) => void;
	}

	let {
		data,
		title = '',
		maxItems = 10,
		horizontal = true,
		class: className = '',
		onclick
	}: Props = $props();

	let displayData = $derived(data.slice(0, maxItems));

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
			}
		},
		grid: {
			left: horizontal ? '30%' : '3%',
			right: '4%',
			bottom: horizontal ? '3%' : '15%',
			top: title ? '15%' : '10%',
			containLabel: true
		},
		xAxis: horizontal
			? {
					type: 'value'
				}
			: {
					type: 'category',
					data: displayData.map((d) => d.name),
					axisLabel: {
						rotate: 45,
						interval: 0
					}
				},
		yAxis: horizontal
			? {
					type: 'category',
					data: displayData.map((d) => d.name).reverse(),
					axisLabel: {
						width: 120,
						overflow: 'truncate'
					}
				}
			: {
					type: 'value'
				},
		series: [
			{
				name: 'Count',
				type: 'bar',
				data: horizontal
					? displayData.map((d) => d.value).reverse()
					: displayData.map((d) => d.value),
				itemStyle: {
					color: '#3b82f6',
					borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: '#60a5fa'
					}
				}
			}
		]
	});

	function handleClick(params: unknown) {
		const p = params as { name: string };
		if (onclick && p.name) {
			onclick(p.name);
		}
	}
</script>

<EChart {option} class={cn(className)} onclick={handleClick} />
