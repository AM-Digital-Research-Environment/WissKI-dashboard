/**
 * =============================================================================
 * ECHARTS UTILITIES — BARREL EXPORT
 * =============================================================================
 *
 * Central export for all shared chart utilities.
 * Import from this file for convenient access to all utilities.
 *
 * Usage:
 * import { buildTitle, hideAxes, simpleFormatter } from './utils';
 * =============================================================================
 */

// Option builders
export {
	buildTitle,
	buildGrid,
	buildDataZoom,
	buildLargeDatasetConfig,
	buildLegend,
	buildTooltip,
	hideAxes,
	type TitleOptions,
	type GridOptions,
	type DataZoomOptions
} from './optionBuilders';

// Tooltip formatters
export {
	simpleFormatter,
	itemCountFormatter,
	percentageFormatter,
	stackedFormatter,
	pathFormatter,
	linkFormatter,
	nodeFormatter,
	PIE_FORMAT_STRING
} from './formatters';
