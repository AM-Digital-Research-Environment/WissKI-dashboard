/**
 * =============================================================================
 * ECHARTS UTILITIES — BARREL EXPORT
 * =============================================================================
 *
 * Central export for all shared chart utilities.
 * Import from this file for convenient access to all utilities.
 *
 * Usage:
 * import { buildTitle, hideAxes, itemCountFormatter } from './utils';
 * =============================================================================
 */

// Option builders
export {
	buildTitle,
	buildGrid,
	buildDataZoom,
	hideAxes,
	buildTooltip,
	buildLegend,
	buildVisualMap,
	buildAxisLabel,
	buildAxisName,
	type TitleOptions,
	type GridOptions,
	type DataZoomOptions,
	type TooltipOptions,
	type LegendOptions,
	type VisualMapOptions,
	type AxisLabelOptions,
	type AxisNameOptions
} from './optionBuilders';

// Tooltip formatters
export {
	itemCountFormatter,
	stackedFormatter,
	pathFormatter,
	linkFormatter,
	nodeFormatter,
	heatmapFormatter,
	PIE_FORMAT_STRING
} from './formatters';
