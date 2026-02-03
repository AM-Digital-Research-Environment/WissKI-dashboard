<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { NetworkData } from '$lib/types';
	import { cn } from '$lib/utils/cn';
	import { CHART_COLORS_SIMPLE } from '$lib/styles';
	import { buildTitle, hideAxes, nodeFormatter } from './utils';

	interface Props {
		data: NetworkData;
		title?: string;
		class?: string;
		onclick?: (id: string, category: number) => void;
	}

	let { data, title = '', class: className = '', onclick }: Props = $props();

	let option: EChartsOption = $derived({
		...buildTitle(title),
		tooltip: {
			trigger: 'item',
			formatter: nodeFormatter
		},
		...hideAxes(),
		legend: {
			data: data.categories.map((c) => c.name),
			orient: 'vertical',
			left: 'left',
			top: 'middle'
		},
		animationDuration: 1500,
		animationEasingUpdate: 'quinticInOut',
		series: [
			{
				name: 'Network',
				type: 'graph',
				layout: 'force',
				data: data.nodes.map((node) => ({
					...node,
					itemStyle: {
						color: CHART_COLORS_SIMPLE[node.category % CHART_COLORS_SIMPLE.length]
					}
				})),
				links: data.links,
				categories: data.categories.map((c, i) => ({
					name: c.name,
					itemStyle: {
						color: CHART_COLORS_SIMPLE[i % CHART_COLORS_SIMPLE.length]
					}
				})),
				roam: true,
				label: {
					show: true,
					position: 'right',
					formatter: '{b}',
					fontSize: 10
				},
				labelLayout: {
					hideOverlap: true
				},
				force: {
					repulsion: 100,
					gravity: 0.1,
					edgeLength: [50, 150],
					layoutAnimation: true
				},
				lineStyle: {
					color: 'source',
					curveness: 0.3,
					opacity: 0.5
				},
				emphasis: {
					focus: 'adjacency',
					lineStyle: {
						width: 3
					}
				}
			}
		]
	});

	function handleClick(params: unknown) {
		const p = params as { data: { id: string; category: number } };
		if (onclick && p.data) {
			onclick(p.data.id, p.data.category);
		}
	}
</script>

<EChart {option} class={cn(className)} onclick={handleClick} />
