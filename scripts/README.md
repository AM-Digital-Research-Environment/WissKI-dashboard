# Data Enrichment Scripts

Python scripts for enriching WissKI Dashboard data with external sources.

## Setup

```bash
cd scripts
pip install -r requirements.txt
```

## Scripts

### `reconcile_locations.py` (DEPRECATED)

> **Note:** This script is no longer needed. Location data is now loaded directly from pre-reconciled geolocation files exported from MongoDB:
> - `static/data/dev/dev.geoloc_countries.json`
> - `static/data/dev/dev.geoloc_regions.json`
> - `static/data/dev/dev.geoloc_subregions.json`
>
> These files contain pre-reconciled Wikidata URIs and GPS coordinates.

~~Reconciles location names from collection data to Wikidata entities and fetches GPS coordinates.~~

**Previous features (for reference):**
- Extracts unique locations (countries, regions, cities) from JSON collection files
- Queries Wikidata API to find matching entities
- Fetches GPS coordinates via SPARQL queries
- Caches results to avoid redundant API calls
- Outputs enriched location mapping

## Adding New Scripts

When adding new enrichment scripts:
1. Follow the same pattern of reading from `static/data/`
2. Output enriched data to `static/data/enriched/`
3. Include proper rate limiting for external APIs
4. Use caching to avoid redundant requests
