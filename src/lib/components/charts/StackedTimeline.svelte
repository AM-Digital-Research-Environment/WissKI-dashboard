<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { StackedTimelineDataPoint } from '$lib/utils/dataTransform';
	import { getResourceTypesFromStackedData } from '$lib/utils/dataTransform';
	import { cn } from '$lib/utils/cn';
	import { CHART_COLORS } from '$lib/styles';

	interface Props {
		data: StackedTimelineDataPoint[];
		title?: string;
		class?: string;
		onclick?: (year: number, resourceType?: string) => void;
	}

	let { data, title = '', class: className = '', onclick }: Props = $props();

	// Get all resource types present in the data
	let resourceTypes = $derived(getResourceTypesFromStackedData(data));

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
				const pArray = params as { seriesName: string; value: number; name: string; color: string }[];
				if (!Array.isArray(pArray) || pArray.length === 0) return '';

				const year = pArray[0].name;
				let total = 0;
				let content = `<strong>${year}</strong><br/>`;

				pArray.forEach((p) => {
					if (p.value > 0) {
						content += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${p.color};"></span>${p.seriesName}: ${p.value}<br/>`;
						total += p.value;
					}
				});

				content += `<br/><strong>Total: ${total}</strong>`;
				return content;
			}
		},
		legend: {
			type: 'scroll',
			bottom: 65,
			data: resourceTypes
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: 100,
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
				type: 'slider',
				start: 0,
				end: 100,
				bottom: 10,
				height: 25
			}
		],
		series: resourceTypes.map((type, index) => ({
			name: type,
			type: 'bar',
			stack: 'total',
			emphasis: {
				focus: 'series'
			},
			data: data.map((d) => d.byType[type] || 0),
			itemStyle: {
				color: CHART_COLORS[index % CHART_COLORS.length]
			}
		}))
	});

	function handleClick(params: unknown) {
		const p = params as { name: string; seriesName?: string };
		if (onclick && p.name) {
			onclick(parseInt(p.name), p.seriesName);
		}
	}
</script>

<EChart {option} class={cn(className)} onclick={handleClick} showZoomControls={false} />
