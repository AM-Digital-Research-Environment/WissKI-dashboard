<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { PieChartDataPoint } from '$lib/types';
	import { cn } from '$lib/utils/cn';
	import { CHART_COLORS, getChartColor } from '$lib/styles';

	interface Props {
		data: PieChartDataPoint[];
		title?: string;
		class?: string;
		onclick?: (name: string) => void;
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
			trigger: 'item',
			formatter: '{b}: {c} ({d}%)'
		},
		xAxis: { show: false },
		yAxis: { show: false },
		legend: {
			orient: 'vertical',
			left: 'left',
			top: 'middle',
			type: 'scroll'
		},
		series: [
			{
				name: 'Distribution',
				type: 'pie',
				radius: ['40%', '70%'],
				center: ['60%', '50%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 4,
					borderColor: 'transparent',
					borderWidth: 2
				},
				label: {
					show: false
				},
				emphasis: {
					label: {
						show: false
					}
				},
				labelLine: {
					show: false
				},
				data: data.map((d, i) => ({
					name: d.name,
					value: d.value,
					itemStyle: {
						color: getChartColor(i)
					}
				}))
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

<EChart {option} class={cn(className)} onclick={handleClick} showZoomControls={false} />
