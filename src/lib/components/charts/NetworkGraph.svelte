<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { NetworkData } from '$lib/types';
	import { cn } from '$lib/utils/cn';

	interface Props {
		data: NetworkData;
		title?: string;
		class?: string;
		onclick?: (id: string, category: number) => void;
	}

	let { data, title = '', class: className = '', onclick }: Props = $props();

	const categoryColors = [
		'#3b82f6', // Blue
		'#10b981', // Green
		'#f59e0b', // Amber
		'#ef4444', // Red
		'#8b5cf6' // Purple
	];

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
			formatter: (params: unknown) => {
				const p = params as { data: { name: string } };
				return p.data?.name || '';
			}
		},
		xAxis: { show: false },
		yAxis: { show: false },
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
						color: categoryColors[node.category % categoryColors.length]
					}
				})),
				links: data.links,
				categories: data.categories.map((c, i) => ({
					name: c.name,
					itemStyle: {
						color: categoryColors[i % categoryColors.length]
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
