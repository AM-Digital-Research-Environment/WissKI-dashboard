# WissKI Dashboard

Interactive visualization dashboard for WissKI/MongoDB research data, built with SvelteKit 5, ECharts, and Tailwind CSS.

## Features

- **Overview Dashboard**: Summary cards, timeline, resource distribution, and word clouds
- **Collections Browser**: Explore UBT ArtWorld and CLnCK collections with detailed visualizations
- **Compare View**: Side-by-side comparison of different collections with overlap analysis
- **Projects Explorer**: Browse research projects with filtering and search
- **Network Visualization**: Interactive force-directed graphs showing contributor-project relationships

## Tech Stack

- **Framework**: SvelteKit 5 with Svelte 5 runes
- **Charts**: ECharts 5 + echarts-wordcloud
- **Styling**: Tailwind CSS 3.4 with dark mode support
- **UI Components**: Custom shadcn-svelte style components
- **Deployment**: GitHub Pages with static adapter

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # UI components (Button, Card, Badge, etc.)
│   │   ├── charts/      # ECharts wrapper components
│   │   └── layout/      # Sidebar, Header, FilterPanel
│   ├── stores/          # Svelte stores for data and filters
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Data loading and transformation
├── routes/
│   ├── +page.svelte     # Overview dashboard
│   ├── collections/     # Collections browser
│   ├── compare/         # Comparison view
│   ├── projects/        # Projects explorer
│   └── network/         # Network visualization
└── app.css              # Global styles
```

## Data

The dashboard visualizes MongoDB export data from WissKI research projects:

- `dev.projectsData.json` - Research projects metadata
- `dev.persons.json` - Person records
- `dev.institutions.json` - Institution records
- `projects_metadata_ubt.UBT_ArtWorld2019.json` - ArtWorld 2019 collection
- `projects_metadata_ubt.UBT_CLnCK2019.json` - CLnCK 2019 collection

## Deployment

The project is configured for automatic deployment to GitHub Pages. Push to `main` branch to trigger deployment.

## License

MIT
