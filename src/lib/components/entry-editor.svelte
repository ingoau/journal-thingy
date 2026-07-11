<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { StarterKit } from '@tiptap/starter-kit';

	const {
		id,
		content,
		clickCoords = null,
		onsave,
		onclose
	}: {
		id: string;
		content: string;
		clickCoords?: { x: number; y: number } | null;
		onsave?: (html: string) => void;
		onclose?: () => void;
	} = $props();

	let element = $state<HTMLDivElement>();
	let editor: Editor | null = null;

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit],
			content,
			onBlur: async () => {
				const html = editor?.getHTML();
				if (html != null) {
					if (html !== content) {
						const body = new FormData();
						body.set('id', id);
						body.set('content', html);
						await fetch('?/update', { method: 'POST', body });
					}
					onsave?.(html);
				}
				onclose?.();
			}
		});

		void (async () => {
			await tick();

			requestAnimationFrame(() => {
				if (!editor) return;

				if (clickCoords) {
					const pos = editor.view.posAtCoords({
						left: clickCoords.x,
						top: clickCoords.y
					});

					if (pos) {
						editor.commands.setTextSelection(pos.pos);
					}
				}

				editor.commands.focus();
			});
		})();
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div bind:this={element} class="entry-content"></div>

<style>
	:global(.entry-content .ProseMirror) {
		outline: none;
	}

	:global(.entry-content .ProseMirror h1) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.entry-content .ProseMirror h2) {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.entry-content .ProseMirror p + p) {
		margin-top: 0.5rem;
	}
</style>
