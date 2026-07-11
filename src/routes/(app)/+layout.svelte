<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';

	let { children, data } = $props();
</script>

<Sidebar user={data.user} />
{@render children()}
