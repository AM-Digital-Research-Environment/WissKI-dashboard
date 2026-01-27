"""
Reconcile locations to Wikidata and fetch GPS coordinates.

This script:
1. Extracts unique locations from the collection JSON files
2. Reconciles them to Wikidata entities using the Wikidata API
3. Fetches GPS coordinates (latitude/longitude) from Wikidata
4. Outputs an enriched location mapping file

Usage:
    python scripts/reconcile_locations.py

Output:
    static/data/enriched/locations_wikidata.json
"""

import json
import time
import requests
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict
from collections import defaultdict

# Configuration
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
REQUEST_DELAY = 0.5  # seconds between API calls to be respectful
CACHE_FILE = Path("scripts/.location_cache.json")

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "static" / "data"
OUTPUT_DIR = DATA_DIR / "enriched"


@dataclass
class WikidataLocation:
    """Represents a location enriched with Wikidata information."""
    original_name: str
    wikidata_id: Optional[str] = None
    wikidata_label: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country_code: Optional[str] = None
    geonames_id: Optional[str] = None
    description: Optional[str] = None
    match_confidence: Optional[str] = None  # "exact", "fuzzy", "manual", "not_found"


class LocationCache:
    """Simple file-based cache for Wikidata lookups."""

    def __init__(self, cache_path: Path):
        self.cache_path = cache_path
        self.cache: dict = {}
        self._load()

    def _load(self):
        if self.cache_path.exists():
            with open(self.cache_path, 'r', encoding='utf-8') as f:
                self.cache = json.load(f)

    def save(self):
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.cache_path, 'w', encoding='utf-8') as f:
            json.dump(self.cache, f, indent=2, ensure_ascii=False)

    def get(self, key: str) -> Optional[dict]:
        return self.cache.get(key)

    def set(self, key: str, value: dict):
        self.cache[key] = value


