<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Editor } from '@tiptap/core';
	import Placeholder from '@tiptap/extension-placeholder';
	import { StarterKit } from '@tiptap/starter-kit';

	const {
		id,
		content,
		placeholder
	}: {
		id: string;
		content: string;
		placeholder?: string;
	} = $props();

	let element = $state<HTMLDivElement>();
	let editor: Editor | null = null;

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit, ...(placeholder ? [Placeholder.configure({ placeholder })] : [])],
			content,
			onBlur: async () => {
				const html = editor?.getHTML();
				if (html == null) return;
				const isEmpty = html === '<p></p>' || html.trim() === '';
				if (id === 'new') {
					if (!isEmpty) {
						const body = new FormData();
						body.set('content', html);
						await fetch('?/create', { method: 'POST', body });
						await invalidateAll();
					}
					editor?.commands.clearContent();
				} else if (html !== content) {
					const body = new FormData();
					body.set('id', id);
					body.set('content', html);
					await fetch('?/update', { method: 'POST', body });
				}
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div bind:this={element} class="entry-content w-full"></div>

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

	:global(.entry-content .ProseMirror p.is-editor-empty:first-child::before),
	:global(.entry-content .ProseMirror p.is-empty::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		color: var(--muted-foreground);
	}
</style>
