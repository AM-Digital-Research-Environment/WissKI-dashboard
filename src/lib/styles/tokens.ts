/**
 * =============================================================================
 * WISSKI DASHBOARD — DESIGN TOKENS (TypeScript)
 * =============================================================================
 *
 * This file provides typed access to design tokens for use in JavaScript/TypeScript.
 * Primary use cases:
 * - ECharts theme configuration
 * - Dynamic styling calculations
 * - Runtime color manipulations
 *
 * All values here should match the CSS custom properties in tokens.css
 * =============================================================================
 */

/* =============================================================================
   CHART COLOR PALETTE
   ============================================================================= */

/**
 * Primary categorical color palette for data visualization.
 * Designed for accessibility and visual distinction.
 * Use in order for consistent visual hierarchy.
 */
export const CHART_COLORS = [
	'#3b82f6', // Blue
	'#10b981', // Emerald
	'#f59e0b', // Amber
	'#ef4444', // Red
	'#8b5cf6', // Purple
	'#ec4899', // Pink
	'#06b6d4', // Cyan
	'#84cc16', // Lime
	'#f97316', // Orange
	'#6366f1'  // Indigo
] as const;

/**
 * Extended palette (20 colors) for visualizations with many categories
 */
export const CHART_COLORS_EXTENDED = [
	...CHART_COLORS,
	'#14b8a6', // Teal
	'#a855f7', // Violet
	'#f43f5e', // Rose
	'#0ea5e9', // Sky
	'#22c55e', // Green
	'#eab308', // Yellow
	'#64748b', // Slate
	'#78716c', // Stone
	'#0d9488', // Teal dark
	'#7c3aed'  // Violet dark
] as const;

/**
 * Reduced palette (5 colors) for simple visualizations
 */
export const CHART_COLORS_SIMPLE = [
	'#3b82f6', // Blue
	'#10b981', // Emerald
	'#f59e0b', // Amber
	'#ef4444', // Red
	'#8b5cf6'  // Purple
] as const;

/**
 * Sequential palette for gradients and heatmaps (blue-based)
 */
export const CHART_COLORS_SEQUENTIAL = [
	'#dbeafe', // primary-100
	'#bfdbfe', // primary-200
	'#93c5fd', // primary-300
	'#60a5fa', // primary-400
	'#3b82f6', // primary-500
	'#2563eb', // primary-600
	'#1d4ed8'  // primary-700
] as const;

/**
 * Diverging palette for comparison charts (red to green)
 */
export const CHART_COLORS_DIVERGING = {
	negative: ['#dc2626', '#f87171', '#fecaca'], // Red scale
	neutral: '#e5e7eb',
	positive: ['#bbf7d0', '#4ade80', '#16a34a']  // Green scale
} as const;

/* =============================================================================
   THEME COLORS (Light/Dark aware hex values)
   ============================================================================= */

export const THEME_COLORS = {
	light: {
		// Surfaces
		background: '#ffffff',
		foreground: '#020617',
		card: '#ffffff',
		cardForeground: '#020617',
		popover: '#ffffff',
		popoverForeground: '#020617',

		// Semantic
		primary: '#2563eb',
		primaryForeground: '#f8fafc',
		secondary: '#f1f5f9',
		secondaryForeground: '#0f172a',
		muted: '#f1f5f9',
		mutedForeground: '#64748b',
		accent: '#f1f5f9',
		accentForeground: '#0f172a',
		destructive: '#ef4444',
		destructiveForeground: '#f8fafc',

		// UI Elements
		border: '#e2e8f0',
		input: '#e2e8f0',
		ring: '#3b82f6',

		// Chart specific
		chartText: '#374151',
		chartTextMuted: '#6b7280',
		chartAxis: '#9ca3af',
		chartGrid: '#e5e7eb',
		chartTooltipBg: 'rgba(255, 255, 255, 0.95)',
		chartTooltipBorder: '#e5e7eb'
	},
	dark: {
		// Surfaces
		background: '#020617',
		foreground: '#f8fafc',
		card: '#0f172a',
		cardForeground: '#f8fafc',
		popover: '#0f172a',
		popoverForeground: '#f8fafc',

		// Semantic
		primary: '#3b82f6',
		primaryForeground: '#020617',
		secondary: '#1e293b',
		secondaryForeground: '#f8fafc',
		muted: '#1e293b',
		mutedForeground: '#94a3b8',
		accent: '#1e293b',
		accentForeground: '#f8fafc',
		destructive: '#dc2626',
		destructiveForeground: '#f8fafc',

		// UI Elements
		border: '#1e293b',
		input: '#1e293b',
		ring: '#3b82f6',

		// Chart specific
		chartText: '#e5e7eb',
		chartTextMuted: '#9ca3af',
		chartAxis: '#4b5563',
		chartGrid: '#1f2937',
		chartTooltipBg: 'rgba(17, 24, 39, 0.95)',
		chartTooltipBorder: '#374151'
	}
} as const;

