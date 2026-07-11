<script lang="ts">
	import Entry from '$lib/components/entry.svelte';
	import NewEntry from '$lib/components/new-entry.svelte';
	import { DateTime } from 'luxon';
	import { cn } from '$lib/utils';

	const { data } = $props();

	const entries = $derived(data.entries);

	const createShowDate = $derived(
		entries.length === 0 || dayKey(new Date()) !== dayKey(entries[0].createdAt)
	);

	function dayKey(createdAt: string | Date) {
		return DateTime.fromJSDate(new Date(createdAt)).toFormat('yyyy-MM-dd');
	}
</script>

<div class="mx-auto max-w-3xl w-full p-6">
	<div class="relative ml-4 border-secondary-foreground">
		<div class="fixed border-l h-full top-0"></div>
		{#each entries as entry, index (entry.id)}
			{@const isFirstOfDay =
				index === 0 || dayKey(entry.createdAt) !== dayKey(entries[index - 1].createdAt)}
			<div class={cn('relative pl-4 last:pb-0', isFirstOfDay ? 'pb-5' : 'pb-2')}>
				<Entry {entry} showDate={isFirstOfDay} />
			</div>
		{/each}
		<div class={cn('relative pl-4 last:pb-0', createShowDate ? 'pb-5' : 'pb-2')}>
			<NewEntry showDate={createShowDate} />
		</div>
	</div>
</div>
