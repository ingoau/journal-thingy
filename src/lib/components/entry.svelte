<script lang="ts">
	import { DateTime } from 'luxon';
	import EntryEditor from './entry-editor.svelte';
	import { cn } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		IconTrash,
		IconPhoto,
		IconLocation,
		IconDotsVertical,
		IconX,
		IconMicrophone,
		IconPlayerStopFilled,
		IconLoader2
	} from '@tabler/icons-svelte';
	import { invalidateAll } from '$app/navigation';
	import { createUploadThing } from '$lib/utils/uploadthing';
	import type { entry as entryTable } from '$lib/server/db/schema';
	import { onDestroy } from 'svelte';

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
	let insertText = $state<(text: string) => void>();
	let recording = $state(false);
	let transcribing = $state(false);
	let voiceError = $state<string | null>(null);

	let mediaRecorder: MediaRecorder | null = null;
	let mediaStream: MediaStream | null = null;
	let recordedChunks: BlobPart[] = [];

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

	function pickRecorderMimeType(): string | undefined {
		const candidates = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/mp4',
			'audio/ogg;codecs=opus'
		];
		return candidates.find((type) => MediaRecorder.isTypeSupported(type));
	}

	function stopMediaTracks() {
		mediaStream?.getTracks().forEach((track) => track.stop());
		mediaStream = null;
	}

	async function startRecording() {
		voiceError = null;
		recordedChunks = [];

		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			voiceError = 'Microphone permission is required for voice typing.';
			return;
		}

		const mimeType = pickRecorderMimeType();
		mediaRecorder = mimeType
			? new MediaRecorder(mediaStream, { mimeType })
			: new MediaRecorder(mediaStream);

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) recordedChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			void handleRecordingStop(mediaRecorder?.mimeType || mimeType || 'audio/webm');
		};

		mediaRecorder.start();
		recording = true;
	}

	function stopRecording() {
		if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
		recording = false;
		mediaRecorder.stop();
	}

	async function handleRecordingStop(mimeType: string) {
		stopMediaTracks();
		mediaRecorder = null;

		const blob = new Blob(recordedChunks, { type: mimeType });
		recordedChunks = [];

		if (blob.size === 0) {
			voiceError = 'No audio was captured. Try again.';
			return;
		}

		transcribing = true;
		voiceError = null;

		try {
			const extension = mimeType.includes('mp4')
				? 'm4a'
				: mimeType.includes('ogg')
					? 'ogg'
					: 'webm';
			const formData = new FormData();
			formData.set('audio', blob, `recording.${extension}`);

			const response = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const message =
					response.status === 500
						? 'Voice transcription is not configured.'
						: 'Could not transcribe audio. Try again.';
				voiceError = message;
				return;
			}

			const data = (await response.json()) as { transcript?: string };
			const transcript = data.transcript?.trim();
			if (!transcript) {
				voiceError = 'Nothing was transcribed. Try speaking a bit longer.';
				return;
			}

			insertText?.(transcript);
		} catch {
			voiceError = 'Could not reach the transcription service.';
		} finally {
			transcribing = false;
		}
	}

	async function toggleVoiceTyping() {
		if (transcribing) return;
		if (recording) {
			stopRecording();
			return;
		}
		await startRecording();
	}

	onDestroy(() => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.onstop = null;
			mediaRecorder.stop();
		}
		stopMediaTracks();
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
					<EntryEditor
						id={entry.id}
						content={entry.content}
						placeholder="Write something..."
						bind:insertText
					/>
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
					<div class="flex flex-row gap-2 items-center">
						<Button variant="secondary" onclick={pickPhotos} disabled={$isUploading}>
							<IconPhoto />
							{$isUploading ? 'Uploading...' : 'Add Photos'}
						</Button>
						<Button variant="secondary">
							<IconLocation />
							Add Location
						</Button>
						<div class="grow"></div>
						<Button
							variant="ghost"
							size="icon"
							class={cn(recording && 'text-destructive animate-pulse')}
							onclick={toggleVoiceTyping}
							disabled={transcribing}
							aria-pressed={recording}
						>
							{#if transcribing}
								<IconLoader2 class="animate-spin" />
								<span class="sr-only">Transcribing</span>
							{:else if recording}
								<IconPlayerStopFilled />
								<span class="sr-only">Stop voice typing</span>
							{:else}
								<IconMicrophone />
								<span class="sr-only">Start voice typing</span>
							{/if}
						</Button>
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
					{#if voiceError}
						<p class="text-sm text-destructive">{voiceError}</p>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
