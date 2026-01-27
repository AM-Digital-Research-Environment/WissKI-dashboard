<script lang="ts">
	import { onDestroy } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import type { EnrichedLocationsData, CollectionItem } from '$lib/types';
	import maplibregl from 'maplibre-gl';

	interface LocationData {
		country: string;
		region: string;
		city: string;
		count: number;
	}

	interface MarkerData {
		name: string;
		latitude: number;
		longitude: number;
		count: number;
		type: 'country' | 'region' | 'city' | 'other';
		wikidataId?: string;
		items: { title: string; type: string }[];
	}

	interface Props {
		data: LocationData[];
		items?: CollectionItem[];
		enrichedLocations?: EnrichedLocationsData | null;
		title?: string;
		class?: string;
	}

	let { data, items = [], enrichedLocations = null, title = '', class: className = '' }: Props = $props();

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: maplibregl.Map | null = null;
	let mapReady = $state(false);

	// Helper to get item title
	function getItemTitle(item: CollectionItem): string {
		return item.titleInfo?.[0]?.title || 'Untitled';
	}

	// Helper to check if item matches a location
	function itemMatchesLocation(item: CollectionItem, locationType: string, locationName: string, country?: string): boolean {
		const origins = item.location?.origin || [];
		const current = item.location?.current || [];

		for (const origin of origins) {
			if (locationType === 'country' && origin.l1 === locationName) return true;
			if (locationType === 'city' && origin.l3 === locationName && (!country || origin.l1 === country)) return true;
			if (locationType === 'region' && origin.l2 === locationName && (!country || origin.l1 === country)) return true;
		}

		if (locationType === 'other') {
			return current.includes(locationName);
		}

		return false;
	}

	// Combine location data with enriched coordinates and items
	let markers = $derived.by(() => {
		const markerMap = new Map<string, MarkerData>();

		if (!enrichedLocations) {
			return [];
		}

		// Aggregate counts by location
		const countryCounts = new Map<string, number>();
		const cityCounts = new Map<string, number>();

		data.forEach((d) => {
			if (d.country) {
				countryCounts.set(d.country, (countryCounts.get(d.country) || 0) + d.count);
			}
			if (d.city && d.country) {
				const key = `${d.city}|${d.country}`;
				cityCounts.set(key, (cityCounts.get(key) || 0) + d.count);
			}
		});

		// Add city markers (more specific)
		cityCounts.forEach((count, key) => {
			const cityData = enrichedLocations.cities[key];
			if (cityData?.latitude && cityData?.longitude) {
				const [cityName, countryName] = key.split('|');
				const matchingItems = items
					.filter(item => itemMatchesLocation(item, 'city', cityName, countryName))
					.slice(0, 10)
					.map(item => ({ title: getItemTitle(item), type: item.typeOfResource || 'Unknown' }));

				markerMap.set(key, {
					name: cityData.wikidata_label || cityName,
					latitude: cityData.latitude,
					longitude: cityData.longitude,
					count,
					type: 'city',
					wikidataId: cityData.wikidata_id || undefined,
					items: matchingItems
				});
			}
		});

		// Add country markers
		countryCounts.forEach((count, country) => {
			const hasCities = Array.from(cityCounts.keys()).some((key) => key.endsWith(`|${country}`));
			const countryData = enrichedLocations.countries[country];

			if (countryData?.latitude && countryData?.longitude) {
				const adjustedCount = hasCities ? Math.ceil(count * 0.3) : count;
				const matchingItems = items
					.filter(item => itemMatchesLocation(item, 'country', country))
					.slice(0, 10)
					.map(item => ({ title: getItemTitle(item), type: item.typeOfResource || 'Unknown' }));

				markerMap.set(`country:${country}`, {
					name: countryData.wikidata_label || country,
					latitude: countryData.latitude,
					longitude: countryData.longitude,
					count: adjustedCount,
					type: 'country',
					wikidataId: countryData.wikidata_id || undefined,
					items: matchingItems
				});
			}
		});

		// Also check "other" locations (current locations)
		data.forEach((d) => {
			const currentLoc = enrichedLocations.other[d.city] || enrichedLocations.other[d.country];
			if (currentLoc?.latitude && currentLoc?.longitude) {
				const key = `other:${currentLoc.original_name}`;
				if (!markerMap.has(key)) {
					const matchingItems = items
						.filter(item => itemMatchesLocation(item, 'other', currentLoc.original_name))
						.slice(0, 10)
						.map(item => ({ title: getItemTitle(item), type: item.typeOfResource || 'Unknown' }));

					markerMap.set(key, {
						name: currentLoc.wikidata_label || currentLoc.original_name,
						latitude: currentLoc.latitude,
						longitude: currentLoc.longitude,
						count: d.count,
						type: 'other',
						wikidataId: currentLoc.wikidata_id || undefined,
						items: matchingItems
					});
				}
			}
		});

		return Array.from(markerMap.values());
	});

	// Calculate max count for scaling
	let maxCount = $derived(Math.max(...markers.map((m) => m.count), 1));

	// Get marker radius based on count
	function getMarkerRadius(count: number): number {
		const minRadius = 8;
		const maxRadius = 40;
		const scale = Math.sqrt(count / maxCount);
		return minRadius + scale * (maxRadius - minRadius);
	}

	// Get marker color based on type
	function getMarkerColor(type: string): string {
		switch (type) {
			case 'city':
				return '#3b82f6'; // blue
			case 'country':
				return '#10b981'; // green
			default:
				return '#8b5cf6'; // purple
		}
	}

	function initializeMap() {
		if (!mapContainer || map) return;

		map = new maplibregl.Map({
			container: mapContainer,
			style: 'https://demotiles.maplibre.org/style.json',
			center: [10, 20],
			zoom: 2
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		map.on('load', () => {
			mapReady = true;
			updateMarkers();
		});
	}

	function updateMarkers() {
		if (!map || !mapReady) return;

		// Remove existing markers
		const existingMarkers = document.querySelectorAll('.location-marker');
		existingMarkers.forEach((el) => el.remove());

		// Add new markers
		markers.forEach((markerData) => {
			const radius = getMarkerRadius(markerData.count);
			const color = getMarkerColor(markerData.type);

			// Create marker element
			const el = document.createElement('div');
			el.className = 'location-marker';
			el.style.width = `${radius * 2}px`;
			el.style.height = `${radius * 2}px`;
			el.style.backgroundColor = color;
			el.style.opacity = '0.7';
			el.style.borderRadius = '50%';
			el.style.border = '2px solid white';
			el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
			el.style.cursor = 'pointer';
			el.style.display = 'flex';
			el.style.alignItems = 'center';
			el.style.justifyContent = 'center';
			el.style.color = 'white';
			el.style.fontSize = radius > 20 ? '12px' : '10px';
			el.style.fontWeight = 'bold';
			el.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';

			if (radius > 15) {
				el.textContent = markerData.count.toString();
			}

			// Build document list HTML
			const itemsHtml = markerData.items.length > 0
				? `<ul style="margin: 8px 0 0 0; padding-left: 16px; font-size: 12px; max-height: 150px; overflow-y: auto;">
					${markerData.items.map(item =>
						`<li style="margin-bottom: 4px;">
							<span style="color: #333;">${item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title}</span>
							<span style="color: #888; font-size: 10px;"> (${item.type})</span>
						</li>`
					).join('')}
					${markerData.count > markerData.items.length ? `<li style="color: #888; font-style: italic;">...and ${markerData.count - markerData.items.length} more</li>` : ''}
				</ul>`
				: '<p style="margin-top: 8px; color: #888; font-size: 12px;">No documents found</p>';

			// Create popup content
			const popupContent = `
				<div style="padding: 8px; max-width: 280px;">
					<strong style="font-size: 14px;">${markerData.name}</strong>
					<div style="margin-top: 4px;">
						<span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
							${markerData.type}
						</span>
						<span style="margin-left: 8px; font-size: 12px; color: #666;">
							<strong>${markerData.count}</strong> item${markerData.count !== 1 ? 's' : ''}
						</span>
					</div>
					${itemsHtml}
					${markerData.wikidataId ? `<div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;"><a href="https://www.wikidata.org/wiki/${markerData.wikidataId}" target="_blank" style="font-size: 11px; color: #3b82f6;">View on Wikidata</a></div>` : ''}
				</div>
			`;

			const popup = new maplibregl.Popup({
				offset: radius,
				closeButton: true,
				closeOnClick: false,
				maxWidth: '300px'
			}).setHTML(popupContent);

			new maplibregl.Marker({ element: el })
				.setLngLat([markerData.longitude, markerData.latitude])
				.setPopup(popup)
				.addTo(map!);
		});

		// Fit bounds to show all markers
		if (markers.length > 0) {
			const bounds = new maplibregl.LngLatBounds();
			markers.forEach((m) => {
				bounds.extend([m.longitude, m.latitude]);
			});
			map.fitBounds(bounds, { padding: 50, maxZoom: 6 });
		}
	}

	// Watch for marker changes and update when ready
	$effect(() => {
		if (mapReady && markers.length > 0) {
			updateMarkers();
		}
	});

	// Initialize map when container is available
	$effect(() => {
		if (mapContainer && !map && enrichedLocations) {
			initializeMap();
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});
</script>

<div class={cn('w-full h-full min-h-[400px] flex flex-col', className)}>
	{#if title}
		<h3 class="text-lg font-semibold text-center mb-4">{title}</h3>
	{/if}

	{#if !enrichedLocations}
		<div class="flex-1 flex items-center justify-center bg-muted rounded-lg">
			<div class="text-center text-muted-foreground p-4">
				<p class="mb-2">Enriched location data not available.</p>
				<p class="text-sm">
					Run <code class="bg-background px-2 py-1 rounded">python scripts/reconcile_locations.py</code>
					to generate GPS coordinates.
				</p>
			</div>
		</div>
	{:else if markers.length === 0 && mapReady}
		<div class="flex-1 flex items-center justify-center bg-muted rounded-lg">
			<p class="text-muted-foreground">No locations with coordinates found</p>
		</div>
	{:else}
		<div class="flex-1 relative rounded-lg overflow-hidden border" style="min-height: 400px;">
			<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>
		</div>

		<!-- Legend -->
		<div class="mt-3 flex flex-wrap gap-4 justify-center text-sm">
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 rounded-full bg-[#3b82f6] opacity-70"></div>
				<span class="text-muted-foreground">City</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 rounded-full bg-[#10b981] opacity-70"></div>
				<span class="text-muted-foreground">Country</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 rounded-full bg-[#8b5cf6] opacity-70"></div>
				<span class="text-muted-foreground">Other</span>
			</div>
			<div class="text-muted-foreground">
				<span class="font-medium">{markers.length}</span> locations |
				<span class="font-medium">{data.reduce((sum, d) => sum + d.count, 0)}</span> items
			</div>
		</div>
	{/if}
</div>
