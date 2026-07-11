<script lang="ts">
	import { DateTime } from 'luxon';
	import SafeHtml from '$lib/components/safe-html.svelte';
	import { sanitizeEntryHtml } from '$lib/sanitize';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { IconTrash, IconMenu2 } from '@tabler/icons-svelte';
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

	let contentOverride = $state<string | null>(null);
	const content = $derived(contentOverride ?? entry.content);
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

	function handleSave(html: string) {
		contentOverride = sanitizeEntryHtml(html);
	}

	function deleteItem(id: string) {
		const body = new FormData();
		body.set('id', id);
		fetch('?/delete', { method: 'POST', body });
		invalidateAll()
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
			<div class="flex flex-col gap-2">
				<div class="relative font-heading">
					{#if editing}
						{#await import('./entry-editor.svelte')}
							<div class="entry-content"><SafeHtml html={content} /></div>
						{:then { default: EntryEditor }}
							<EntryEditor
								id={entry.id}
								{content}
								{clickCoords}
								onsave={handleSave}
								onclose={stopEditing}
							/>
						{/await}
					{:else}
						<div
							role="button"
							tabindex="0"
							class="entry-content w-full cursor-text text-left"
							onmousedown={startEditing}
						>
							<SafeHtml html={content} />
						</div>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground">{timeString}</p>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon">
							<IconMenu2 stroke={2} />
							<span class="sr-only">Open menu</span>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>

				<DropdownMenu.Content class="w-40" align="end">
					<DropdownMenu.Item
						class="text-destructive"
						onSelect={() => deleteItem(entry.id)}
					>
						<IconTrash stroke={2} />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</div>

<style>
	.entry-content {
		outline: none;
	}

	:global(.entry-content p:empty::before) {
		content: '\00a0';
	}

	:global(.entry-content h1) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.entry-content h2) {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.entry-content p + p) {
		margin-top: 0.5rem;
	}
</style>
