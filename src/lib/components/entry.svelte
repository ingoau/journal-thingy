<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { StarterKit } from '@tiptap/starter-kit';
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

	let element = $state<HTMLDivElement>();
	let editor: Editor | null = null;

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit],
			content: entry.content
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

{#snippet stars(className?: string)}
	<div class={cn('flex flex-row gap-1', className)}>
		{#each Array(5), index (index)}
			{#if index < moodScore}
				<IconStarFilled stroke={2} />
			{:else}
				<IconStar stroke={2} />
			{/if}
		{/each}
	</div>
{/snippet}

<div class="relative rounded-xl p-2">
	<div
		class={cn(
			'absolute -left-4 size-2 bg-secondary-foreground rounded-full -translate-x-5/12',
			showDate ? 'top-5' : 'top-5'
		)}
	></div>
	<div class="flex flex-col gap-2 w-full">
		{#if showDate}
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-heading">{dateString}</h2>
				{@render stars()}
			</div>
		{/if}
		<div class={cn('flex gap-3', showDate ? 'flex-col' : 'items-start justify-between')}>
			<div class={cn('flex flex-col', showDate ? 'gap-2' : 'gap-1 min-w-0')}>
				<div class="relative font-heading">
					<div bind:this={element}></div>
				</div>
				<p class="text-sm text-muted-foreground">{timeString}</p>
			</div>
			{#if !showDate}
				{@render stars('shrink-0 pt-1')}
			{/if}
		</div>
	</div>
</div>

<style>
	:global(.ProseMirror) {
		outline: none;
	}

	:global(.ProseMirror h1) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.ProseMirror h2) {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.ProseMirror p + p) {
		margin-top: 0.5rem;
	}
</style>