/* =============================================================================
   TYPOGRAPHY
   ============================================================================= */

export const FONT_FAMILY = {
	sans: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	serif: "'Crimson Pro', 'Georgia', 'Cambria', 'Times New Roman', serif",
	mono: "'JetBrains Mono', 'Fira Code', ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace"
} as const;

export const FONT_SIZE = {
	'2xs': '0.625rem',  // 10px
	xs: '0.75rem',      // 12px
	sm: '0.875rem',     // 14px
	base: '1rem',       // 16px
	lg: '1.125rem',     // 18px
	xl: '1.25rem',      // 20px
	'2xl': '1.5rem',    // 24px
	'3xl': '1.875rem',  // 30px
	'4xl': '2.25rem',   // 36px
	'5xl': '3rem',      // 48px
	'6xl': '3.75rem'    // 60px
} as const;

export const FONT_WEIGHT = {
	thin: 100,
	extralight: 200,
	light: 300,
	normal: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
	extrabold: 800,
	black: 900
} as const;

/* =============================================================================
   SPACING
   ============================================================================= */

export const SPACING = {
	0: '0',
	px: '1px',
	0.5: '0.125rem',
	1: '0.25rem',
	1.5: '0.375rem',
	2: '0.5rem',
	2.5: '0.625rem',
	3: '0.75rem',
	3.5: '0.875rem',
	4: '1rem',
	5: '1.25rem',
	6: '1.5rem',
	7: '1.75rem',
	8: '2rem',
	9: '2.25rem',
	10: '2.5rem',
	11: '2.75rem',
	12: '3rem',
	14: '3.5rem',
	16: '4rem',
	20: '5rem',
	24: '6rem',
	28: '7rem',
	32: '8rem',
	36: '9rem',
	40: '10rem',
	44: '11rem',
	48: '12rem'
} as const;

/* =============================================================================
   BORDER RADIUS
   ============================================================================= */

export const BORDER_RADIUS = {
	none: '0',
	sm: '0.125rem',
	default: '0.25rem',
	md: '0.375rem',
	lg: '0.5rem',
	xl: '0.75rem',
	'2xl': '1rem',
	'3xl': '1.5rem',
	full: '9999px'
} as const;

/* =============================================================================
   SHADOWS
   ============================================================================= */

export const SHADOW = {
	xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
	sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
	md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
	lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
	xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
	'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
	inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
	none: '0 0 #0000'
} as const;

/* =============================================================================
   ANIMATION
   ============================================================================= */

export const DURATION = {
	instant: 0,
	fast: 100,
	normal: 200,
	slow: 300,
	slower: 500,
	slowest: 700,
	chart: 1000,
	page: 400
} as const;

