/**
 * =============================================================================
 * ECHARTS SHARED OPTION BUILDERS
 * =============================================================================
 *
 * Reusable builder functions for common ECharts option configurations.
 * These help reduce code duplication and ensure consistent styling.
 * =============================================================================
 */

import type { EChartsOption } from 'echarts';

/* =============================================================================
   TYPE DEFINITIONS
   ============================================================================= */

export interface TitleOptions {
	left?: 'left' | 'center' | 'right' | number | string;
	top?: number | string;
	textStyle?: {
		fontSize?: number;
		fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
	};
}

export interface GridOptions {
	left?: number | string;
	right?: number | string;
	top?: number | string;
	bottom?: number | string;
	containLabel?: boolean;
}

export interface DataZoomOptions {
	start?: number;
	end?: number;
	bottom?: number;
	height?: number;
	showSlider?: boolean;
	showInside?: boolean;
}

/* =============================================================================
   BUILDER FUNCTIONS
   ============================================================================= */

/**
 * Build standardized title configuration
 */
export function buildTitle(
	title?: string,
	options: TitleOptions = {}
): EChartsOption['title'] | undefined {
	if (!title) return undefined;

	return {
		text: title,
		left: options.left ?? 'center',
		top: options.top ?? 0,
		textStyle: options.textStyle
	};
}

/**
 * Build standardized grid configuration for cartesian charts
 */
export function buildGrid(options: GridOptions = {}): EChartsOption['grid'] {
	return {
		left: options.left ?? '3%',
		right: options.right ?? '4%',
		top: options.top ?? '10%',
		bottom: options.bottom ?? '15%',
		containLabel: options.containLabel ?? true
	};
}

/**
 * Build dataZoom configuration for zoom controls
 */
export function buildDataZoom(options: DataZoomOptions = {}): EChartsOption['dataZoom'] {
	const result: EChartsOption['dataZoom'] = [];

	if (options.showSlider !== false) {
		result.push({
			type: 'slider',
			start: options.start ?? 0,
			end: options.end ?? 100,
			bottom: options.bottom ?? 10,
			height: options.height ?? 25
		});
	}

	if (options.showInside) {
		result.push({
			type: 'inside',
			start: options.start ?? 0,
			end: options.end ?? 100
		});
	}

	return result.length > 0 ? result : undefined;
}

/**
 * Hide axes configuration for non-cartesian charts (pie, sunburst, sankey, network)
 */
export function hideAxes(): { xAxis: { show: false }; yAxis: { show: false } } {
	return {
		xAxis: { show: false },
		yAxis: { show: false }
	};
}

/**
 * Build large dataset optimization configuration
 * Enables progressive rendering for datasets exceeding thresholds
 */
export function buildLargeDatasetConfig(
	dataLength: number,
	thresholds = {
		large: 1000,
		progressive: 5000,
		chunkSize: 500
	}
): Partial<EChartsOption> {
	if (dataLength < thresholds.large) {
		return {};
	}

	const config: Partial<EChartsOption> = {
		animation: dataLength < thresholds.progressive,
		// Sampling for line charts with large data
		series: [
			{
				sampling: 'lttb', // Largest-Triangle-Three-Buckets algorithm
				large: true,
				largeThreshold: thresholds.large
			}
		]
	};

	if (dataLength >= thresholds.progressive) {
		return {
			...config,
			progressive: thresholds.chunkSize,
			progressiveThreshold: thresholds.progressive
		};
	}

	return config;
}

/**
 * Build legend configuration with scroll support
 */
export function buildLegend(
	data: string[],
	options: {
		orient?: 'horizontal' | 'vertical';
		position?: 'top' | 'bottom' | 'left' | 'right';
		show?: boolean;
	} = {}
): EChartsOption['legend'] {
	if (options.show === false) {
		return { show: false };
	}

	const { orient = 'horizontal', position = 'bottom' } = options;

	const positionConfig: Record<string, number | string> = {};
	if (position === 'bottom') {
		positionConfig.bottom = 0;
	} else if (position === 'top') {
		positionConfig.top = 0;
	} else if (position === 'left') {
		positionConfig.left = 0;
		positionConfig.top = 'middle';
	} else if (position === 'right') {
		positionConfig.right = 0;
		positionConfig.top = 'middle';
	}

	return {
		type: 'scroll',
		orient,
		data,
		...positionConfig
	};
}

/**
 * Build tooltip base configuration
 */
export function buildTooltip(
	trigger: 'item' | 'axis' = 'item',
	options: {
		formatter?: string | ((params: unknown) => string);
		axisPointer?: 'line' | 'shadow' | 'cross';
	} = {}
): EChartsOption['tooltip'] {
	const tooltip: EChartsOption['tooltip'] = {
		trigger
	};

	if (options.formatter) {
		tooltip.formatter = options.formatter;
	}

	if (trigger === 'axis' && options.axisPointer) {
		tooltip.axisPointer = {
			type: options.axisPointer
		};
	}

	return tooltip;
}