class WikidataReconciler:
    """Reconcile location names to Wikidata entities."""

    def __init__(self, cache: LocationCache):
        self.cache = cache
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'WissKI-Dashboard-LocationEnricher/1.0 (https://github.com/fmadore/WissKI-dashboard)'
        })

    def search_entity(self, name: str, language: str = "en") -> Optional[dict]:
        """Search for a Wikidata entity by name."""
        # Check cache first
        cache_key = f"search:{name}:{language}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        params = {
            "action": "wbsearchentities",
            "search": name,
            "language": language,
            "type": "item",
            "format": "json",
            "limit": 5
        }

        try:
            time.sleep(REQUEST_DELAY)
            response = self.session.get(WIKIDATA_API, params=params)
            response.raise_for_status()
            data = response.json()

            results = data.get("search", [])
            # Filter for geographic entities (places, cities, countries, etc.)
            for result in results:
                entity_id = result.get("id")
                if entity_id and self._is_geographic_entity(entity_id):
                    self.cache.set(cache_key, result)
                    return result

            # If no geographic entity found, return first result anyway
            if results:
                self.cache.set(cache_key, results[0])
                return results[0]

            self.cache.set(cache_key, None)
            return None

        except requests.RequestException as e:
            print(f"  Error searching for '{name}': {e}")
            return None

    def _is_geographic_entity(self, entity_id: str) -> bool:
        """Check if an entity is a geographic location using SPARQL."""
        cache_key = f"is_geo:{entity_id}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        # Query to check if entity is instance of a geographic entity type
        query = f"""
        ASK {{
            wd:{entity_id} wdt:P31/wdt:P279* ?type .
            VALUES ?type {{
                wd:Q515      # city
                wd:Q6256     # country
                wd:Q35657    # state
                wd:Q3624078  # sovereign state
                wd:Q82794    # region
                wd:Q486972   # human settlement
                wd:Q1549591  # big city
                wd:Q1637706  # city with millions inhabitants
                wd:Q5119     # capital
            }}
        }}
        """

        try:
            time.sleep(REQUEST_DELAY)
            response = self.session.get(
                WIKIDATA_SPARQL,
                params={"query": query, "format": "json"}
            )
            response.raise_for_status()
            result = response.json().get("boolean", False)
            self.cache.set(cache_key, result)
            return result
        except requests.RequestException:
            return True  # Assume it's geographic if we can't verify

    def get_coordinates(self, entity_id: str) -> Optional[dict]:
        """Fetch GPS coordinates and additional data for a Wikidata entity."""
        cache_key = f"coords:{entity_id}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        query = f"""
        SELECT ?lat ?lon ?countryCode ?geonamesId ?description WHERE {{
            OPTIONAL {{ wd:{entity_id} wdt:P625 ?coord .
                       BIND(geof:latitude(?coord) AS ?lat)
                       BIND(geof:longitude(?coord) AS ?lon) }}
            OPTIONAL {{ wd:{entity_id} wdt:P297 ?countryCode . }}
            OPTIONAL {{ wd:{entity_id} wdt:P1566 ?geonamesId . }}
            OPTIONAL {{ wd:{entity_id} schema:description ?description .
                       FILTER(LANG(?description) = "en") }}
        }}
        LIMIT 1
        """

        try:
            time.sleep(REQUEST_DELAY)
            response = self.session.get(
                WIKIDATA_SPARQL,
                params={"query": query, "format": "json"}
            )
            response.raise_for_status()

            results = response.json().get("results", {}).get("bindings", [])
            if results:
                result = results[0]
                coords = {
                    "latitude": float(result["lat"]["value"]) if "lat" in result else None,
                    "longitude": float(result["lon"]["value"]) if "lon" in result else None,
                    "country_code": result.get("countryCode", {}).get("value"),
                    "geonames_id": result.get("geonamesId", {}).get("value"),
                    "description": result.get("description", {}).get("value")
                }
                self.cache.set(cache_key, coords)
                return coords

            self.cache.set(cache_key, {})
            return {}

        except requests.RequestException as e:
            print(f"  Error fetching coordinates for {entity_id}: {e}")
            return {}

    def reconcile_location(self, name: str, context: Optional[str] = None) -> WikidataLocation:
        """Reconcile a location name to Wikidata with coordinates."""
        location = WikidataLocation(original_name=name)

        # Try search with context if provided (e.g., "Bayreuth, Germany")
        search_term = f"{name}, {context}" if context else name

        entity = self.search_entity(search_term)
        if not entity and context:
            # Fallback to name only
            entity = self.search_entity(name)

        if entity:
            location.wikidata_id = entity.get("id")
            location.wikidata_label = entity.get("label")
            location.match_confidence = "exact" if entity.get("match", {}).get("type") == "label" else "fuzzy"

            # Fetch coordinates
            if location.wikidata_id:
                coords = self.get_coordinates(location.wikidata_id)
                if coords:
                    location.latitude = coords.get("latitude")
                    location.longitude = coords.get("longitude")
                    location.country_code = coords.get("country_code")
                    location.geonames_id = coords.get("geonames_id")
                    location.description = coords.get("description")
        else:
            location.match_confidence = "not_found"

        return location


def normalize_mongo_value(value) -> str:
    """Convert MongoDB Extended JSON values to strings, handling NaN and other types."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        # Handle MongoDB Extended JSON types like {"$numberDouble": "NaN"}
        if "$numberDouble" in value:
            num_val = value["$numberDouble"]
            if num_val == "NaN" or num_val == "Infinity" or num_val == "-Infinity":
                return ""
            return str(num_val)
        if "$oid" in value:
            return value["$oid"]
        return ""
    return str(value).strip()


def extract_locations_from_collection(file_path: Path) -> set:
    """Extract unique location tuples from a collection JSON file."""
    locations = set()

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        location = item.get("location", {})

        # Extract origin locations
        origins = location.get("origin", [])
        for origin in origins:
            l1 = normalize_mongo_value(origin.get("l1"))
            l2 = normalize_mongo_value(origin.get("l2"))
            l3 = normalize_mongo_value(origin.get("l3"))

            if l1:
                locations.add(("country", l1, None))
            if l2 and l1:
                locations.add(("region", l2, l1))
            if l3 and l1:
                locations.add(("city", l3, l1))

        # Extract current locations
        current = location.get("current", [])
        for loc in current:
            normalized = normalize_mongo_value(loc)
            if normalized:
                locations.add(("current", normalized, None))

    return locations


