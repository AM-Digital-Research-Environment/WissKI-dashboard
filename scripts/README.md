# Data Enrichment Scripts

Python scripts for enriching WissKI Dashboard data with external sources.

## Setup

```bash
cd scripts
pip install -r requirements.txt
```

## Scripts

### `reconcile_locations.py`

Reconciles location names from collection data to Wikidata entities and fetches GPS coordinates.

**Features:**
- Extracts unique locations (countries, regions, cities) from JSON collection files
- Queries Wikidata API to find matching entities
- Fetches GPS coordinates via SPARQL queries
- Caches results to avoid redundant API calls
- Outputs enriched location mapping

**Usage:**
```bash
python scripts/reconcile_locations.py
```

**Output:**
- `static/data/enriched/locations_wikidata.json` - Enriched location data with:
  - Wikidata entity IDs (Q-codes)
  - GPS coordinates (latitude/longitude)
  - ISO country codes
  - GeoNames IDs
  - Entity descriptions

**Output structure:**
```json
{
  "countries": {
    "Germany": {
      "original_name": "Germany",
      "wikidata_id": "Q183",
      "wikidata_label": "Germany",
      "latitude": 51.0,
      "longitude": 9.0,
      "country_code": "DE",
      ...
    }
  },
  "regions": { ... },
  "cities": { ... },
  "other": { ... },
  "metadata": { ... }
}
```

**Caching:**
The script maintains a cache at `scripts/.location_cache.json` to avoid repeated API calls. Delete this file to force fresh lookups.

## Adding New Scripts

When adding new enrichment scripts:
1. Follow the same pattern of reading from `static/data/`
2. Output enriched data to `static/data/enriched/`
3. Include proper rate limiting for external APIs
4. Use caching to avoid redundant requests
