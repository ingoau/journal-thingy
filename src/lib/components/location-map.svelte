<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';

	let {
		latitude,
		longitude,
		class: className = ''
	}: {
		latitude: number;
		longitude: number;
		class?: string;
	} = $props();

	let container = $state<HTMLDivElement>();

	onMount(() => {
		let map: L.Map | undefined;
		let cancelled = false;

		import('leaflet').then((module) => {
			if (cancelled || !container) return;

			const leaflet = module.default;

			map = leaflet.map(container, {
				center: [latitude, longitude],
				zoom: 13,
				scrollWheelZoom: false,
				dragging: false,
				zoomControl: false,
				doubleClickZoom: false,
				touchZoom: false,
				attributionControl: false
			});

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
				.addTo(map);

			leaflet.marker([latitude, longitude]).addTo(map);
		});

		return () => {
			cancelled = true;
			map?.remove();
		};
	});
</script>

<div bind:this={container} class={className}></div>
