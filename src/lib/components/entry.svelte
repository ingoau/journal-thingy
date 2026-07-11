<script lang="ts">
	import { IconStar, IconStarFilled } from '@tabler/icons-svelte';
	import { DateTime } from 'luxon';
	import { cn } from '$lib/utils';

	const {
		entry,
		showDate = true
	}: {
		entry: {
			createdAt: string | Date;
			content: string;
			score: number | null;
		};
		showDate?: boolean;
	} = $props();

	const createdAt = $derived(DateTime.fromJSDate(new Date(entry.createdAt)));
	const dateString = $derived(createdAt.toFormat('d MMM yyyy'));
	const timeString = $derived(createdAt.toFormat('h:mm a'));
	const moodScore = $derived(entry.score || 0);

	let editing = $state(false);
	let clickCoords = $state<{ x: number; y: number } | null>(null);

	function startEditing(event: MouseEvent) {
		clickCoords = { x: event.clientX, y: event.clientY };
		editing = true;
	}

	function stopEditing() {
		editing = false;
		clickCoords = null;
	}
</script>

<div class="relative rounded-xl p-2">
	<div
		class={cn(
			'absolute -left-4 size-2 bg-secondary-foreground rounded-full -translate-x-5/12',
			showDate ? 'top-5' : 'top-5'
		)}
	></div>
	<div class="flex flex-col gap-2 w-full">
		{#if showDate}
			<h2 class="text-2xl font-heading">{dateString}</h2>
		{/if}
		<div class="flex gap-3 flex-col">
			<div class="flex flex-col gap-2">
				<div class="relative font-heading">
					{#if editing}
						{#await import('./entry-editor.svelte')}
							<p class="entry-content">{entry.content}</p>
						{:then { default: EntryEditor }}
							<EntryEditor content={entry.content} {clickCoords} onclose={stopEditing} />
						{/await}
					{:else}
						<button
							type="button"
							class="entry-content w-full cursor-text text-left"
							onmousedown={startEditing}
						>
							{entry.content}
						</button>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground">{timeString}</p>
			</div>
		</div>
	</div>
</div>

<style>
	.entry-content {
		outline: none;
	}
</style>
