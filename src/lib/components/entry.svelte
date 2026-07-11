<script lang="ts">
	import { DateTime } from 'luxon';
	import { cn } from '$lib/utils';

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
		contentOverride = html;
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
							<div class="entry-content">{@html content}</div>
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
							{@html content}
						</div>
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
