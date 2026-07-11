<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte';
	import Entry from '$lib/components/entry.svelte';

	const data = [
		{ date: 1783834820, content: 'content', score: 3 },
		{ date: 1783721820, content: 'content', score: 4 }
	];

</script>

<!--Sidebar-->
<Sidebar />


<div class="mx-auto max-w-3xl w-full p-6">
	{#each data as data, index (index)}
<Entry {data}/>	{/each}
	
</div>
