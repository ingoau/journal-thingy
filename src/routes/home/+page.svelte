<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';
	import Entry from '$lib/components/entry.svelte';

	const {data} = $props();

</script>

<!--Sidebar-->
<Sidebar />


<div class="mx-auto max-w-3xl w-full p-6">
	{#each data.entries as entry, index (index)}
<Entry entry={entry}/>	{/each}
<form method="POST" action="?/test">
	<button type="submit">Submit</button>
</form>
</div>

