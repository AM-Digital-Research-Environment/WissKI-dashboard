/**
 * =============================================================================
 * WISSKI DASHBOARD — STYLES BARREL EXPORT
 * =============================================================================
 *
 * Central export point for all design tokens and style utilities.
 *
 * Usage:
 *   import { CHART_COLORS, getEChartsTheme } from '$lib/styles';
 * =============================================================================
 */

// Re-export everything from tokens
export * from './tokens';

// Re-export CSS path for components that need to import it
export const TOKENS_CSS_PATH = '$lib/styles/tokens.css';