def main():
    print("=" * 60)
    print("WissKI Dashboard - Location Reconciliation to Wikidata")
    print("=" * 60)

    # Initialize cache and reconciler
    cache = LocationCache(CACHE_FILE)
    reconciler = WikidataReconciler(cache)

    # Find collection files
    collection_files = list(DATA_DIR.glob("**/*.json"))
    collection_files = [f for f in collection_files if "enriched" not in str(f)]

    print(f"\nFound {len(collection_files)} JSON files to process")

    # Extract all unique locations
    all_locations = set()
    for file_path in collection_files:
        print(f"  Extracting from: {file_path.name}")
        try:
            locations = extract_locations_from_collection(file_path)
            all_locations.update(locations)
        except (json.JSONDecodeError, KeyError) as e:
            print(f"    Skipping (not a collection file or error): {e}")

    print(f"\nFound {len(all_locations)} unique location entries")

    # Group by type for better organization
    locations_by_type = defaultdict(list)
    for loc_type, name, context in all_locations:
        locations_by_type[loc_type].append((name, context))

    for loc_type, locs in locations_by_type.items():
        print(f"  - {loc_type}: {len(locs)}")

    # Reconcile locations
    print("\nReconciling locations to Wikidata...")
    enriched_locations = {
        "countries": {},
        "regions": {},
        "cities": {},
        "other": {},
        "metadata": {
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source_files": [str(f.name) for f in collection_files],
            "total_locations": len(all_locations)
        }
    }

    # Process countries first (they provide context for regions/cities)
    print("\n[1/4] Processing countries...")
    for name, _ in locations_by_type.get("country", []):
        print(f"  Reconciling: {name}")
        result = reconciler.reconcile_location(name)
        enriched_locations["countries"][name] = asdict(result)
        if result.wikidata_id:
            print(f"    -> {result.wikidata_id} ({result.wikidata_label})")
            if result.latitude and result.longitude:
                print(f"       Coords: {result.latitude:.4f}, {result.longitude:.4f}")
        else:
            print(f"    -> Not found")

    # Process regions
    print("\n[2/4] Processing regions...")
    for name, context in locations_by_type.get("region", []):
        print(f"  Reconciling: {name} (in {context})")
        result = reconciler.reconcile_location(name, context)
        key = f"{name}|{context}" if context else name
        enriched_locations["regions"][key] = asdict(result)
        if result.wikidata_id:
            print(f"    -> {result.wikidata_id}")

    # Process cities
    print("\n[3/4] Processing cities...")
    for name, context in locations_by_type.get("city", []):
        print(f"  Reconciling: {name} (in {context})")
        result = reconciler.reconcile_location(name, context)
        key = f"{name}|{context}" if context else name
        enriched_locations["cities"][key] = asdict(result)
        if result.wikidata_id:
            print(f"    -> {result.wikidata_id}")

    # Process other/current locations
    print("\n[4/4] Processing other locations...")
    for name, context in locations_by_type.get("current", []):
        print(f"  Reconciling: {name}")
        result = reconciler.reconcile_location(name, context)
        enriched_locations["other"][name] = asdict(result)
        if result.wikidata_id:
            print(f"    -> {result.wikidata_id}")

    # Save cache
    cache.save()
    print(f"\nCache saved to: {CACHE_FILE}")

    # Save enriched data
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / "locations_wikidata.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_locations, f, indent=2, ensure_ascii=False)

    print(f"Enriched locations saved to: {output_file}")

    # Summary statistics
    total_with_wikidata = sum(
        1 for cat in ["countries", "regions", "cities", "other"]
        for loc in enriched_locations[cat].values()
        if loc.get("wikidata_id")
    )
    total_with_coords = sum(
        1 for cat in ["countries", "regions", "cities", "other"]
        for loc in enriched_locations[cat].values()
        if loc.get("latitude") and loc.get("longitude")
    )

    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Total locations processed: {len(all_locations)}")
    print(f"  Matched to Wikidata: {total_with_wikidata}")
    print(f"  With GPS coordinates: {total_with_coords}")
    print("=" * 60)


if __name__ == "__main__":
    main()
