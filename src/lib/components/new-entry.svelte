<script lang="ts">
	import Entry from './entry.svelte';

	let { showDate = true }: { showDate?: boolean } = $props();
</script>

<div class="opacity-50">
	<Entry entry={{ id: 'new', content: '<p></p>', createdAt: new Date() }} {showDate} />
</div>
