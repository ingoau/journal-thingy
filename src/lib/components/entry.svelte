<script lang="ts">
	import { DateTime } from 'luxon';
	import EntryEditor from './entry-editor.svelte';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import {
		IconTrash,
		IconPhoto,
		IconLocation,
		IconDotsVertical,
		IconX
	} from '@tabler/icons-svelte';
	import { invalidateAll } from '$app/navigation';
	import { createUploadThing } from '$lib/utils/uploadthing';
	import type { entry as entryTable } from '$lib/server/db/schema';
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { onMount } from 'svelte';
	import type L from 'leaflet';
	import PickAPlace from "svelte-pick-a-place";
	import { tick } from 'svelte';

	let leaflet: typeof L = $state();

	onMount(async () => {
		const module = await import('leaflet');
		leaflet = module.default;
	});

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

	async function removeImage(url: string) {
		const body = new FormData();
		body.set('id', entry.id);
		body.set('url', url);
		await fetch('?/removeAttachment', { method: 'POST', body });
		await invalidateAll();
	}

	let location = $state({
		lat: 0,
		lng: 0
	});

	function handleLocationUpdate(event: { detail: { lat: never; lng: never; }; }) {
		const { lat, lng } = event.detail;

		location = {
			lat,
			lng
		}
	}

	async function saveLocation(event: SubmitEvent) {
		event.preventDefault();

		console.log(entry.id, {
			lat: location.lat,
			lng: location.lng
		});
	}

	function getCurrentLocation() {
		return new Promise<GeolocationPosition>((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error('Geolocation is not supported'));
				return;
			}

			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			});
		});
	}

	async function handleDialogOpen(open: boolean) {
		dialogOpen = open;

		if (open && location.lat === 0 && location.lng === 0) {
			try {
				const position = await getCurrentLocation();

				location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
			} catch (error) {
				console.error('Could not get location:', error);

				location = {
					lat: -33.8688,
					lng: 151.2093
				};
			}
		}
	}

	let dialogOpen = $state(false);

	$effect(() => {
		if (dialogOpen) {
			tick().then(() => {
				window.dispatchEvent(new Event('resize'));
			});
		}
	});

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
					<div class="flex overflow-x-auto gap-2 rounded-lg overflow-hidden">
						{#each entry.attachments as attachment, index (`${attachment.type}-${index}`)}
							{#if attachment.type === 'image'}
								<div class="group relative shrink-0">
									<img src={attachment.url} alt="" class="max-h-48 rounded-lg object-cover" />
									<Button
										variant="secondary"
										size="icon"
										class="absolute top-1 right-1 size-7 opacity-0 transition-opacity group-hover:opacity-100"
										onclick={() => removeImage(attachment.url)}
									>
										<IconX class="size-4" />
										<span class="sr-only">Remove image</span>
									</Button>
								</div>
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
						<Dialog.Root onOpenChange={handleDialogOpen}>
							<form onsubmit={saveLocation}>
								<Dialog.Trigger
									type="button"
									class={buttonVariants({ variant: "secondary" })}
								>
									<IconLocation />
									Add Location
								</Dialog.Trigger>
								<Dialog.Content class="sm:max-w-106.25 w-full overflow-hidden rounded-lg">
									<Dialog.Header>
										<Dialog.Title>Add location</Dialog.Title>
										<Dialog.Description>
											Pick a location to add to your entry
										</Dialog.Description>
									</Dialog.Header>
									{#if dialogOpen && leaflet}
										<div class="h-75 overflow-hidden">
											{#key `${location.lat}-${location.lng}`}
												<PickAPlace
													leaflet={leaflet}
													lat={location.lat}
													lng={location.lng}
													zoom={13}
													selectionModes={["point"]}
													on:update={handleLocationUpdate}
													buttons={false}
												/>
											{/key}
										</div>
									{/if}
									<Dialog.Footer>
										<Dialog.Close
											type="button"
											class={buttonVariants({ variant: "outline" })}
										>
											Cancel
										</Dialog.Close>
										<Button type="submit">Save changes</Button>
									</Dialog.Footer>
								</Dialog.Content>
							</form>
						</Dialog.Root>
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
