<script lang="ts">
	import EChart from './EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import { cn } from '$lib/utils/cn';

	interface SankeyNode {
		name: string;
	}

	interface SankeyLink {
		source: string;
		target: string;
		value: number;
	}

	interface Props {
		nodes: SankeyNode[];
		links: SankeyLink[];
		title?: string;
		class?: string;
	}

	let { nodes, links, title = '', class: className = '' }: Props = $props();

	const colors = [
		'#3b82f6',
		'#10b981',
		'#f59e0b',
		'#ef4444',
		'#8b5cf6',
		'#ec4899',
		'#06b6d4',
		'#84cc16',
		'#f97316',
		'#6366f1'
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
			triggerOn: 'mousemove',
			formatter: (params: unknown) => {
				const p = params as { data: { source?: string; target?: string; value?: number; name?: string } };
				if (p.data.source && p.data.target) {
					return `${p.data.source} → ${p.data.target}: ${p.data.value}`;
				}
				return p.data.name || '';
			}
		},
		xAxis: { show: false },
		yAxis: { show: false },
		series: [
			{
				type: 'sankey',
				layout: 'none',
				emphasis: {
					focus: 'adjacency'
				},
				nodeAlign: 'left',
				data: nodes.map((node, i) => ({
					...node,
					itemStyle: {
						color: colors[i % colors.length]
					}
				})),
				links: links,
				lineStyle: {
					color: 'gradient',
					curveness: 0.5,
					opacity: 0.6
				},
				label: {
					position: 'right',
					fontSize: 11
				},
				nodeWidth: 20,
				nodeGap: 12,
				left: '5%',
				right: '15%',
				top: title ? '12%' : '5%',
				bottom: '5%'
			}
		]
	});
</script>

<EChart {option} class={cn(className)} />
