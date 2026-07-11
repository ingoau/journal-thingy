<script lang="ts">
	import { DateTime } from 'luxon';
	import EntryEditor from './entry-editor.svelte';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconTrash, IconPhoto, IconLocation, IconDotsVertical } from '@tabler/icons-svelte';
	import { invalidateAll } from '$app/navigation';
	import { createUploadThing } from '$lib/utils/uploadthing';
	import type { entry as entryTable } from '$lib/server/db/schema';

	const { startUpload, isUploading } = createUploadThing('imageUploader', {
		onClientUploadComplete: async (res) => {
			const file = res[0];
			if (!file) return;

			const body = new FormData();
			body.set('id', entry.id);
			body.set('url', file.ufsUrl);
			await fetch('?/addAttachment', { method: 'POST', body });
			await invalidateAll();
		}
	});

	const {
		entry,
		showDate = true
	}: {
		entry: Pick<typeof entryTable.$inferSelect, 'id' | 'createdAt' | 'content'> & {
			attachments?: typeof entryTable.$inferSelect.attachments;
		};
		showDate?: boolean;
	} = $props();

	let fileInput = $state<HTMLInputElement>();

	const createdAt = $derived(DateTime.fromJSDate(new Date(entry.createdAt)));
	const dateString = $derived(createdAt.toFormat('d MMM yyyy'));
	const timeString = $derived(createdAt.toFormat('h:mm a'));

	function deleteItem(id: string) {
		const body = new FormData();
		body.set('id', id);
		fetch('?/delete', { method: 'POST', body });
		invalidateAll();
	}

	function pickPhotos() {
		fileInput?.click();
	}

	async function handleFileSelect(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		input.value = '';
		await startUpload([file]);
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
				{#if entry.attachments?.length}
					<div class="flex flex-wrap gap-2">
						{#each entry.attachments as attachment, index (`${attachment.type}-${index}`)}
							{#if attachment.type === 'image'}
								<img
									src={attachment.url}
									alt=""
									class="max-h-48 rounded-lg object-cover"
								/>
							{/if}
						{/each}
					</div>
				{/if}
				{#if entry.id !== 'new'}
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handleFileSelect}
					/>
					<div class="flex flex-row gap-2">
						<Button variant="secondary" onclick={pickPhotos} disabled={$isUploading}>
							<IconPhoto />
							{$isUploading ? 'Uploading...' : 'Add Photos'}
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
