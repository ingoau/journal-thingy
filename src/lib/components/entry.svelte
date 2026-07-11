<script lang="ts">
	import { IconStar, IconStarFilled } from '@tabler/icons-svelte';
	import { DateTime } from 'luxon';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
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

	let score = $state(entry.score || 0);
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

<Dialog.Root>
	<Dialog.Trigger class="w-full text-left">
		{#snippet child({ props })}
			<div {...props} class="relative rounded-md p-2 transition-colors hover:bg-muted/50">
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
							<div class="font-heading p-1">{entry.content}</div>
							<p class="text-sm text-muted-foreground">{timeString}</p>
						</div>
						{#if !showDate}
							{@render stars('shrink-0 pt-1')}
						{/if}
					</div>
				</div>
			</div>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{dateString}</Dialog.Title>
			<Dialog.Description>
				<div class="flex gap-2 justify-between items-end">
					<h3 class="text-2xl font-heading">Mood</h3>
					<h4 class="font-heading text-1xl">{score}</h4>
				</div>
				<Slider type="single" bind:value={score} max={5} step={1} />
				<br />
				<Textarea placeholder="Write here" />
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
