<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Editor } from '@tiptap/core';
	import Placeholder from '@tiptap/extension-placeholder';
	import { StarterKit } from '@tiptap/starter-kit';

	let {
		id,
		content,
		placeholder,
		insertText = $bindable()
	}: {
		id: string;
		content: string;
		placeholder?: string;
		insertText?: (text: string) => void;
	} = $props();

	let element = $state<HTMLDivElement>();
	let editor: Editor | null = null;

	async function persist(html: string) {
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

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [StarterKit, ...(placeholder ? [Placeholder.configure({ placeholder })] : [])],
			content,
			onBlur: async () => {
				const html = editor?.getHTML();
				if (html == null) return;
				await persist(html);
			}
		});

		insertText = (text: string) => {
			const trimmed = text.trim();
			if (!trimmed || !editor) return;

			const paragraphs = trimmed
				.split(/\n+/)
				.map((line) => line.trim())
				.filter(Boolean);

			const isEmpty = editor.isEmpty;
			const html = paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join('');

			if (isEmpty) {
				editor.commands.setContent(html);
			} else {
				editor.commands.focus('end');
				editor.commands.insertContent(html);
			}

			void persist(editor.getHTML());
		};
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function escapeHtml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;');
	}
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
