<script lang="ts">
	import { DateTime } from 'luxon';
	import EntryEditor from './entry-editor.svelte';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconTrash, IconPhoto, IconLocation, IconDotsVertical } from '@tabler/icons-svelte';
	import { invalidateAll } from '$app/navigation';

	const {
		entry,
		showDate = true
	}: {
		entry: {
			id: string;
			createdAt: string | Date;
			content: string;
		};
		showDate?: boolean;
	} = $props();

	const createdAt = $derived(DateTime.fromJSDate(new Date(entry.createdAt)));
	const dateString = $derived(createdAt.toFormat('d MMM yyyy'));
	const timeString = $derived(createdAt.toFormat('h:mm a'));

	function deleteItem(id: string) {
		const body = new FormData();
		body.set('id', id);
		fetch('?/delete', { method: 'POST', body });
		invalidateAll();
	}
</script>

<div class="relative rounded-xl p-2">
	<div
		class={cn(
			'absolute -left-4 size-2 bg-secondary-foreground rounded-full -translate-x-5/12',
			showDate ? 'top-5' : 'top-4'
		)}
	></div>
	<div class="flex flex-col gap-2 w-full">
		{#if showDate}
			<h2 class="text-2xl font-heading">{dateString}</h2>
		{/if}
		<div class="flex gap-3 justify-between">
			<div class="flex flex-col gap-2 w-full">
				<div class="relative font-heading w-full">
					<EntryEditor id={entry.id} content={entry.content} placeholder="Write something..." />
				</div>
				<p class="text-sm text-muted-foreground">{timeString}</p>
				{#if entry.id !== 'new'}
					<div class="flex flex-row gap-2">
						<Button variant="secondary">
							<IconPhoto />
							Add Photos
						</Button>
						<Button variant="secondary">
							<IconLocation />
							Add Location
						</Button>
						<div class="grow"></div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="ghost" size="icon">
										<IconDotsVertical />
										<span class="sr-only">Open menu</span>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>

							<DropdownMenu.Content class="w-40" align="end">
								<DropdownMenu.Item class="text-destructive" onSelect={() => deleteItem(entry.id)}>
									<IconTrash stroke={2} />
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