export const EASING = {
	linear: 'linear',
	in: 'cubic-bezier(0.4, 0, 1, 1)',
	out: 'cubic-bezier(0, 0, 0.2, 1)',
	inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
	bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
	smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
	spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

/* =============================================================================
   Z-INDEX
   ============================================================================= */

export const Z_INDEX = {
	below: -1,
	base: 0,
	raised: 10,
	dropdown: 20,
	sticky: 30,
	fixed: 40,
	overlay: 50,
	modal: 60,
	popover: 70,
	tooltip: 80,
	toast: 90,
	max: 9999
} as const;

/* =============================================================================
   LAYOUT
   ============================================================================= */

export const LAYOUT = {
	sidebarWidth: '16rem',     // 256px
	headerHeight: '4rem',      // 64px
	footerHeight: '3rem',      // 48px
	containerXs: '20rem',      // 320px
	containerSm: '24rem',      // 384px
	containerMd: '28rem',      // 448px
	containerLg: '32rem',      // 512px
	containerXl: '36rem',      // 576px
	container2xl: '42rem',     // 672px
	container3xl: '48rem',     // 768px
	container4xl: '56rem',     // 896px
	container5xl: '64rem',     // 1024px
	container6xl: '72rem',     // 1152px
	container7xl: '80rem'      // 1280px
} as const;

/* =============================================================================
   ECHARTS THEME CONFIGURATIONS
   ============================================================================= */

/**
 * ECharts theme configuration for light mode
 */
export const ECHARTS_THEME_LIGHT = {
	backgroundColor: 'transparent',
	textStyle: {
		color: THEME_COLORS.light.chartText,
		fontFamily: FONT_FAMILY.sans
	},
	title: {
		textStyle: {
			color: THEME_COLORS.light.foreground,
			fontWeight: FONT_WEIGHT.semibold
		}
	},
	legend: {
		textStyle: {
			color: THEME_COLORS.light.chartTextMuted
		}
	},
	tooltip: {
		backgroundColor: THEME_COLORS.light.chartTooltipBg,
		borderColor: THEME_COLORS.light.chartTooltipBorder,
		borderWidth: 1,
		textStyle: {
			color: THEME_COLORS.light.chartText
		},
		extraCssText: `border-radius: ${BORDER_RADIUS.lg}; box-shadow: ${SHADOW.lg};`
	},
	xAxis: {
		axisLine: {
			lineStyle: { color: THEME_COLORS.light.chartAxis }
		},
		axisLabel: {
			color: THEME_COLORS.light.chartTextMuted
		},
		splitLine: {
			lineStyle: { color: THEME_COLORS.light.chartGrid }
		}
	},
	yAxis: {
		axisLine: {
			lineStyle: { color: THEME_COLORS.light.chartAxis }
		},
		axisLabel: {
			color: THEME_COLORS.light.chartTextMuted
		},
		splitLine: {
			lineStyle: { color: THEME_COLORS.light.chartGrid }
		}
	},
	color: CHART_COLORS
} as const;

/**
 * ECharts theme configuration for dark mode
 */
export const ECHARTS_THEME_DARK = {
	backgroundColor: 'transparent',
	textStyle: {
		color: THEME_COLORS.dark.chartText,
		fontFamily: FONT_FAMILY.sans
	},
	title: {
		textStyle: {
			color: THEME_COLORS.dark.foreground,
			fontWeight: FONT_WEIGHT.semibold
		}
	},
	legend: {
		textStyle: {
			color: THEME_COLORS.dark.chartTextMuted
		}
	},
	tooltip: {
		backgroundColor: THEME_COLORS.dark.chartTooltipBg,
		borderColor: THEME_COLORS.dark.chartTooltipBorder,
		borderWidth: 1,
		textStyle: {
			color: THEME_COLORS.dark.chartText
		},
		extraCssText: `border-radius: ${BORDER_RADIUS.lg}; box-shadow: ${SHADOW.lg};`
	},
	xAxis: {
		axisLine: {
			lineStyle: { color: THEME_COLORS.dark.chartAxis }
		},
		axisLabel: {
			color: THEME_COLORS.dark.chartTextMuted
		},
		splitLine: {
			lineStyle: { color: THEME_COLORS.dark.chartGrid }
		}
	},
	yAxis: {
		axisLine: {
			lineStyle: { color: THEME_COLORS.dark.chartAxis }
		},
		axisLabel: {
			color: THEME_COLORS.dark.chartTextMuted
		},
		splitLine: {
			lineStyle: { color: THEME_COLORS.dark.chartGrid }
		}
	},
	color: CHART_COLORS
} as const;

/**
 * Helper to get ECharts theme based on current theme mode
 */
export function getEChartsTheme(isDark: boolean) {
	return isDark ? ECHARTS_THEME_DARK : ECHARTS_THEME_LIGHT;
}

/**
 * Helper to get a color from the chart palette by index (with wrapping)
 */
export function getChartColor(index: number): string {
	return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Helper to get theme colors based on mode
 */
export function getThemeColors(isDark: boolean) {
	return isDark ? THEME_COLORS.dark : THEME_COLORS.light;
}

/* =============================================================================
   TYPE EXPORTS
   ============================================================================= */

export type ChartColor = typeof CHART_COLORS[number];
export type ThemeMode = 'light' | 'dark';
export type FontSizeKey = keyof typeof FONT_SIZE;
export type FontWeightKey = keyof typeof FONT_WEIGHT;
export type SpacingKey = keyof typeof SPACING;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ShadowKey = keyof typeof SHADOW;
export type DurationKey = keyof typeof DURATION;
export type ZIndexKey = keyof typeof Z_INDEX;
